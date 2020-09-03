import EstimatorCache from '@application/EstimatorCache'
import { EstimationResult } from '@application/EstimationResult'
import { promises as fs } from 'fs'
import { RawRequest } from '@view/RawRequest'
import moment from 'moment'

export const cachePath = 'estimates.cache.json'

export default class EstimatorCacheFileSystem implements EstimatorCache {
  async getEstimates(request: RawRequest): Promise<EstimationResult[]> {
    const estimates = await this.loadEstimates()

    const filteredEstimates = estimates.filter(({ timestamp }) => {
      const startDate = moment.utc(request.startDate)
      const endDate = moment.utc(request.endDate)
      return moment.utc(timestamp).isBetween(startDate, endDate, undefined, '[)')
    })

    return filteredEstimates
  }

  async setEstimates(estimates: EstimationResult[]) {
    const cachedEstimates = await this.loadEstimates()
    return fs.writeFile(cachePath, JSON.stringify(cachedEstimates.concat(estimates)), 'utf8')
  }

  private async loadEstimates(): Promise<EstimationResult[]> {
    let data = '[]'
    try {
      data = await fs.readFile(cachePath, 'utf8')
    } catch (error) {
      console.warn('WARN: Unable to read cache file. Got following error: \n' + error)
      await fs.writeFile(cachePath, '[]', 'utf8')
    }
    const dateTimeReviver = (key: string, value: any) => {
      if (key === 'timestamp') return moment.utc(value).toDate()
      return value
    }
    return JSON.parse(data, dateTimeReviver)
  }
}
