/*
 * © 2021 Thoughtworks, Inc.
 */

import { EstimationResult } from '@cloud-carbon-footprint/common'
import { EstimationRequest } from './CreateValidRequest'

export default interface EstimatorCache {
  /**
   * Returns cached estimates for the given request and grouping.
   *
   * @param request  Request the client is making
   * @param grouping String representing how the data is being grouped
   */
  getEstimates(
    request: EstimationRequest,
    grouping: string,
  ): Promise<EstimationResult[]>

  /**
   * Sets cached estimates to the cache implementation.
   *
   * @param data     Data to be cached
   * @param grouping String representing how the data is being grouped
   */
  setEstimates(data: EstimationResult[], grouping: string): void
}
