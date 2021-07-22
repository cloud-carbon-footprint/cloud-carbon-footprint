/*
 * © 2021 Thoughtworks, Inc.
 */

import AWSMock from 'aws-sdk-mock'
import AWS, { CostExplorer, CloudWatch, CloudWatchLogs } from 'aws-sdk'
import { Logger } from '@cloud-carbon-footprint/common'
import { StorageEstimator } from '@cloud-carbon-footprint/core'
import EBS from '../lib/EBS'
import { AWS_REGIONS } from '../lib/AWSRegions'
import { ServiceWrapper } from '../lib/ServiceWrapper'
import { buildCostExplorerGetUsageResponse } from './fixtures/builders'
import {
  AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
  AWS_CLOUD_CONSTANTS,
} from '../domain'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

describe('Ebs', () => {
  const startDate = '2020-06-27'
  const endDate = '2020-06-30'
  const region = AWS_REGIONS.US_EAST_1
  const emissionsFactors = AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH
  const constants = {
    powerUsageEffectiveness: AWS_CLOUD_CONSTANTS.getPUE(),
  }

  const getServiceWrapper = () =>
    new ServiceWrapper(
      new CloudWatch(),
      new CloudWatchLogs(),
      new CostExplorer(),
    )

  afterEach(() => {
    AWSMock.restore()
    jest.restoreAllMocks()
  })

  it('gets EBS usage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (
        params: CostExplorer.GetCostAndUsageRequest,
        callback: (a: Error, response: any) => any,
      ) => {
        expect(params).toEqual({
          Filter: {
            And: [
              {
                Dimensions: {
                  Key: 'USAGE_TYPE_GROUP',
                  Values: [
                    'EC2: EBS - SSD(gp2)',
                    'EC2: EBS - SSD(io1)',
                    'EC2: EBS - HDD(sc1)',
                    'EC2: EBS - HDD(st1)',
                    'EC2: EBS - Magnetic',
                  ],
                },
              },
              { Dimensions: { Key: 'REGION', Values: [region] } },
            ],
          },
          Granularity: 'DAILY',
          Metrics: ['UsageQuantity'],
          TimePeriod: {
            End: endDate,
            Start: startDate,
          },
          GroupBy: [
            {
              Key: 'USAGE_TYPE',
              Type: 'DIMENSION',
            },
          ],
        })

        callback(
          null,
          buildCostExplorerGetUsageResponse([
            {
              start: startDate,
              amount: 1.2120679,
              keys: ['EBS:VolumeUsage.gp2'],
            },
          ]),
        )
      },
    )

    const ebsService = new EBS(getServiceWrapper())
    const result = await ebsService.getUsage(
      new Date(startDate),
      new Date(endDate),
      region,
    )

    expect(result).toEqual([
      {
        terabyteHours: 0.8726888880000001,
        timestamp: new Date(startDate),
        diskType: 'SSD',
      },
    ])
  })

  it('filters out results with no usage', async () => {
    // for valid date ranges, getCostAndUsage API will always return results for the date range, but with all zero usages
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (
        params: AWS.CostExplorer.GetCostAndUsageRequest,
        callback: (a: Error, response: any) => any,
      ) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([
            { start: startDate, amount: 0, keys: ['EBS:VolumeUsage.gp2'] },
            {
              start: startDate,
              amount: 1.2120679,
              keys: ['EBS:VolumeUsage.gp2'],
            },
          ]),
        )
      },
    )

    const ebsService = new EBS(getServiceWrapper())

    const result = await ebsService.getUsage(
      new Date(startDate),
      new Date(startDate),
      region,
    )
    expect(result).toEqual([
      {
        terabyteHours: 0.8726888880000001,
        timestamp: new Date(startDate),
        diskType: 'SSD',
      },
    ])
  })

  it('should return empty array if no usage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (
        params: AWS.CostExplorer.GetCostAndUsageRequest,
        callback: (a: Error, response: any) => any,
      ) => {
        callback(null, buildCostExplorerGetUsageResponse([]))
      },
    )

    const ebsService = new EBS(getServiceWrapper())
    const result = await ebsService.getUsage(
      new Date(startDate),
      new Date(endDate),
      region,
    )
    expect(result).toEqual([])
  })

  it('filters out results with no Amount', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (
        params: CostExplorer.GetCostAndUsageRequest,
        callback: (a: Error, response: any) => any,
      ) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([
            {
              start: startDate,
              amount: undefined,
              keys: ['EBS:VolumeUsage.gp2'],
            },
            {
              start: startDate,
              amount: 1.2120679,
              keys: ['EBS:VolumeUsage.gp2'],
            },
          ]),
        )
      },
    )

    const ebsService = new EBS(getServiceWrapper())
    const result = await ebsService.getUsage(
      new Date(startDate),
      new Date(endDate),
      region,
    )
    expect(result).toEqual([
      {
        terabyteHours: 0.8726888880000001,
        timestamp: new Date(startDate),
        diskType: 'SSD',
      },
    ])
  })

  it('should calculate EBS HDD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (
        params: CostExplorer.GetCostAndUsageRequest,
        callback: (a: Error, response: any) => any,
      ) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([
            { start: startDate, amount: 1, keys: ['EBS:VolumeUsage.st1'] },
          ]),
        )
      },
    )

    const ebsService = new EBS(getServiceWrapper())
    const result = await ebsService.getUsage(
      new Date(startDate),
      new Date(endDate),
      region,
    )
    expect(result).toEqual([
      {
        terabyteHours: 0.72,
        timestamp: new Date(startDate),
        diskType: 'HDD',
      },
    ])
  })

  it('should get estimates for ebs st1 HDD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (
        params: CostExplorer.GetCostAndUsageRequest,
        callback: (a: Error, response: any) => any,
      ) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([
            { start: startDate, amount: 1, keys: ['EBS:VolumeUsage.st1'] },
          ]),
        )
      },
    )

    const ebsService = new EBS(getServiceWrapper())
    const hddStorageEstimator = new StorageEstimator(
      AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT,
    )
    const result = await ebsService.getEstimates(
      new Date(startDate),
      new Date(endDate),
      region,
      emissionsFactors,
      constants,
    )
    expect(result).toEqual(
      hddStorageEstimator.estimate(
        [{ terabyteHours: 0.72, timestamp: new Date(startDate) }],
        region,
        emissionsFactors,
        constants,
      ),
    )
  })

  it('should get estimates for magnetic EBS HDD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (
        params: AWS.CostExplorer.GetCostAndUsageRequest,
        callback: (a: Error, response: any) => any,
      ) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([
            { start: startDate, amount: 1, keys: ['EBS:VolumeUsage'] },
          ]),
        )
      },
    )

    const ebsService = new EBS(getServiceWrapper())
    const hddStorageEstimator = new StorageEstimator(
      AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT,
    )
    const result = await ebsService.getEstimates(
      new Date(startDate),
      new Date(endDate),
      region,
      emissionsFactors,
      constants,
    )
    expect(result).toEqual(
      hddStorageEstimator.estimate(
        [{ terabyteHours: 0.72, timestamp: new Date(startDate) }],
        region,
        emissionsFactors,
        constants,
      ),
    )
  })

  it('should get estimates for magnetic sc1 HDD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (
        params: CostExplorer.GetCostAndUsageRequest,
        callback: (a: Error, response: any) => any,
      ) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([
            { start: startDate, amount: 1, keys: ['EBS:VolumeUsage.sc1'] },
          ]),
        )
      },
    )

    const ebsService = new EBS(getServiceWrapper())
    const hddStorageEstimator = new StorageEstimator(
      AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT,
    )
    const result = await ebsService.getEstimates(
      new Date(startDate),
      new Date(endDate),
      region,
      emissionsFactors,
      constants,
    )
    expect(result).toEqual(
      hddStorageEstimator.estimate(
        [{ terabyteHours: 0.72, timestamp: new Date(startDate) }],
        region,
        emissionsFactors,
        constants,
      ),
    )
  })

  it('should get estimates for EBS SSD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (
        params: CostExplorer.GetCostAndUsageRequest,
        callback: (a: Error, response: any) => any,
      ) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([
            { start: startDate, amount: 1, keys: ['EBS:VolumeUsage.piops'] },
          ]),
        )
      },
    )

    const ebsService = new EBS(getServiceWrapper())
    const sddStorageEstimator = new StorageEstimator(
      AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT,
    )
    const result = await ebsService.getEstimates(
      new Date(startDate),
      new Date(endDate),
      region,
      emissionsFactors,
      constants,
    )
    expect(result).toEqual(
      sddStorageEstimator.estimate(
        [{ terabyteHours: 0.72, timestamp: new Date(startDate) }],
        region,
        emissionsFactors,
        constants,
      ),
    )
  })

  it('should filter unexpected cost explorer volume name', async () => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation()
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (
        params: AWS.CostExplorer.GetCostAndUsageRequest,
        callback: (a: Error, response: any) => any,
      ) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([
            { start: startDate, amount: 1, keys: ['EBS:anything'] },
          ]),
        )
      },
    )

    const ebsService = new EBS(getServiceWrapper())
    const result = await ebsService.getEstimates(
      new Date(startDate),
      new Date(endDate),
      region,
      emissionsFactors,
      constants,
    )
    expect(result).toEqual([])
  })

  it('should log warning if unexpected cost explorer volume name', async () => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation()
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (
        params: CostExplorer.GetCostAndUsageRequest,
        callback: (a: Error, response: any) => any,
      ) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([
            { start: startDate, amount: 1, keys: ['EBS:anything'] },
          ]),
        )
      },
    )

    const ebsService = new EBS(getServiceWrapper())
    await ebsService.getEstimates(
      new Date(startDate),
      new Date(endDate),
      region,
      emissionsFactors,
      constants,
    )
    expect(Logger.prototype.warn).toHaveBeenCalledWith(
      'Unexpected Cost explorer Dimension Name: EBS:anything',
    )
  })

  it('should get estimates for EBS SDD and HDD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (
        params: CostExplorer.GetCostAndUsageRequest,
        callback: (a: Error, response: any) => any,
      ) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([
            { start: startDate, amount: 1, keys: ['EBS:VolumeUsage.st1'] },
            { start: startDate, amount: 1, keys: ['EBS:VolumeUsage.gp2'] },
          ]),
        )
      },
    )

    const ebsService = new EBS(getServiceWrapper())
    const hddStorageEstimator = new StorageEstimator(
      AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT,
    )
    const sddStorageEstimator = new StorageEstimator(
      AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT,
    )

    const result = await ebsService.getEstimates(
      new Date(startDate),
      new Date(endDate),
      region,
      emissionsFactors,
      constants,
    )

    const ssdEstimates = sddStorageEstimator.estimate(
      [{ terabyteHours: 0.72, timestamp: new Date(startDate) }],
      region,
      emissionsFactors,
      constants,
    )
    const hddEstimates = hddStorageEstimator.estimate(
      [{ terabyteHours: 0.72, timestamp: new Date(startDate) }],
      region,
      emissionsFactors,
      constants,
    )
    expect(result).toEqual([
      {
        timestamp: new Date(startDate),
        kilowattHours:
          ssdEstimates[0].kilowattHours + hddEstimates[0].kilowattHours,
        co2e: ssdEstimates[0].co2e + hddEstimates[0].co2e,
      },
    ])
  })
})
