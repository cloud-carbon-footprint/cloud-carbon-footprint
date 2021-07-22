/*
 * © 2021 Thoughtworks, Inc.
 */

import EstimatorCache from './EstimatorCache'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import { promises as fs } from 'fs'
import moment from 'moment'

export const cachePath = process.env.CCF_CACHE_PATH || 'estimates.cache.json'
export const testCachePath = 'estimates.cache.test.json'

export default class EstimatorCacheFileSystem implements EstimatorCache {
  getEstimates(): Promise<EstimationResult[]> {
    return this.loadEstimates()
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
        '\n',
        'Creating new cache file...',
      )
      await fs.writeFile(cachePath, '[]', 'utf8')
    }
    const dateTimeReviver = (key: string, value: string) => {
      if (key === 'timestamp') return moment.utc(value).toDate()
      return value
    }
    return JSON.parse(data, dateTimeReviver)
  }
}
