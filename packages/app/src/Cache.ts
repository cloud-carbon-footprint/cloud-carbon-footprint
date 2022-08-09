/*
 * © 2021 Thoughtworks, Inc.
 */

import moment, { Moment, unitOfTime } from 'moment'
import R from 'ramda'
import {
  configLoader,
  EstimationResult,
  getPeriodEndDate,
  GroupBy,
  Logger,
} from '@cloud-carbon-footprint/common'
import { EstimationRequest } from './CreateValidRequest'
import GoogleCloudCacheManager from './GoogleCloudCacheManager'
import LocalCacheManager from './LocalCacheManager'
import CacheManager from './CacheManager'
import MongoDbCacheManager from './MongoDbCacheManager'

/*
 This function provides a decorator. When this decorates a function, that
 function passes itself into the cache() as @descriptor. The cache() function
 then combines and returns data from the cache and decorated function.
 */
export default function cache(): any {
  const cacheManagerServices: { [key: string]: CacheManager } = {
    GCS: new GoogleCloudCacheManager(),
    LOCAL: new LocalCacheManager(),
    MONGODB: new MongoDbCacheManager(),
  }

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const cacheLogger = new Logger('Cache')
    const decoratedFunction = descriptor.value

    descriptor.value = async (
      request: EstimationRequest,
    ): Promise<EstimationResult[]> => {
      // References the getCostAndEstimates function that this is decorating
      const getCostAndEstimates = (request: EstimationRequest) =>
        decoratedFunction.apply(target, [request])

      const grouping =
        (request.groupBy as GroupBy) || configLoader().GROUP_QUERY_RESULTS_BY

      // Determine if cache is ignored and get fresh estimates
      if (request.ignoreCache && !process.env.TEST_MODE) {
        cacheLogger.info('Ignoring cache...')
        const [newEstimates] = await getEstimatesForMissingDates(
          getCostAndEstimates,
          request,
        )
        return newEstimates
      }

      // Configure cache manager service and load existing cached estimates (if any)
      const cacheManager =
        cacheManagerServices[configLoader().CACHE_MODE] ||
        cacheManagerServices.LOCAL

      if (configLoader().CACHE_MODE === 'MONGODB') {
        request = paginateRequest(request)
      }

      const cachedEstimates: EstimationResult[] =
        await cacheManager.getEstimates(request, grouping)

      // TODO: Refactor this so cache isn't aware of test environment
      if (process.env.TEST_MODE) return cachedEstimates

      const [newEstimates, missingDates] = await getEstimatesForMissingDates(
        getCostAndEstimates,
        request,
        cachedEstimates,
      )

      // Write missing estimates to cache
      if (newEstimates.length > 0) {
        const estimatesToPersist = fillDates(
          missingDates,
          newEstimates,
          grouping,
        )
        cacheLogger.info('Setting new estimates to cache file...')
        if (estimatesToPersist.length > 0) {
          await cacheManager.setEstimates(estimatesToPersist, grouping)
        }
      }

      // Filter out empty estimates
      const filteredCachedEstimates = cachedEstimates.filter(
        ({ serviceEstimates }) => {
          return serviceEstimates.length !== 0
        },
      )

      // Return new estimates with cached estimates
      return concat(filteredCachedEstimates, newEstimates)
    }
  }
}

/**
 * Populates and fetches new estimates for dates missing from the cache
 * (Returns results for entire formatted date range if cachedEstimates is not provided)
 * @param getCostAndEstimates               - Function that returns estimates for a given request
 * @param request                           - Original request object with start and end date
 * @param cachedEstimates                   - Optional array of existing EstimationResults (i.e. cache)
 * @returns [EstimationResult[], Moment[]]  - Promise containing an array of fulfilled estimation requests
 *                                           and the missing dates used for the request
 */
const getEstimatesForMissingDates = async (
  getCostAndEstimates: any,
  request: EstimationRequest,
  cachedEstimates: EstimationResult[] = [],
): Promise<[EstimationResult[], Moment[]]> => {
  const missingDates = getMissingDates(cachedEstimates, request)
  const missingEstimates = getMissingDataRequests(missingDates, request).map(
    (request) => {
      return getCostAndEstimates(request)
    },
  )
  const newEstimates = (await Promise.all(missingEstimates)).flat()
  return [newEstimates, missingDates]
}

const getMissingDates = (
  cachedEstimates: EstimationResult[],
  request: EstimationRequest,
): Moment[] => {
  const cachedDates: Moment[] = cachedEstimates.map(({ timestamp }) => {
    return moment.utc(timestamp)
  })
  cachedDates.sort((a, b) => {
    return a.valueOf() - b.valueOf()
  })

  const dates: Moment[] = []
  const missingDates: Moment[] = []
  const unitOfTime =
    request.groupBy === 'week'
      ? 'isoWeek'
      : (request.groupBy as moment.unitOfTime.StartOf)
  const current = moment.utc(request.startDate).startOf(unitOfTime)
  const end = moment.utc(request.endDate)
  while (current <= end) {
    dates.push(moment.utc(current.toDate()))
    current.add(1, request.groupBy as moment.unitOfTime.DurationConstructor)
  }
  dates.forEach((date) => {
    const dateIsCached = !!cachedDates.find((cachedDate) => {
      return cachedDate.toDate().getTime() == date.toDate().getTime()
    })

    if (!dateIsCached) missingDates.push(date)
  })
  return missingDates
}

const getMissingDataRequests = (
  missingDates: Moment[],
  request: EstimationRequest,
): EstimationRequest[] => {
  const groupMissingDates = missingDates.reduce((acc, date) => {
    const lastSubArray = acc[acc.length - 1]

    if (
      !lastSubArray ||
      !moment
        .utc(date)
        .subtract(1, request.groupBy as any)
        .isSame(lastSubArray[lastSubArray.length - 1])
    ) {
      acc.push([])
    }

    acc[acc.length - 1].push(date.clone())

    return acc
  }, [])

  const requestDates = groupMissingDates.map((group) => {
    return {
      start: group[0],
      end: moment(group[group.length - 1]).endOf(
        request.groupBy as moment.unitOfTime.StartOf,
      ),
    }
  })

  return requestDates.map((dates) => {
    return {
      startDate: dates.start.utc().toDate(),
      endDate: dates.end.utc().toDate(),
      ignoreCache: false,
      groupBy: request.groupBy,
      region: request.region,
    }
  })
}

const concat = (
  cachedEstimates: EstimationResult[],
  estimates: EstimationResult[],
) => {
  return [...cachedEstimates, ...estimates].sort((a, b) => {
    return a.timestamp.getTime() - b.timestamp.getTime()
  })
}

const fillDates = (
  missingDates: Moment[],
  estimates: EstimationResult[],
  grouping: GroupBy,
): EstimationResult[] => {
  const dates: Moment[] = estimates.map(({ timestamp }) => {
    return moment.utc(timestamp)
  })

  const difference = R.difference(missingDates, dates)
  const emptyEstimates = difference.map((timestamp) => {
    return {
      timestamp: timestamp.toDate(),
      serviceEstimates: [],
      periodStartDate: timestamp.toDate(),
      periodEndDate: getPeriodEndDate(timestamp.toDate(), grouping),
      groupBy: grouping,
    }
  })
  return [...emptyEstimates, ...estimates].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  )
}

export const paginateRequest = (
  request: EstimationRequest,
): EstimationRequest => {
  const { startDate, endDate, groupBy, limit, skip } = request

  const start = moment
    .utc(startDate)
    .add(skip, `${groupBy}s` as unitOfTime.DurationConstructor)
    .toDate()

  const end = moment
    .utc(start)
    .add(limit - 1, `${groupBy}s` as unitOfTime.DurationConstructor)
    .toDate()

  return {
    ...request,
    startDate: start,
    endDate: end < endDate ? end : endDate,
  }
}
