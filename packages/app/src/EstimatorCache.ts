/*
 * © 2021 ThoughtWorks, Inc.
 */

import { EstimationResult } from '../../../app/EstimationResult'
import { EstimationRequest } from './CreateValidRequest'

export default interface EstimatorCache {
  getEstimates(request: EstimationRequest): Promise<EstimationResult[]>
  setEstimates(data: EstimationResult[]): void
}
