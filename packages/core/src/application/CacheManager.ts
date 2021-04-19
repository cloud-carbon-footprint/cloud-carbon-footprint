/*
 * © 2021 Thoughtworks, Inc. All rights reserved.
 */

import moment from 'moment'
import EstimatorCache from './EstimatorCache'
import { EstimationResult } from './EstimationResult'
import { EstimationRequest } from './CreateValidRequest'
import EstimatorCacheFileSystem from './EstimatorCacheFileSystem'
import EstimatorCacheGoogleCloudStorage from './EstimatorCacheGoogleCloudStorage'
import configLoader from './ConfigLoader'

const cacheService: EstimatorCache = new EstimatorCacheFileSystem()
const googleCloudCacheService: EstimatorCache = new EstimatorCacheGoogleCloudStorage(
  configLoader().GCP.CACHE_BUCKET_NAME,
)

export default class CacheManager implements EstimatorCache {
  private readonly cacheMode: string

  constructor() {
    this.cacheMode = configLoader().CACHE_MODE
  }

  async getEstimates(request: EstimationRequest): Promise<EstimationResult[]> {
    let estimates

    switch (this.cacheMode) {
      case 'GCS':
        estimates = await googleCloudCacheService.getEstimates(request)
        break
      default:
        estimates = await cacheService.getEstimates(request)
        break
    }

    return estimates ? this.formatEstimates(request, estimates) : []
  }

  async setEstimates(estimates: EstimationResult[]): Promise<void> {
    switch (this.cacheMode) {
      case 'GCS':
        return googleCloudCacheService.setEstimates(estimates)
      default:
        return cacheService.setEstimates(estimates)
    }
  }

  private formatEstimates(
    request: EstimationRequest,
    estimates: EstimationResult[],
  ) {
    const formatDateToTime = (timestamp: string | Date) =>
      timestamp instanceof Date
        ? timestamp.getTime()
        : new Date(timestamp).getTime()

    const endDate = moment.utc(request.endDate)

    const startDate = estimates.length
      ? moment.utc(
          estimates.sort(
            (a, b) =>
              formatDateToTime(new Date(a.timestamp)) -
              formatDateToTime(new Date(b.timestamp)),
          )[0].timestamp,
        )
      : moment.utc(request.startDate)

    return estimates.filter(({ timestamp }) => {
      return moment
        .utc(timestamp)
        .isBetween(startDate, endDate, undefined, '[)')
    })
  }
}
