import { EstimationRequest, validate } from '@application/EstimationRequest'
import AWSServices from '@application/AWSServices'
import { CURRENT_REGIONS } from '@application/Config.json'
import { RegionResult } from '@application/EstimationResult'
import ICloudService from '@domain/ICloudService'
import Cost from '@domain/Cost'
import FootprintEstimate from '@domain/FootprintEstimate'
import { RawRequest } from '@view/RawRequest'

export default class App {
  async getCostAndEstimates(rawRequest: RawRequest): Promise<RegionResult[]> {
    const estimationRequest: EstimationRequest = validate(rawRequest)
    const regions: string[] = estimationRequest.region ? [estimationRequest.region] : CURRENT_REGIONS

    const regionResults: RegionResult[] = await Promise.all(
      regions.map(async (region) => {
        return {
          region: region,
          serviceResults: await Promise.all(
            AWSServices().map(async ({ service, transformer }) => {
              const [costs, estimates] = await Promise.all([
                await this.getCosts(service, estimationRequest, region),
                await this.getEstimates(service, estimationRequest, region),
              ])

              return transformer(service, costs, estimates)
            }),
          ),
        }
      }),
    )

    return regionResults
  }

  async getCosts(service: ICloudService, estimationRequest: EstimationRequest, region: string): Promise<Cost[]> {
    const costs = await service.getCosts(estimationRequest.startDate, estimationRequest.endDate, region)
    return costs
  }

  async getEstimates(
    service: ICloudService,
    estimationRequest: EstimationRequest,
    region: string,
  ): Promise<FootprintEstimate[]> {
    const estimates = await service.getEstimates(estimationRequest.startDate, estimationRequest.endDate, region)
    return estimates
  }
}
