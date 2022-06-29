/*
 * © 2021 Thoughtworks, Inc.
 */

import { EstimationResult, Logger } from '@cloud-carbon-footprint/common'
import { EstimationRequest } from './CreateValidRequest'
import moment from 'moment'

export default abstract class CacheManager {
  protected readonly cacheLogger: Logger

  protected constructor() {
    this.cacheLogger = new Logger('Cache')
  }

  /**
   * Returns cached estimates for the given request and grouping.
   *
   * @param request  Request the client is making
   * @param grouping String representing how the data is being grouped
   */
  abstract getEstimates(
    request: EstimationRequest,
    grouping: string,
  ): Promise<EstimationResult[]>

  /**
   * Sets cached estimates to the cache implementation.
   *
   * @param data     Data to be cached
   * @param grouping String representing how the data is being grouped
   */
  abstract setEstimates(data: EstimationResult[], grouping: string, subscriptionIds?: string): void

  protected filterEstimatesForRequest(
    request: EstimationRequest,
    estimates: EstimationResult[],
  ) {
    const startDate = moment.utc(request.startDate)
    const endDate = moment.utc(request.endDate)

    return estimates.filter(({ timestamp }) => {
      return moment
        .utc(timestamp)
        .isBetween(startDate, endDate, undefined, '[]')
    })
  }
}
