import { EstimationRequest, validate } from '@application/EstimationRequest'
import AWSServices from '@application/AWSServices'

import { CURRENT_REGIONS } from '@application/Config.json'

import { EstimationResult } from '@application/EstimationResult'
import ICloudService from '@domain/ICloudService'
import Cost from '@domain/Cost'
import FootprintEstimate from '@domain/FootprintEstimate'
import { RawRequest } from '@view/RawRequest'
import { transformToServiceData, transformToEstimationResults } from './Transformer'

export default class App {
  async getCostAndEstimates(rawRequest: RawRequest): Promise<EstimationResult[]> {
    const estimationRequest: EstimationRequest = validate(rawRequest)
    const regions: string[] = estimationRequest.region ? [estimationRequest.region] : CURRENT_REGIONS

    const estimatesByServiceByRegion = await Promise.all(
      regions.map(async (region) => {
        return await Promise.all(
          AWSServices().map(async (service) => {
            const [costs, estimates] = await Promise.all([
              await this.getCosts(service, estimationRequest, region),
              await this.getEstimates(service, estimationRequest, region),
            ])
            return transformToServiceData(service, region, costs, estimates)
          }),
        )
      }),
    )

    return transformToEstimationResults(estimatesByServiceByRegion.flat().flat())
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
