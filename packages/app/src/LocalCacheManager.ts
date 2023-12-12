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
  mergeEstimates,
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

    const mergedEstimates = mergeEstimates(estimates, this.cachedEstimates)
    await this.fileHandle(cacheFile, grouping, mergedEstimates)
  }

  async getMissingDates(
    request: EstimationRequest,
    grouping: string,
  ): Promise<Moment[]> {
    this.cacheLogger.info('Using local cache file...')

    const estimates = await this.loadEstimates(grouping)
    const filteredEstimates = this.filterEstimatesForRequest(request, estimates)

    this.cachedEstimates = filteredEstimates

    return getMissingDates(filteredEstimates, request, grouping)
  }

  private async fileHandle(
    cacheFile: string,
    grouping: string,
    estimates: EstimationResult[],
  ) {
    let fh = null
    try {
      fh = await promises.open(cacheFile, 'r+')
      const cachedData = await this.loadEstimates(grouping)
      const mergedEstimates = mergeEstimates(estimates, cachedData)
      await writeToFile(promises, mergedEstimates, fh)
    } catch (err) {
      console.warn(`Setting estimates error: ${err.message}`)
    } finally {
      if (fh) {
        await fh.close()
      }
    }
  }

  private async loadEstimates(grouping: string): Promise<EstimationResult[]> {
    let cachedData: EstimationResult[] = []
    const loadedCache = process.env.TEST_MODE
      ? testCachePath
      : getCacheFileName(grouping)
    try {
      await promises.access(loadedCache)
      const dataStream = await fs.createReadStream(loadedCache)
      cachedData = await getCachedData(dataStream)
    } catch (error) {
      if (error.code === 'ENOENT') {
        await this.createCacheFile(loadedCache)
      } else {
        this.handleCacheReadError()
      }
    }
    return cachedData
  }

  private handleCacheReadError() {
    this.cacheLogger.warn(
      'There was an error parsing the cache file. Ignoring cache and fetching fresh estimates...',
    )
  }

  private async createCacheFile(filePath) {
    this.cacheLogger.warn('Cache file not found. Creating new cache file...')
    await promises.writeFile(filePath, '[]', 'utf8')
  }
}
