import ICloudService from '@domain/ICloudService'
import FootprintEstimate from '@domain/FootprintEstimate'
import Cost from '@domain/Cost'

export default class Region {
  constructor(public id: string, public services: ICloudService[], public cloudProvider: string) {}

  public async getEstimates(startDate: Date, endDate: Date): Promise<{ [service: string]: FootprintEstimate[] }> {
    const estimates: FootprintEstimate[][] = await Promise.all(
      this.services.map(async (service) => {
        return await service.getEstimates(startDate, endDate, this.id)
      }),
    )

    return estimates.reduce((estimatesMap: RegionEstimates, estimate, i) => {
      estimatesMap[this.services[i].serviceName] = estimate
      return estimatesMap
    }, {})
  }

  public async getCosts(startDate: Date, endDate: Date): Promise<RegionCosts> {
    const estimates: Cost[][] = await Promise.all(
      this.services.map(async (service) => {
        return await service.getCosts(startDate, endDate, this.id)
      }),
    )

    return estimates.reduce((estimatesMap: RegionCosts, estimate, i) => {
      estimatesMap[this.services[i].serviceName] = estimate
      return estimatesMap
    }, {})
  }
}

export interface RegionEstimates {
  [service: string]: FootprintEstimate[]
}

export interface RegionCosts {
  [service: string]: Cost[]
}
