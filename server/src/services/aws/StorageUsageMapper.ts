import moment from 'moment'
import { CostExplorer } from 'aws-sdk'
import StorageUsage from '@domain/StorageUsage'
import { AWS_POWER_USAGE_EFFECTIVENESS, HDDCOEFFICIENT, SSDCOEFFICIENT } from '@domain/FootprintEstimationConstants'
import FootprintEstimate from '@domain/FootprintEstimate'
import { StorageEstimator } from '@domain/StorageEstimator'
import { ServiceWrapper } from '@services/aws/ServiceWrapper'

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
  serviceWrapper: ServiceWrapper,
): Promise<VolumeUsage[]> {
  const responses: CostExplorer.GetCostAndUsageResponse[] = await serviceWrapper.getCostAndUsageResponses(params)

  return responses
    .map((response) => {
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
    })
    .flat()
    .flat()
    .filter((storageUsage: StorageUsage) => storageUsage.sizeGb)
}

function estimateGigabyteUsage(sizeGbMonth: number, timestamp: string) {
  // This function converts an AWS EBS Gigabyte-Month pricing metric into a Gigabyte value for a single day.
  // We do this by getting the number of days in the month, then multiplying the Gigabyte-month value by this.
  // Source: https://aws.amazon.com/premiumsupport/knowledge-center/ebs-volume-charges/
  return sizeGbMonth * moment(timestamp).daysInMonth()
}

export function getEstimatesFromCostExplorer(
  start: Date,
  end: Date,
  region: string,
  volumeUsages: VolumeUsage[],
): FootprintEstimate[] {
  const ssdEstimator = new StorageEstimator(SSDCOEFFICIENT, AWS_POWER_USAGE_EFFECTIVENESS)
  const hddEstimator = new StorageEstimator(HDDCOEFFICIENT, AWS_POWER_USAGE_EFFECTIVENESS)
  const ssdUsage = volumeUsages.filter(({ diskType: diskType }) => DiskType.SSD === diskType)
  const hddUsage = volumeUsages.filter(({ diskType: diskType }) => DiskType.HDD === diskType)
  const footprintEstimates = [...ssdEstimator.estimate(ssdUsage, region), ...hddEstimator.estimate(hddUsage, region)]

  return Object.values(
    footprintEstimates.reduce((acc: { [key: string]: MutableFootprintEstimate }, estimate) => {
      if (!acc[estimate.timestamp.toISOString()]) {
        acc[estimate.timestamp.toISOString()] = estimate
        return acc
      }
      acc[estimate.timestamp.toISOString()].co2e += estimate.co2e
      acc[estimate.timestamp.toISOString()].wattHours += estimate.wattHours
      return acc
    }, {}),
  )
}
