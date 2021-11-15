/*
 * © 2021 Thoughtworks, Inc.
 */

import { Storage } from '@google-cloud/storage'
import { Stream } from 'stream'
import moment from 'moment'
import EstimatorCache from './EstimatorCache'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import { EstimationRequest } from './CreateValidRequest'

export const cachePrefix = process.env.CCF_CACHE_PATH || 'estimates.cache'

const storage = new Storage()

export default class EstimatorCacheGoogleCloudStorage
  implements EstimatorCache
{
  private readonly bucketName: string

  constructor(bucketName: string) {
    this.bucketName = bucketName
  }

  getEstimates(
    request: EstimationRequest,
    grouping: string,
  ): Promise<EstimationResult[]> {
    return this.getCloudFileContent(grouping)
  }

  async setEstimates(
    estimates: EstimationResult[],
    grouping: string,
  ): Promise<void> {
    const cachedEstimates = await this.getCloudFileContent(grouping)

    try {
      const mergedData = cachedEstimates
        ? cachedEstimates.concat(estimates)
        : estimates

      const estimatesJsonData = JSON.stringify(mergedData)

      const cacheFileName =
        EstimatorCacheGoogleCloudStorage.getCacheFile(grouping)
      const cacheFile = storage.bucket(this.bucketName).file(cacheFileName)

      await cacheFile.save(estimatesJsonData, {
        contentType: 'application/json',
      })
    } catch (err) {
      console.warn(`Setting estimates error: ${err.message}`)
    }
  }

  private async getCloudFileContent(
    grouping: string,
  ): Promise<EstimationResult[]> {
    const cacheFileName =
      EstimatorCacheGoogleCloudStorage.getCacheFile(grouping)
    try {
      const streamOfCacheFile = storage
        .bucket(this.bucketName)
        .file(cacheFileName)

      const cachedJson = await this.streamToString(
        await streamOfCacheFile.createReadStream(),
      )

      const dateTimeReviver = (key: string, value: string) => {
        if (key === 'timestamp') return moment.utc(value).toDate()
        return value
      }

      const cacheFileContent = cachedJson || '[]'

      return JSON.parse(cacheFileContent, dateTimeReviver)
    } catch (err) {
      if (err.code !== 404) {
        console.warn(`Error loading cloud data: ${err.message}`)
      }
      return []
    }
  }

  private streamToString(stream: Stream): Promise<string> {
    const chunks: Buffer[] = []
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
      stream.on('error', (err) => reject(err))
      stream.on('end', () => {
        resolve(Buffer.concat(chunks).toString('utf8'))
      })
    })
  }

  private static getCacheFile(grouping: string): string {
    const existingFileExtension = cachePrefix.lastIndexOf('.json')
    const prefix =
      existingFileExtension !== -1
        ? cachePrefix.substr(existingFileExtension)
        : cachePrefix
    return `${prefix}-by-${grouping}.json`
  }
}
