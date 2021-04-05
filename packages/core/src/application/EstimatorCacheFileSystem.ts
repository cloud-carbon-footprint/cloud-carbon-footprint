/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import EstimatorCache from './EstimatorCache'
import { EstimationResult } from './EstimationResult'
import { EstimationRequest } from './CreateValidRequest'
import { promises as fs } from 'fs'
import moment from 'moment'

export const cachePath = process.env.CCF_CACHE_PATH || 'estimates.cache.json'
export const testCachePath = 'estimates.cache.test.json'

export default class EstimatorCacheFileSystem implements EstimatorCache {
  async getEstimates(request: EstimationRequest): Promise<EstimationResult[]> {
    const estimates = await this.loadEstimates()
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

  async setEstimates(estimates: EstimationResult[]): Promise<void> {
    const cachedEstimates = await this.loadEstimates()
    return fs.writeFile(
      cachePath,
      JSON.stringify(cachedEstimates.concat(estimates)),
      'utf8',
    )
  }

  private async loadEstimates(): Promise<EstimationResult[]> {
    let data = '[]'
    const loadedCache = process.env.USE_TEST_CACHE ? testCachePath : cachePath
    try {
      data = await fs.readFile(loadedCache, 'utf8')
    } catch (error) {
      console.warn(
        'WARN: Unable to read cache file. Got following error: \n' + error,
      )
      console.log('Creating new cache file...')
      await fs.writeFile(cachePath, '[]', 'utf8')
    }
    const dateTimeReviver = (key: string, value: string) => {
      if (key === 'timestamp') return moment.utc(value).toDate()
      return value
    }
    return JSON.parse(data, dateTimeReviver)
  }
}
