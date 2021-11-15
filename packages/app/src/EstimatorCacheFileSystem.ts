/*
 * © 2021 Thoughtworks, Inc.
 */

import EstimatorCache from './EstimatorCache'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import { promises as fs } from 'fs'
import moment from 'moment'
import { EstimationRequest } from './CreateValidRequest'

export const cachePrefix = process.env.CCF_CACHE_PATH || 'estimates.cache'
export const testCachePath = 'estimates.cache.test.json'

export default class EstimatorCacheFileSystem implements EstimatorCache {
  getEstimates(
    request: EstimationRequest,
    grouping: string,
  ): Promise<EstimationResult[]> {
    return this.loadEstimates(grouping)
  }

  async setEstimates(
    estimates: EstimationResult[],
    grouping: string,
  ): Promise<void> {
    const cachedEstimates = await this.loadEstimates(grouping)

    const cacheFile: string = EstimatorCacheFileSystem.getCacheFile(grouping)
    return fs.writeFile(
      cacheFile,
      JSON.stringify(cachedEstimates.concat(estimates)),
      'utf8',
    )
  }

  private async loadEstimates(grouping: string): Promise<EstimationResult[]> {
    let data = '[]'
    const loadedCache: string = process.env.TEST_MODE
      ? testCachePath
      : EstimatorCacheFileSystem.getCacheFile(grouping)
    try {
      data = await fs.readFile(loadedCache, 'utf8')
    } catch (error) {
      console.warn(
        'WARN: Unable to read cache file. Got following error: \n' + error,
        '\n',
        'Creating new cache file...',
      )
      await fs.writeFile(loadedCache, '[]', 'utf8')
    }
    const dateTimeReviver = (key: string, value: string) => {
      if (key === 'timestamp') return moment.utc(value).toDate()
      return value
    }
    return JSON.parse(data, dateTimeReviver)
  }

  private static getCacheFile(grouping: string): string {
    if (process.env.TEST_MODE) {
      return testCachePath
    }
    const existingFileExtension = cachePrefix.lastIndexOf('.json')
    const prefix =
      existingFileExtension !== -1
        ? cachePrefix.substr(existingFileExtension)
        : cachePrefix
    return `${prefix}-by-${grouping}.json`
  }
}
