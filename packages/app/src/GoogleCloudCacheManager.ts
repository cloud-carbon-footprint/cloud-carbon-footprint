/*
 * © 2021 Thoughtworks, Inc.
 */

import { Storage } from '@google-cloud/storage'
import { Moment } from 'moment'
import CacheManager from './CacheManager'
import { configLoader, EstimationResult } from '@cloud-carbon-footprint/common'
import { EstimationRequest } from './CreateValidRequest'
import {
  writeToFile,
  getCachedData,
  getCacheFileName,
  getMissingDates,
} from './common/helpers'

const storage = new Storage()

export default class GoogleCloudCacheManager extends CacheManager {
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
    const bucketName = configLoader().GCP.CACHE_BUCKET_NAME
    const mergedData = this.cachedEstimates.concat(estimates)
    const cacheFileName = getCacheFileName(grouping)

    try {
      const cacheFile = storage.bucket(bucketName).file(cacheFileName)
      const writeStream = await cacheFile.createWriteStream()
      await writeToFile(writeStream, mergedData)
      writeStream.on('error', (err) => {
        console.error(`There was an error writing the file => ${err}`)
      })
      await writeStream.end()
    } catch (err) {
      console.warn(`Setting estimates error: ${err.message}`)
    }
  }

  async getMissingDates(
    request: EstimationRequest,
    grouping: string,
  ): Promise<Moment[]> {
    this.cacheLogger.info('Using GCS bucket cache file...')

    const estimates = await this.getCloudFileContent(grouping)
    const filteredEstimates = estimates
      ? this.filterEstimatesForRequest(request, estimates)
      : []

    this.cachedEstimates = filteredEstimates

    return getMissingDates(filteredEstimates, request, grouping)
  }

  private async getCloudFileContent(
    grouping: string,
  ): Promise<EstimationResult[]> {
    const cacheFileName = getCacheFileName(grouping)
    const bucketName = configLoader().GCP.CACHE_BUCKET_NAME
    let cachedData: EstimationResult[] | any = []
    try {
      const cacheFile = storage.bucket(bucketName).file(cacheFileName)
      const cacheFileExists = await Promise.resolve(
        storage.bucket(bucketName).file(cacheFileName).exists(),
      )

      if (cacheFileExists[0]) {
        const dataStream = await cacheFile.createReadStream()
        cachedData = await getCachedData(dataStream)
      } else {
        console.warn(
          'WARN: Unable to read cache file.',
          '\n',
          'Creating new cache file...',
        )
        await cacheFile.save('[]', {
          contentType: 'application/json',
        })
      }
    } catch (err) {
      if (err.code !== 404) {
        console.warn(`Error loading cloud data: ${err.message}`)
      }
      return []
    }
    return cachedData
  }
}
