/*
 * © 2021 ThoughtWorks, Inc.
 */

import {
  ComputeUsage,
  FootprintEstimatesDataRow,
} from '@cloud-carbon-footprint/core'
import { AWS_CLOUD_CONSTANTS } from 'src'
import CostAndUsageReportsRow from './CostAndUsageReportsRow'
import RightsizingRecommendation from './RightsizingRecommendation'

export default class AwsFootprintEstimatesRow extends FootprintEstimatesDataRow {
    constructor(rowData: RightsizingRecommendation | CostAndUsageReportsRow) {
      
        
    super(rowData as Partial<FootprintEstimatesDataRow>)

    this.vCpuHours =
      'currentInstanceVcpuHours' in rowData
        ? rowData.currentInstanceVcpuHours
        : rowData.vCpuHours
      this.computeUsage = this.getComputeUsage()
      this.computeProcessors = 
  }

  private getComputeUsage(): ComputeUsage {
    return {
      cpuUtilizationAverage: AWS_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020,
      numberOfvCpus: this.vCpuHours,
      usesAverageCPUConstant: true,
    }
  }
}
