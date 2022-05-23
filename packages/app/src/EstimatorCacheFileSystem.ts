/*
 * © 2021 Thoughtworks, Inc.
 */

import fs, { promises } from 'fs'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import EstimatorCache from './EstimatorCache'
import { EstimationRequest } from './CreateValidRequest'
import { getCacheFileName } from './CacheFileNameProvider'
import { writeToFile, getCachedData } from './common/helpers'

export const testCachePath = 'mock-estimates.json'

export default class EstimatorCacheFileSystem implements EstimatorCache {
  async getEstimates(
    request: EstimationRequest,
    grouping: string,
  ): Promise<EstimationResult[]> {
    return await this.loadEstimates(grouping)
  }

  async setEstimates(
    estimates: EstimationResult[],
    grouping: string,
  ): Promise<void> {
    const cachedEstimates = await this.loadEstimates(grouping)

    const cacheFile: string = process.env.TEST_MODE
      ? testCachePath
      : getCacheFileName(grouping)

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

  private async loadEstimates(grouping: string): Promise<EstimationResult[]> {
    let cachedData: EstimationResult[] | any
    const loadedCache = process.env.TEST_MODE
      ? testCachePath
      : getCacheFileName(grouping)
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
