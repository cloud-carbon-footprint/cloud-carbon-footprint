/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import AWSMock from 'aws-sdk-mock'
import AWS, { CostExplorer, CloudWatch, CloudWatchLogs } from 'aws-sdk'
import EBS from '@services/aws/EBS'
import { CLOUD_CONSTANTS } from '@domain/FootprintEstimationConstants'
import { StorageEstimator } from '@domain/StorageEstimator'
import { AWS_REGIONS } from '@services/aws/AWSRegions'
import { buildCostExplorerGetUsageResponse } from '@builders'
import { ServiceWrapper } from '@services/aws/ServiceWrapper'
import Logger from '@services/Logger'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

describe('Ebs', () => {
  const startDate = '2020-06-27'
  const endDate = '2020-06-30'
  const region = AWS_REGIONS.US_EAST_1

  const getServiceWrapper = () => new ServiceWrapper(new CloudWatch(), new CloudWatchLogs(), new CostExplorer())

  afterEach(() => {
    AWSMock.restore()
    jest.restoreAllMocks()
  })

  it('gets EBS usage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
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
          buildCostExplorerGetUsageResponse([{ start: startDate, amount: 1.2120679, keys: ['EBS:VolumeUsage.gp2'] }]),
        )
      },
    )

    const ebsService = new EBS(getServiceWrapper())
    const result = await ebsService.getUsage(new Date(startDate), new Date(endDate), region)

    expect(result).toEqual([
      {
        sizeGb: 36.362037,
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
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([
            { start: startDate, amount: 0, keys: ['EBS:VolumeUsage.gp2'] },
            { start: startDate, amount: 1.2120679, keys: ['EBS:VolumeUsage.gp2'] },
          ]),
        )
      },
    )

    const ebsService = new EBS(getServiceWrapper())

    const result = await ebsService.getUsage(new Date(startDate), new Date(startDate), region)
    expect(result).toEqual([
      {
        sizeGb: 36.362037,
        timestamp: new Date(startDate),
        diskType: 'SSD',
      },
    ])
  })

  it('should return empty array if no usage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, buildCostExplorerGetUsageResponse([]))
      },
    )

    const ebsService = new EBS(getServiceWrapper())
    const result = await ebsService.getUsage(new Date(startDate), new Date(endDate), region)
    expect(result).toEqual([])
  })

  it('filters out results with no Amount', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([
            { start: startDate, amount: undefined, keys: ['EBS:VolumeUsage.gp2'] },
            { start: startDate, amount: 1.2120679, keys: ['EBS:VolumeUsage.gp2'] },
          ]),
        )
      },
    )

    const ebsService = new EBS(getServiceWrapper())
    const result = await ebsService.getUsage(new Date(startDate), new Date(endDate), region)
    expect(result).toEqual([
      {
        sizeGb: 36.362037,
        timestamp: new Date(startDate),
        diskType: 'SSD',
      },
    ])
  })

  it('should calculate EBS HDD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([{ start: startDate, amount: 1, keys: ['EBS:VolumeUsage.st1'] }]),
        )
      },
    )

    const ebsService = new EBS(getServiceWrapper())
    const result = await ebsService.getUsage(new Date(startDate), new Date(endDate), region)
    expect(result).toEqual([
      {
        sizeGb: 30,
        timestamp: new Date(startDate),
        diskType: 'HDD',
      },
    ])
  })

  it('should get estimates for ebs st1 HDD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([{ start: startDate, amount: 1, keys: ['EBS:VolumeUsage.st1'] }]),
        )
      },
    )

    const ebsService = new EBS(getServiceWrapper())
    const hddStorageEstimator = new StorageEstimator(
      CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT,
      CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS,
    )
    const result = await ebsService.getEstimates(new Date(startDate), new Date(endDate), region)
    expect(result).toEqual(
      hddStorageEstimator.estimate([{ sizeGb: 30.0, timestamp: new Date(startDate) }], region, 'AWS'),
    )
  })

  it('should get estimates for magnetic EBS HDD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, buildCostExplorerGetUsageResponse([{ start: startDate, amount: 1, keys: ['EBS:VolumeUsage'] }]))
      },
    )

    const ebsService = new EBS(getServiceWrapper())
    const hddStorageEstimator = new StorageEstimator(
      CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT,
      CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS,
    )
    const result = await ebsService.getEstimates(new Date(startDate), new Date(endDate), region)
    expect(result).toEqual(
      hddStorageEstimator.estimate([{ sizeGb: 30.0, timestamp: new Date(startDate) }], region, 'AWS'),
    )
  })

  it('should get estimates for magnetic sc1 HDD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([{ start: startDate, amount: 1, keys: ['EBS:VolumeUsage.sc1'] }]),
        )
      },
    )

    const ebsService = new EBS(getServiceWrapper())
    const hddStorageEstimator = new StorageEstimator(
      CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT,
      CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS,
    )
    const result = await ebsService.getEstimates(new Date(startDate), new Date(endDate), region)
    expect(result).toEqual(
      hddStorageEstimator.estimate([{ sizeGb: 30.0, timestamp: new Date(startDate) }], region, 'AWS'),
    )
  })

  it('should get estimates for EBS SSD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([{ start: startDate, amount: 1, keys: ['EBS:VolumeUsage.piops'] }]),
        )
      },
    )

    const ebsService = new EBS(getServiceWrapper())
    const sddStorageEstimator = new StorageEstimator(
      CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT,
      CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS,
    )
    const result = await ebsService.getEstimates(new Date(startDate), new Date(endDate), region)
    expect(result).toEqual(
      sddStorageEstimator.estimate([{ sizeGb: 30.0, timestamp: new Date(startDate) }], region, 'AWS'),
    )
  })

  it('should filter unexpected cost explorer volume name', async () => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation()
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, buildCostExplorerGetUsageResponse([{ start: startDate, amount: 1, keys: ['EBS:anything'] }]))
      },
    )

    const ebsService = new EBS(getServiceWrapper())
    const result = await ebsService.getEstimates(new Date(startDate), new Date(endDate), region)
    expect(result).toEqual([])
  })

  it('should log warning if unexpected cost explorer volume name', async () => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation()
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, buildCostExplorerGetUsageResponse([{ start: startDate, amount: 1, keys: ['EBS:anything'] }]))
      },
    )

    const ebsService = new EBS(getServiceWrapper())
    await ebsService.getEstimates(new Date(startDate), new Date(endDate), region)
    expect(Logger.prototype.warn).toHaveBeenCalledWith('Unexpected Cost explorer Dimension Name: EBS:anything')
  })

  it('should get estimates for EBS SDD and HDD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
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
      CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT,
      CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS,
    )
    const sddStorageEstimator = new StorageEstimator(
      CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT,
      CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS,
    )

    const result = await ebsService.getEstimates(new Date(startDate), new Date(endDate), region)

    const ssdEstimates = sddStorageEstimator.estimate([{ sizeGb: 30.0, timestamp: new Date(startDate) }], region, 'AWS')
    const hddEstimates = hddStorageEstimator.estimate([{ sizeGb: 30.0, timestamp: new Date(startDate) }], region, 'AWS')
    expect(result).toEqual([
      {
        timestamp: new Date(startDate),
        wattHours: ssdEstimates[0].wattHours + hddEstimates[0].wattHours,
        co2e: ssdEstimates[0].co2e + hddEstimates[0].co2e,
      },
    ])
  })
})
