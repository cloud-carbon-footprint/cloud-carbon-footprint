/*
 * © 2021 Thoughtworks, Inc.
 */

import { Storage } from '@google-cloud/storage'
import { Stream } from 'stream'
import moment from 'moment'
import EstimatorCache from './EstimatorCache'
import { EstimationResult } from '@cloud-carbon-footprint/common'

export const cacheFileName =
  process.env.CCF_CACHE_PATH || 'estimates.cache.json'

const storage = new Storage()

export default class EstimatorCacheGoogleCloudStorage
  implements EstimatorCache
{
  private readonly bucketName: string
  private readonly cacheFileName: string

  constructor(bucketName: string) {
    this.bucketName = bucketName
    this.cacheFileName = cacheFileName
  }

  getEstimates(): Promise<EstimationResult[]> {
    return this.getCloudFileContent()
  }

  async setEstimates(estimates: EstimationResult[]): Promise<void> {
    const cachedEstimates = await this.getCloudFileContent()

    try {
      const mergedData = cachedEstimates
        ? cachedEstimates.concat(estimates)
        : estimates

      const estimatesJsonData = JSON.stringify(mergedData)

      const cacheFile = storage.bucket(this.bucketName).file(this.cacheFileName)

      await cacheFile.save(estimatesJsonData, {
        contentType: 'application/json',
      })
    } catch (err) {
      console.warn(`Setting estimates error: ${err.message}`)
    }
  }

  private async getCloudFileContent(): Promise<EstimationResult[]> {
    try {
      const streamOfcacheFile = storage
        .bucket(this.bucketName)
        .file(this.cacheFileName)

      const cachedJson = await this.streamToString(
        await streamOfcacheFile.createReadStream(),
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
}
