import { EstimationResult } from '@application/EstimationResult'
import { RawRequest } from '@view/RawRequest'

export default interface EstimatorCache {
  getEstimates(request: RawRequest): Promise<EstimationResult[]>
  setEstimates(data: EstimationResult[]): void
}
