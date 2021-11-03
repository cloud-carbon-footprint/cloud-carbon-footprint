/*
 * © 2021 Thoughtworks, Inc.
 */

import { EstimationResult } from '@cloud-carbon-footprint/common'
import { EstimationRequest } from './CreateValidRequest'

export default interface EstimatorCache {
  getEstimates(request: EstimationRequest): Promise<EstimationResult[]>
  setEstimates(data: EstimationResult[]): void
}
