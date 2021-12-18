/*
 * © 2021 Thoughtworks, Inc.
 */

import moment, { Moment } from 'moment'
import R from 'ramda'
import {
  EstimationResult,
  configLoader,
  GroupBy,
} from '@cloud-carbon-footprint/common'
import { Logger } from '@cloud-carbon-footprint/common'
import CacheManager from './CacheManager'
import EstimatorCache from './EstimatorCache'
import { EstimationRequest } from './CreateValidRequest'

const cacheManager: EstimatorCache = new CacheManager()

function getMissingDates(
  cachedEstimates: EstimationResult[],
  request: EstimationRequest,
): Moment[] {
  const cachedDates: Moment[] = cachedEstimates.map(({ timestamp }) => {
    return moment.utc(timestamp)
  })
  cachedDates.sort((a, b) => {
    return a.valueOf() - b.valueOf()
  })

  // Note: this logic requires using 'day' as the unit to accumulate missing dates. Using a large unit (e.g. week/month) can
  // cause data discrepancies. We should redesign the cache to better support those groupBy options.
  const accumulateUnit = 'day'
  const missingDates: Moment[] = []

  const dateIndex = moment.utc(request.startDate)
  for (let i = 0; i < cachedDates.length; i++) {
    while (dateIndex.isBefore(cachedDates[i])) {
      missingDates.push(moment.utc(dateIndex.toDate()))
      dateIndex.add(1, accumulateUnit)
    }
    dateIndex.add(1, accumulateUnit)
  }

  while (dateIndex.isSameOrBefore(moment.utc(request.endDate))) {
    missingDates.push(moment.utc(dateIndex.toDate()))
    dateIndex.add(1, accumulateUnit)
  }
  return missingDates
}

function getMissingDataRequests(
  missingDates: Moment[],
  request: EstimationRequest,
): EstimationRequest[] {
  // Note: this logic requires using 'day' as the unit to accumulate missing dates. Using a large unit (e.g. week/month) can
  // cause data discrepancies. We should redesign the cache to better support those groupBy options.
  const accumulateUnit = 'day'
  const groupMissingDates = missingDates.reduce((acc, date) => {
    const lastSubArray = acc[acc.length - 1]

    if (
      !lastSubArray ||
      !moment
        .utc(date)
        .subtract(1, accumulateUnit)
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
      end: moment(group[group.length - 1]),
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

function concat(
  cachedEstimates: EstimationResult[],
  estimates: EstimationResult[],
) {
  return [...cachedEstimates, ...estimates].sort((a, b) => {
    return a.timestamp.getTime() - b.timestamp.getTime()
  })
}

function fillDates(
  missingDates: Moment[],
  estimates: EstimationResult[],
): EstimationResult[] {
  const dates: Moment[] = estimates.map(({ timestamp }) => {
    return moment.utc(timestamp)
  })

  const difference = R.difference(missingDates, dates)
  const emptyEstimates = difference.map((timestamp) => {
    return {
      timestamp: timestamp.toDate(),
      serviceEstimates: [],
    }
  })
  return [...emptyEstimates, ...estimates].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  )
}

/*
 This function provides a decorator. When this decorates a function, that
 function passes itself into the cache() as @descriptor. The cache() function
 then combines and returns data from the cache and decorated function.
 */
export default function cache(): any {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const cacheLogger = new Logger('cache')
    const decoratedFunction = descriptor.value

    descriptor.value = async (
      request: EstimationRequest,
    ): Promise<EstimationResult[]> => {
      const grouping =
        (request.groupBy as GroupBy) || configLoader().GROUP_QUERY_RESULTS_BY

      if (request.ignoreCache && !process.env.TEST_MODE) {
        cacheLogger.info('Ignoring cache...')
        return decoratedFunction.apply(target, [request])
      }
      const cachedEstimates: EstimationResult[] =
        await cacheManager.getEstimates(request, grouping)

      if (process.env.TEST_MODE) return cachedEstimates

      // get estimates for dates missing from the cache
      const missingDates = getMissingDates(cachedEstimates, request)
      const missingEstimates = getMissingDataRequests(
        missingDates,
        request,
      ).map((request) => {
        return decoratedFunction.apply(target, [request])
      })
      const estimates: EstimationResult[] = (
        await Promise.all(missingEstimates)
      ).flat()

      if (estimates.length > 0) {
        // write missing estimates to cache
        const estimatesToPersist = fillDates(missingDates, estimates)
        cacheLogger.info('Setting new estimates to cache file...')
        await cacheManager.setEstimates(estimatesToPersist, grouping)
      }

      // so we don't return results with no estimates
      const filteredCachedEstimates = cachedEstimates.filter(
        ({ serviceEstimates }) => {
          return serviceEstimates.length !== 0
        },
      )

      return concat(filteredCachedEstimates, estimates)
    }
  }
}
