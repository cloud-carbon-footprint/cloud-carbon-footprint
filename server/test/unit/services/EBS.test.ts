import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'
import EBS from '@services/EBS'
import { AWS_POWER_USAGE_EFFECTIVENESS, HDDCOEFFICIENT, SSDCOEFFICIENT } from '@domain/FootprintEstimationConstants'
import { StorageEstimator } from '@domain/StorageEstimator'
import { AWS_REGIONS } from '@services/AWSRegions'
import { buildCostExplorerGetUsageResponse } from '@builders'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

describe('Ebs', () => {
  const startDate = new Date('2020-06-27T00:00:00Z')
  const endDate = new Date('2020-06-30T00:00:00Z')
  const startString = startDate.toISOString().substr(0, 10)
  const endString = endDate.toISOString().substr(0, 10)
  const region = AWS_REGIONS.US_EAST_1

  afterEach(() => {
    AWSMock.restore()
    jest.restoreAllMocks()
  })

  it('gets EBS usage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
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
            End: endString,
            Start: startString,
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
          buildCostExplorerGetUsageResponse([{ start: startString, amount: 1.2120679, keys: ['EBS:VolumeUsage.gp2'] }]),
        )
      },
    )

    const ebsService = new EBS()
    const result = await ebsService.getUsage(startDate, endDate, region)

    expect(result).toEqual([
      {
        sizeGb: 36.362037,
        timestamp: startDate,
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
            { start: startString, amount: 0, keys: ['EBS:VolumeUsage.gp2'] },
            { start: startString, amount: 1.2120679, keys: ['EBS:VolumeUsage.gp2'] },
          ]),
        )
      },
    )

    const ebsService = new EBS()

    const result = await ebsService.getUsage(startDate, startDate, region)
    expect(result).toEqual([
      {
        sizeGb: 36.362037,
        timestamp: startDate,
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

    const ebsService = new EBS()
    const result = await ebsService.getUsage(startDate, endDate, region)
    expect(result).toEqual([])
  })

  it('filters out results with no Amount', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([
            { start: startString, amount: undefined, keys: ['EBS:VolumeUsage.gp2'] },
            { start: startString, amount: 1.2120679, keys: ['EBS:VolumeUsage.gp2'] },
          ]),
        )
      },
    )

    const ebsService = new EBS()
    const result = await ebsService.getUsage(startDate, endDate, region)
    expect(result).toEqual([
      {
        sizeGb: 36.362037,
        timestamp: startDate,
        diskType: 'SSD',
      },
    ])
  })

  it('should calculate EBS HDD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([{ start: startString, amount: 1, keys: ['EBS:VolumeUsage.st1'] }]),
        )
      },
    )

    const ebsService = new EBS()
    const result = await ebsService.getUsage(startDate, endDate, region)
    expect(result).toEqual([
      {
        sizeGb: 30,
        timestamp: startDate,
        diskType: 'HDD',
      },
    ])
  })

  it('should get estimates for ebs st1 HDD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([{ start: startString, amount: 1, keys: ['EBS:VolumeUsage.st1'] }]),
        )
      },
    )

    const ebsService = new EBS()
    const hddStorageEstimator = new StorageEstimator(HDDCOEFFICIENT, AWS_POWER_USAGE_EFFECTIVENESS)
    const result = await ebsService.getEstimates(startDate, endDate, region)
    expect(result).toEqual(hddStorageEstimator.estimate([{ sizeGb: 30.0, timestamp: startDate }], region))
  })

  it('should get estimates for magnetic EBS HDD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([{ start: startString, amount: 1, keys: ['EBS:VolumeUsage'] }]),
        )
      },
    )

    const ebsService = new EBS()
    const hddStorageEstimator = new StorageEstimator(HDDCOEFFICIENT, AWS_POWER_USAGE_EFFECTIVENESS)
    const result = await ebsService.getEstimates(startDate, endDate, region)
    expect(result).toEqual(hddStorageEstimator.estimate([{ sizeGb: 30.0, timestamp: startDate }], region))
  })

  it('should get estimates for magnetic sc1 HDD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([{ start: startString, amount: 1, keys: ['EBS:VolumeUsage.sc1'] }]),
        )
      },
    )

    const ebsService = new EBS()
    const hddStorageEstimator = new StorageEstimator(HDDCOEFFICIENT, AWS_POWER_USAGE_EFFECTIVENESS)
    const result = await ebsService.getEstimates(startDate, endDate, region)
    expect(result).toEqual(hddStorageEstimator.estimate([{ sizeGb: 30.0, timestamp: startDate }], region))
  })

  it('should get estimates for EBS SSD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([{ start: startString, amount: 1, keys: ['EBS:VolumeUsage.piops'] }]),
        )
      },
    )

    const ebsService = new EBS()
    const sddStorageEstimator = new StorageEstimator(SSDCOEFFICIENT, AWS_POWER_USAGE_EFFECTIVENESS)
    const result = await ebsService.getEstimates(startDate, endDate, region)
    expect(result).toEqual(sddStorageEstimator.estimate([{ sizeGb: 30.0, timestamp: startDate }], region))
  })

  it('should filter unexpected cost explorer volume name', async () => {
    jest.spyOn(global.console, 'warn').mockImplementation()
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, buildCostExplorerGetUsageResponse([{ start: startString, amount: 1, keys: ['EBS:anything'] }]))
      },
    )

    const ebsService = new EBS()
    const result = await ebsService.getEstimates(startDate, endDate, region)
    expect(result).toEqual([])
  })

  it('should log warning if unexpected cost explorer volume name', async () => {
    jest.spyOn(global.console, 'warn').mockImplementation()
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, buildCostExplorerGetUsageResponse([{ start: startString, amount: 1, keys: ['EBS:anything'] }]))
      },
    )

    const ebsService = new EBS()
    await ebsService.getEstimates(startDate, endDate, region)
    expect(console.warn).toHaveBeenCalledWith('Unexpected Cost explorer Dimension Name: EBS:anything')
  })

  it('should get estimates for EBS SDD and HDD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([
            { start: startString, amount: 1, keys: ['EBS:VolumeUsage.st1'] },
            { start: startString, amount: 1, keys: ['EBS:VolumeUsage.gp2'] },
          ]),
        )
      },
    )

    const ebsService = new EBS()
    const hddStorageEstimator = new StorageEstimator(HDDCOEFFICIENT, AWS_POWER_USAGE_EFFECTIVENESS)
    const sddStorageEstimator = new StorageEstimator(SSDCOEFFICIENT, AWS_POWER_USAGE_EFFECTIVENESS)

    const result = await ebsService.getEstimates(startDate, endDate, region)

    const ssdEstimates = sddStorageEstimator.estimate([{ sizeGb: 30.0, timestamp: startDate }], region)
    const hddEstimates = hddStorageEstimator.estimate([{ sizeGb: 30.0, timestamp: startDate }], region)
    expect(result).toEqual([
      {
        timestamp: startDate,
        wattHours: ssdEstimates[0].wattHours + hddEstimates[0].wattHours,
        co2e: ssdEstimates[0].co2e + hddEstimates[0].co2e,
      },
    ])
  })
})
