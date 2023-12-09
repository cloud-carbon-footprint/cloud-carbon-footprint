/*
 * © 2021 Thoughtworks, Inc.
 */

import fs, { promises } from 'fs'
import { Moment } from 'moment'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import CacheManager from './CacheManager'
import { EstimationRequest } from './CreateValidRequest'
import {
  writeToFile,
  getCachedData,
  getCacheFileName,
  getMissingDates,
} from './common/helpers'

export const testCachePath = 'mock-estimates.json'

export default class LocalCacheManager extends CacheManager {
  cachedEstimates: EstimationResult[]
  fetchedEstimates: EstimationResult[]
  constructor() {
    super()
    this.cachedEstimates = []
    this.fetchedEstimates = []
  }

  async getEstimates(): Promise<EstimationResult[]> {
    return this.cachedEstimates.concat(this.fetchedEstimates)
  }

  async setEstimates(
    estimates: EstimationResult[],
    grouping: string,
  ): Promise<void> {
    this.fetchedEstimates = estimates
    const cacheFile: string = process.env.TEST_MODE
      ? testCachePath
      : getCacheFileName(grouping)

    await this.fileHandle(cacheFile, this.cachedEstimates.concat(estimates))
  }

  async getMissingDates(
    request: EstimationRequest,
    grouping: string,
  ): Promise<Moment[]> {
    this.cacheLogger.info('Using local cache file...')

    const estimates = await this.loadEstimates(grouping)
    const filteredEstimates = estimates
      ? this.filterEstimatesForRequest(request, estimates)
      : []

    this.cachedEstimates = filteredEstimates

    return getMissingDates(filteredEstimates, request, grouping)
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
    let cachedData: EstimationResult[]
    const loadedCache = process.env.TEST_MODE
      ? testCachePath
      : getCacheFileName(grouping)
    try {
      await promises.access(loadedCache)
      const dataStream = await fs.createReadStream(loadedCache)
      cachedData = await getCachedData(dataStream)
    } catch (error) {
      if (error.code === 'ENOENT') {
        await this.createCacheFile(error, loadedCache)
      } else {
        this.handleCacheReadError()
      }
    }
    return cachedData
  }

  private handleCacheReadError() {
    console.warn(
      'WARN: There was an error parsing the cache file.',
      '\n',
      'Ignoring cache and fetching fresh estimates...',
    )
  }

  private async createCacheFile(error, cacheFilePath) {
    console.warn(
      'WARN: Failed to open the cache file. \n' + error,
      '\n',
      'Creating new cache file...',
    )
    await promises.writeFile(cacheFilePath, '[]', 'utf8')
  }
}
