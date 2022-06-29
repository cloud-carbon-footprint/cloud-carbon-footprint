/*
 * © 2021 Thoughtworks, Inc.
 */

import fs, { promises } from 'fs'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import CacheManager from './CacheManager'
import { EstimationRequest } from './CreateValidRequest'
import { writeToFile, getCachedData, getCacheFileName } from './common/helpers'

export const testCachePath = 'mock-estimates.json'

export default class LocalCacheManager extends CacheManager {
  constructor() {
    super()
  }

  async getEstimates(
    request: EstimationRequest,
    grouping: string,
  ): Promise<EstimationResult[]> {
    this.cacheLogger.info('Using local cache file...')
    const estimates = await this.loadEstimates(grouping, request.subscriptionIds)
    return estimates ? this.filterEstimatesForRequest(request, estimates) : []
  }

  async setEstimates(
    estimates: EstimationResult[],
    grouping: string,
    subscriptionIds?: string,
  ): Promise<void> {
    const cachedEstimates = await this.loadEstimates(grouping, subscriptionIds)

    const cacheFile: string = process.env.TEST_MODE
      ? testCachePath
      : getCacheFileName(grouping, subscriptionIds)

    await this.fileHandle(cacheFile, cachedEstimates.concat(estimates))
  }

  private async fileHandle(cacheFile: string, estimates: EstimationResult[]) {
    let fh = null
    try {
      fh = await promises.open(cacheFile, 'r+')
      await writeToFile(promises, estimates, fh)
    } catch (err) {
      console.warn(`Setting estimates error: ${err.message}`)
    } finally {
      if (fh) {
        await fh.close()
      }
    }
  }

  private async loadEstimates(grouping: string,subscriptionIds?: string): Promise<EstimationResult[]> {
    let cachedData: EstimationResult[] | any
    const loadedCache = process.env.TEST_MODE
      ? testCachePath
      : getCacheFileName(grouping, subscriptionIds)
    try {
      await promises.access(loadedCache)
      const dataStream = await fs.createReadStream(loadedCache)
      cachedData = await getCachedData(dataStream)
    } catch (error) {
      console.warn(
        'WARN: Unable to read cache file. Got following error: \n' + error,
        '\n',
        'Creating new cache file...',
      )
      await promises.writeFile(loadedCache, '[]', 'utf8')
    }
    return cachedData
  }
}
