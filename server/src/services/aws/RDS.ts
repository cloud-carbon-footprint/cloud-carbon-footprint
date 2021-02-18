/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import ICloudService from '@domain/ICloudService'
import RDSComputeService from '@services/aws/RDSCompute'
import RDSStorage from '@services/aws/RDSStorage'
import FootprintEstimate from '@domain/FootprintEstimate'
import Cost from '@domain/Cost'
import moment from 'moment'
import { reduceBy, concat } from 'ramda'

export default class RDS implements ICloudService {
  serviceName = 'RDS'

  constructor(private rdsComputeService: RDSComputeService, private rdsStorageService: RDSStorage) {}

  async getEstimates(start: Date, end: Date, region: string): Promise<FootprintEstimate[]> {
    const rdsComputeEstimates = this.rdsComputeService.getEstimates(start, end, region, 'AWS')
    const rdsStorageEstimates = this.rdsStorageService.getEstimates(start, end, region)
    const resolvedEstimates: FootprintEstimate[][] = await Promise.all([rdsComputeEstimates, rdsStorageEstimates])
    const combinedEstimates: FootprintEstimate[] = resolvedEstimates.flat()

    interface CalculatedFootprintEstimate {
      timestamp: Date
      co2e: number
      wattHours: number
    }

    const result: { [key: number]: CalculatedFootprintEstimate } = {}

    combinedEstimates.forEach((estimate) => {
      const timestamp: number = estimate.timestamp.getTime()
      if (result[timestamp]) {
        result[timestamp].co2e += estimate.co2e
        result[timestamp].wattHours += estimate.wattHours
      } else {
        result[timestamp] = {
          timestamp: estimate.timestamp,
          co2e: estimate.co2e,
          wattHours: estimate.wattHours,
        }
      }
    })

    return Object.values(result)
  }

  async getCosts(start: Date, end: Date, region: string): Promise<Cost[]> {
    const rdsComputeCosts = await this.rdsComputeService.getCosts(start, end, region)
    const rdsStorageCosts = await this.rdsStorageService.getCosts(start, end, region)

    const rdsCosts = concat(rdsComputeCosts, rdsStorageCosts)

    const groupingFn = (cost: Cost) => {
      return moment(cost.timestamp).utc().format('YYYY-MM-DD')
    }

    const accumulatingFn = (accumulator: Cost, cost: Cost): Cost => {
      accumulator.timestamp = accumulator.timestamp || new Date(moment(cost.timestamp).utc().format('YYYY-MM-DD'))
      accumulator.amount += cost.amount
      accumulator.currency = cost.currency || 'USD'
      return accumulator
    }

    return Object.values(
      reduceBy(accumulatingFn, { amount: 0, currency: undefined, timestamp: undefined }, groupingFn, rdsCosts),
    )
  }
}
