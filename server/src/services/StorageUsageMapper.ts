import moment from 'moment'
import AWS, { CostExplorer } from 'aws-sdk'

import StorageUsage from '@domain/StorageUsage'
import { AWS_REGIONS } from '@domain/constants'

export class VolumeUsage implements StorageUsage {
  readonly sizeGb: number
  readonly timestamp: Date
  readonly diskType: DiskType
}

export interface MutableFootprintEstimate {
  timestamp: Date
  co2e: number
  wattHours: number
}

export enum DiskType {
  SSD = 'SSD',
  HDD = 'HDD',
}

export async function getUsageFromCostExplorer(
  params: CostExplorer.GetCostAndUsageRequest,
  diskTypeCallBack: (awsGroupKey: string) => DiskType,
): Promise<VolumeUsage[]> {
  const costExplorer = new AWS.CostExplorer({
    region: AWS_REGIONS.US_EAST_1, //must be us-east-1 to work
  })

  const response: CostExplorer.GetCostAndUsageResponse = await costExplorer.getCostAndUsage(params).promise()

  return response.ResultsByTime.map((result) => {
    const timestampString = result.TimePeriod.Start
    return result.Groups.map((group) => {
      const gbMonth = Number.parseFloat(group.Metrics.UsageQuantity.Amount)
      const sizeGb = estimateGigabyteUsage(gbMonth, timestampString)
      const diskType = diskTypeCallBack(group.Keys[0]) // Should be improved
      return {
        sizeGb,
        timestamp: new Date(timestampString),
        diskType: diskType,
      }
    })
  })
    .flat()
    .filter((storageUsage: StorageUsage) => storageUsage.sizeGb)
}

function estimateGigabyteUsage(sizeGbMonth: number, timestamp: string) {
  // This function converts an AWS EBS Gigabyte-Month pricing metric into a Gigabyte value for a single day.
  // We do this by getting the number of days in the month, then multiplying the Gigabyte-month value by this.
  // Source: https://aws.amazon.com/premiumsupport/knowledge-center/ebs-volume-charges/
  return sizeGbMonth * moment(timestamp).daysInMonth()
}
