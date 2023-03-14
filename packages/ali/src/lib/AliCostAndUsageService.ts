/*
 * © 2023 Thoughtworks, Inc.
 */

import {
  ComputeEstimator,
  EmbodiedEmissionsEstimator,
  MemoryEstimator,
  NetworkingEstimator,
  StorageEstimator,
  UnknownEstimator,
} from '@cloud-carbon-footprint/core'
import { ServiceWrapper } from '@cloud-carbon-footprint/aws'
import {
  EstimationResult,
  GroupBy,
  Logger,
} from '@cloud-carbon-footprint/common'

export default class AliCostAndUsageService {
  private readonly logger: Logger

  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly ssdStorageEstimator: StorageEstimator,
    private readonly hddStorageEstimator: StorageEstimator,
    private readonly networkingEstimator: NetworkingEstimator,
    private readonly memoryEstimator: MemoryEstimator,
    private readonly unknownEstimator: UnknownEstimator,
    private readonly embodiedEmissionsEstimator: EmbodiedEmissionsEstimator,
    private readonly serviceWrapper?: ServiceWrapper,
  ) {
    this.logger = new Logger('AliCostAndUsageService')
  }

  getEstimates(
    start: Date,
    end: Date,
    grouping: GroupBy,
  ): Promise<EstimationResult[]> {
    this.logger.info(
      `startDate: ${start}, endDate: ${end}, grouping: ${grouping}`,
    )
    return null
  }
}
