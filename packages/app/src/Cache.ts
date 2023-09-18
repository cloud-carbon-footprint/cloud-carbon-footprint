/*
 * © 2021 Thoughtworks, Inc.
 */

import moment, { Moment } from 'moment'
import {
  configLoader,
  EstimationResult,
  GroupBy,
  Logger,
} from '@cloud-carbon-footprint/common'
import { EstimationRequest } from './CreateValidRequest'
import GoogleCloudCacheManager from './GoogleCloudCacheManager'
import LocalCacheManager from './LocalCacheManager'
import CacheManager from './CacheManager'
import MongoDbCacheManager from './MongoDbCacheManager'
import { concat, fillDates, filterCachedEstimates } from './common/helpers'

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

      const grouping = request.groupBy as GroupBy

      // Configure cache manager service and load existing cached estimates (if any)
      const cacheManager =
        cacheManagerServices[configLoader().CACHE_MODE] ||
        cacheManagerServices.LOCAL

      const missingDates: Moment[] = await cacheManager.getMissingDates(
        request,
        grouping,
      )

      // Determine if cache is ignored and get fresh estimates
      // TODO: Refactor this so cache isn't aware of test environment
      if (request.ignoreCache && !process.env.TEST_MODE) {
        cacheLogger.info('Ignoring cache...')
        return await getEstimatesForMissingDates(
          getCostAndEstimates,
          request,
          missingDates,
        )
      }

      let newEstimates: EstimationResult[] = []
      if (missingDates.length > 0) {
        newEstimates = await getEstimatesForMissingDates(
          getCostAndEstimates,
          request,
          missingDates,
        )

        // Write missing estimates to cache
        if (newEstimates.length > 0) {
          const estimatesToPersist = fillDates(
            missingDates,
            newEstimates,
            grouping,
          )
          cacheLogger.info('Setting new estimates to cache...')
          if (estimatesToPersist.length > 0) {
            await cacheManager.setEstimates(estimatesToPersist, grouping)
          }
        }
      }

      const cachedEstimates: EstimationResult[] =
        await cacheManager.getEstimates(request, grouping)

      // Filter out empty estimates
      return concat(filterCachedEstimates(cachedEstimates), [])
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
  missingDates: Moment[],
): Promise<EstimationResult[]> => {
  const missingEstimates = getMissingDataRequests(missingDates, request).map(
    (request) => {
      return getCostAndEstimates(request)
    },
  )
  return (await Promise.all(missingEstimates)).flat()
}

/**
 * Returns an array of EstimationRequests with start/end date timeframes for each missing date according to grouping method
 * @param missingDates - Array of missing dates
 * @param request     - Original request object with start and end date
 * @returns           - Array of EstimationRequests with start/end date timeframes for each missing date
 */
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
      cloudProviderToSeed: request.cloudProviderToSeed,
    }
  })
}
