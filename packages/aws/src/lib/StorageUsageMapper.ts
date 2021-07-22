/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import { CostExplorer } from 'aws-sdk'
import {
  StorageUsage,
  FootprintEstimate,
  StorageEstimator,
  CloudConstants,
  CloudConstantsEmissionsFactors,
} from '@cloud-carbon-footprint/core'
import { AWS_CLOUD_CONSTANTS } from '../domain'

import { ServiceWrapper } from './ServiceWrapper'

export class VolumeUsage implements StorageUsage {
  readonly terabyteHours: number
  readonly timestamp: Date
  readonly diskType: DiskType
}

export interface MutableFootprintEstimate {
  timestamp: Date
  co2e: number
  kilowattHours: number
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
  const responses: CostExplorer.GetCostAndUsageResponse[] =
    await serviceWrapper.getCostAndUsageResponses(params)

  return responses
    .map((response) => {
      return response.ResultsByTime.map((result) => {
        const timestampString = result.TimePeriod.Start
        return result.Groups.map((group) => {
          const gbMonth = Number.parseFloat(group.Metrics.UsageQuantity.Amount)
          const terabyteHours = estimateTerabyteHours(gbMonth, timestampString)
          const diskType = diskTypeCallBack(group.Keys[0]) // Should be improved
          return {
            terabyteHours: terabyteHours,
            timestamp: new Date(timestampString),
            diskType: diskType,
          }
        })
      })
    })
    .flat()
    .flat()
    .filter((storageUsage: StorageUsage) => storageUsage.terabyteHours)
}

function estimateTerabyteHours(sizeGbMonth: number, timestamp: string) {
  // This function converts an AWS EBS Gigabyte-Month pricing metric into a TerabyteHours value that is needed for Storage Estimation.
  // We do this by converting Gigabytes into Terabytes, then multiplying this by the number of hours in a month.
  // Source: https://aws.amazon.com/premiumsupport/knowledge-center/ebs-volume-charges/
  return (sizeGbMonth / 1000) * moment(timestamp).daysInMonth() * 24
}

export function getEstimatesFromCostExplorer(
  region: string,
  volumeUsages: VolumeUsage[],
  emissionsFactors: CloudConstantsEmissionsFactors,
  constants: CloudConstants,
): FootprintEstimate[] {
  const ssdEstimator = new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT)
  const hddEstimator = new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT)
  const ssdUsage = volumeUsages.filter(
    ({ diskType: diskType }) => DiskType.SSD === diskType,
  )
  const hddUsage = volumeUsages.filter(
    ({ diskType: diskType }) => DiskType.HDD === diskType,
  )
  const footprintEstimates = [
    ...ssdEstimator.estimate(ssdUsage, region, emissionsFactors, constants),
    ...hddEstimator.estimate(hddUsage, region, emissionsFactors, constants),
  ]

  return Object.values(
    footprintEstimates.reduce(
      (acc: { [key: string]: MutableFootprintEstimate }, estimate) => {
        if (!acc[estimate.timestamp.toISOString()]) {
          acc[estimate.timestamp.toISOString()] = estimate
          return acc
        }
        acc[estimate.timestamp.toISOString()].co2e += estimate.co2e
        acc[estimate.timestamp.toISOString()].kilowattHours +=
          estimate.kilowattHours
        return acc
      },
      {},
    ),
  )
}
