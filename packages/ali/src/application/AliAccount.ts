/*
 * © 2023 Thoughtworks, Inc.
 */

import { CloudProviderAccount } from '@cloud-carbon-footprint/core'
import { EstimationResult, GroupBy } from '@cloud-carbon-footprint/common'

export default class AliAccount extends CloudProviderAccount {
  private readonly credentials: any

  constructor() {
    super()
  }

  async getDataForRegions(
    startDate: Date,
    endDate: Date,
    grouping: GroupBy,
  ): Promise<EstimationResult[]> {
    return null
  }

  getDataFromCostAndUsageReports(
    startDate: Date,
    endDate: Date,
    grouping: GroupBy,
  ): Promise<EstimationResult[]> {
    console.log(startDate, endDate, grouping)
    return null
  }
}
