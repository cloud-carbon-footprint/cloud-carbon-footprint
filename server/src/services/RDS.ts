import ICloudService from '@domain/ICloudService'
import RDSComputeService from '@services/RDSCompute'
import RDSStorage from '@services/RDSStorage'
import FootprintEstimate from '@domain/FootprintEstimate'

export default class RDS implements ICloudService {
  serviceName = 'rds'

  constructor(private rdsComputeService: RDSComputeService, private rdsStorageService: RDSStorage) {}

  async getEstimates(start: Date, end: Date, region: string): Promise<FootprintEstimate[]> {
    const rdsComputeEstimates = this.rdsComputeService.getEstimates(start, end, region)
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
}
