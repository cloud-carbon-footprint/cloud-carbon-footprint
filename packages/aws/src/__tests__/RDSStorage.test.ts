/*
 * © 2021 Thoughtworks, Inc.
 */

import { mockClient } from 'aws-sdk-client-mock'
import { Logger } from '@cloud-carbon-footprint/common'
import { StorageEstimator } from '@cloud-carbon-footprint/core'
import RDSStorage from '../lib/RDSStorage'
import {
  buildCostExplorerGetCostResponse,
  buildCostExplorerGetUsageResponse,
} from './fixtures/builders'
import { ServiceWrapper } from '../lib'
import {
  AWS_CLOUD_CONSTANTS,
  AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '../domain'

import { CloudWatchClient } from '@aws-sdk/client-cloudwatch'
import {
  CostExplorerClient,
  GetCostAndUsageCommand,
  GetCostAndUsageCommandOutput,
} from '@aws-sdk/client-cost-explorer'
import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs'
import { S3Client } from '@aws-sdk/client-s3'

const costExplorerMock = mockClient(CostExplorerClient)

describe('RDSStorage', () => {
  afterEach(() => {
    costExplorerMock.reset()
  })

  const startDate = '2020-07-24'
  const dayTwo = '2020-07-25'
  const endDate = '2020-07-26'
  const region = 'us-east-1'
  const emissionsFactors = AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH
  const constants = {
    powerUsageEffectiveness: AWS_CLOUD_CONSTANTS.getPUE(),
  }
  const getServiceWrapper = () =>
    new ServiceWrapper(
      new CloudWatchClient(),
      new CloudWatchLogsClient(),
      new CostExplorerClient(),
      new S3Client(),
    )

  it('calculates terabyteHours usage', async () => {
    costExplorerMock.on(GetCostAndUsageCommand).resolves(
      buildCostExplorerGetUsageResponse([
        { start: startDate, amount: 1, keys: ['USW1-RDS:GP2-Storage'] },
        { start: dayTwo, amount: 2, keys: ['USW1-RDS:GP2-Storage'] },
      ]) as unknown as GetCostAndUsageCommandOutput,
    )

    const rdsStorage = new RDSStorage(getServiceWrapper())

    const result = await rdsStorage.getUsage(
      new Date(startDate),
      new Date(endDate),
      region,
    )

    expect(result).toEqual([
      {
        diskType: 'SSD',
        terabyteHours: 0.744,
        timestamp: new Date(startDate),
      },
      {
        diskType: 'SSD',
        terabyteHours: 1.488,
        timestamp: new Date(dayTwo),
      },
    ])
  })

  it('should call cost explorer with the expected request', async () => {
    costExplorerMock
      .on(GetCostAndUsageCommand)
      .resolves(buildCostExplorerGetUsageResponse([]))

    const rdsStorage = new RDSStorage(getServiceWrapper())

    await rdsStorage.getUsage(new Date(startDate), new Date(endDate), region)

    const calls = costExplorerMock.commandCalls(GetCostAndUsageCommand)

    expect(calls).toHaveLength(1)

    expect(calls[0].args[0].input).toEqual({
      TimePeriod: {
        Start: startDate,
        End: endDate,
      },
      Filter: {
        And: [
          { Dimensions: { Key: 'REGION', Values: [region] } },
          {
            Dimensions: {
              Key: 'USAGE_TYPE_GROUP',
              Values: ['RDS: Storage'],
            },
          },
        ],
      },
      Granularity: 'DAILY',
      Metrics: ['UsageQuantity'],
      GroupBy: [
        {
          Key: 'USAGE_TYPE',
          Type: 'DIMENSION',
        },
      ],
    })
  })

  it('calculates terabyteHours for shorter months', async () => {
    const juneStartDate = '2020-06-24'
    const juneEndDate = '2020-06-26'
    costExplorerMock.on(GetCostAndUsageCommand).resolves(
      buildCostExplorerGetUsageResponse([
        {
          start: juneStartDate,
          amount: 1.0,
          keys: ['USW1-RDS:GP2-Storage'],
        },
      ]),
    )

    const rdsStorage = new RDSStorage(getServiceWrapper())

    const result = await rdsStorage.getUsage(
      new Date(juneStartDate),
      new Date(juneEndDate),
      region,
    )

    expect(result).toEqual([
      {
        diskType: 'SSD',
        terabyteHours: 0.72,
        timestamp: new Date(juneStartDate),
      },
    ])
  })

  it('filters 0 terabyteHours of usage', async () => {
    costExplorerMock
      .on(GetCostAndUsageCommand)
      .resolves(
        buildCostExplorerGetUsageResponse([
          { start: startDate, amount: 0, keys: ['USW1-RDS:GP2-Storage'] },
        ]),
      )

    const rdsStorage = new RDSStorage(getServiceWrapper())

    const result = await rdsStorage.getUsage(
      new Date(startDate),
      new Date(endDate),
      region,
    )

    expect(result).toEqual([])
  })

  it('should query for the specified region', async () => {
    costExplorerMock
      .on(GetCostAndUsageCommand)
      .resolves(
        buildCostExplorerGetUsageResponse([
          { start: startDate, amount: 0, keys: ['USW1-RDS:GP2-Storage'] },
        ]),
      )

    const rdsStorage = new RDSStorage(getServiceWrapper())
    await rdsStorage.getUsage(new Date(startDate), new Date(endDate), region)

    const calls = costExplorerMock.commandCalls(GetCostAndUsageCommand)

    expect(calls).toHaveLength(1)
    expect(calls[0].args[0].input.Filter.And).toContainEqual({
      Dimensions: {
        Key: 'REGION',
        Values: [region],
      },
    })
  })

  it('should get estimates for RDS IOPS SSD storage', async () => {
    costExplorerMock
      .on(GetCostAndUsageCommand)
      .resolves(
        buildCostExplorerGetUsageResponse([
          { start: startDate, amount: 1, keys: ['USW1-RDS:PIOPS-Storage'] },
        ]),
      )

    const rdsService = new RDSStorage(getServiceWrapper())
    const ssdStorageEstimator = new StorageEstimator(
      AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT,
    )

    const result = await rdsService.getEstimates(
      new Date(startDate),
      new Date(endDate),
      region,
      emissionsFactors,
      constants,
    )

    expect(result).toEqual(
      ssdStorageEstimator.estimate(
        [{ terabyteHours: 0.744, timestamp: new Date(startDate) }],
        region,
        emissionsFactors,
        constants,
      ),
    )
  })

  it('should get estimates for RDS standard HDD storage', async () => {
    costExplorerMock
      .on(GetCostAndUsageCommand)
      .resolves(
        buildCostExplorerGetUsageResponse([
          { start: startDate, amount: 1, keys: ['USW1-RDS:StorageUsage'] },
        ]),
      )

    const rdsService = new RDSStorage(getServiceWrapper())
    const hddStorageEstimator = new StorageEstimator(
      AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT,
    )

    const result = await rdsService.getEstimates(
      new Date(startDate),
      new Date(endDate),
      region,
      emissionsFactors,
      constants,
    )

    expect(result).toEqual(
      hddStorageEstimator.estimate(
        [{ terabyteHours: 0.744, timestamp: new Date(startDate) }],
        region,
        emissionsFactors,
        constants,
      ),
    )
  })

  it('should get estimates for RDS ChargedBackup HDD storage', async () => {
    costExplorerMock.on(GetCostAndUsageCommand).resolves(
      buildCostExplorerGetUsageResponse([
        {
          start: startDate,
          amount: 1,
          keys: ['USE1-RDS:ChargedBackupUsage'],
        },
      ]),
    )

    const rdsService = new RDSStorage(getServiceWrapper())
    const hddStorageEstimator = new StorageEstimator(
      AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT,
    )

    const result = await rdsService.getEstimates(
      new Date(startDate),
      new Date(endDate),
      region,
      emissionsFactors,
      constants,
    )

    expect(result).toEqual(
      hddStorageEstimator.estimate(
        [{ terabyteHours: 0.744, timestamp: new Date(startDate) }],
        region,
        emissionsFactors,
        constants,
      ),
    )
  })

  it('should get costs for RDS', async () => {
    costExplorerMock.on(GetCostAndUsageCommand).resolves(
      buildCostExplorerGetCostResponse([
        { start: startDate, amount: 0.2, keys: ['USW1-RDS:GP2-Storage'] },
        { start: dayTwo, amount: 1.8, keys: ['USW1-RDS:GP2-Storage'] },
      ]),
    )

    const rdsStorage = new RDSStorage(getServiceWrapper())
    const result = await rdsStorage.getCosts(
      new Date(startDate),
      new Date(endDate),
      region,
    )
    expect(result).toEqual([
      {
        amount: 0.2,
        currency: 'USD',
        timestamp: new Date(startDate),
      },
      {
        amount: 1.8,
        currency: 'USD',
        timestamp: new Date(dayTwo),
      },
    ])
  })

  it('Check if warning is called based on valid Disk Type', async () => {
    const loggerwarnSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation()

    costExplorerMock
      .on(GetCostAndUsageCommand)
      .resolves(
        buildCostExplorerGetUsageResponse([
          { start: startDate, amount: 1, keys: ['ThrowError'] },
        ]),
      )
    const rdsStorage = new RDSStorage(getServiceWrapper())
    //const rdsStorage = new RDSStorage(new ServiceWrapper(new CloudWatch(), new CostExplorer()))
    await rdsStorage.getUsage(new Date(startDate), new Date(endDate), region)
    expect(loggerwarnSpy).toHaveBeenCalledWith(
      'Unexpected Cost explorer Dimension Name: ThrowError',
    )
  })

  it('should return empty array if no usage', async () => {
    costExplorerMock.on(GetCostAndUsageCommand).resolves({
      ResultsByTime: [
        {
          TimePeriod: {
            Start: startDate,
            End: '',
          },
          Groups: [],
        },
      ],
    })

    const rdsStorage = new RDSStorage(getServiceWrapper())

    const result = await rdsStorage.getUsage(
      new Date(startDate),
      new Date(endDate),
      region,
    )

    expect(result).toEqual([])
  })
})
