/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { EstimationResult } from '@application/EstimationResult'
import { EstimationRequest } from '@application/CreateValidRequest'

export default interface EstimatorCache {
  getEstimates(request: EstimationRequest): Promise<EstimationResult[]>
  setEstimates(data: EstimationResult[]): void
}
