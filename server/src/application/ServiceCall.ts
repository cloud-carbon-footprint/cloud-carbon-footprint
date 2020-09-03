import ICloudService from '@domain/ICloudService'
import { ServiceResult } from '@application/EstimationResult'
import Cost from '@domain/Cost'
import FootprintEstimate from '@domain/FootprintEstimate'

export type ServiceResponseTransformer = (
  service: ICloudService,
  costs: Cost[],
  estimates: FootprintEstimate[],
) => ServiceResult

export interface ServiceCall {
  readonly service: ICloudService
  readonly transformer: ServiceResponseTransformer
}
