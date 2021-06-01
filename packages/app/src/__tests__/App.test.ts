/*
 * © 2021 ThoughtWorks, Inc.
 */

import moment from 'moment'
import App from '../App'
import {
  UsageData,
  FootprintEstimate,
  ICloudService,
  Cost,
} from '@cloud-carbon-footprint/core'

import {
  EmissionRatioResult,
  EstimationResult,
} from '@cloud-carbon-footprint/common'
import { AWSAccount } from '@cloud-carbon-footprint/aws'
import { GCPAccount } from '@cloud-carbon-footprint/gcp'
import cache from '../Cache'
import { EstimationRequest } from '../CreateValidRequest'

const getServices = jest.spyOn(AWSAccount.prototype, 'getServices')
const getGCPServices = jest.spyOn(GCPAccount.prototype, 'getServices')

jest.mock('../Cache')
jest.mock('@cloud-carbon-footprint/common', () => ({
  ...jest.requireActual('@cloud-carbon-footprint/common'),
  Logger: jest.fn(),
  cache: jest.fn(),
  configLoader: jest.fn().mockImplementation(() => {
    return {
      AWS: {
        accounts: [{ id: '12345678', name: 'test AWS account' }],
        NAME: 'AWS',
        CURRENT_SERVICES: [{ key: 'testService', name: 'service' }],
        CURRENT_REGIONS: ['us-east-1', 'us-east-2'],
        authentication: {
          mode: 'GCP',
          options: {
            targetRoleSessionName: 'test-target',
            proxyAccountId: 'test-account-id',
            proxyRoleName: 'test-role-name',
          },
        },
      },
      GCP: {
        projects: [
          { id: '987654321', name: 'test GCP account' },
          { id: '987654321', name: 'test GCP account 2' },
        ],
        NAME: 'GCP',
        CURRENT_SERVICES: [{ key: 'testService', name: 'service' }],
        CURRENT_REGIONS: ['us-east1', 'us-west1', 'us-central1'],
        CACHE_BUCKET_NAME: 'test-bucket-name',
      },
    }
  }),
}))

jest.mock('@cloud-carbon-footprint/aws', () => ({
  ...jest.requireActual('@cloud-carbon-footprint/aws'),
  AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH: {
    awsRegion1: 1,
    awsRegion2: 2,
  },
}))

jest.mock('@cloud-carbon-footprint/gcp', () => ({
  ...jest.requireActual('@cloud-carbon-footprint/gcp'),
  GCP_EMISSIONS_FACTORS_METRIC_TON_PER_KWH: {
    gcpRegion1: 3,
    gcpRegion2: 4,
  },
}))

jest.mock('@cloud-carbon-footprint/azure', () => ({
  ...jest.requireActual('@cloud-carbon-footprint/azure'),
  AZURE_EMISSIONS_FACTORS_METRIC_TON_PER_KWH: {
    azureRegion1: 5,
    azureRegion2: 6,
  },
}))

const testRegions = ['us-east-1', 'us-east-2']

describe('App', () => {
  let app: App
  const startDate = '2020-08-07'
  const endDate = '2020-08-10'
  const region = 'us-east-1'
  const request: EstimationRequest = {
    startDate: moment(startDate).toDate(),
    endDate: moment(endDate).add(1, 'weeks').toDate(),
    region: region,
  }
  const testAwsAccountName = 'test AWS account'
  const testGcpAccountName = 'test GCP account'
  const awsCloudConstants = {
    maxWatts: 3.46,
    minWatts: 0.71,
    powerUsageEffectiveness: 1.135,
  }
  const awsEmissionsFactors = {
    'af-south-1': 0.000928,
    'ap-east-1': 0.00081,
    'ap-northeast-1': 0.000506,
    'ap-northeast-2': 0.0005,
    'ap-northeast-3': 0.000506,
    'ap-south-1': 0.000708,
    'ap-southeast-1': 0.0004085,
    'ap-southeast-2': 0.00079,
    'ca-central-1': 0.00013,
    'cn-north-1': 0.000555,
    'cn-northwest-1': 0.000555,
    'eu-central-1': 0.000338,
    'eu-north-1': 0.000008,
    'eu-south-1': 0.000233,
    'eu-west-1': 0.000316,
    'eu-west-2': 0.000228,
    'eu-west-3': 0.000052,
    'me-south-1': 0.000732,
    'sa-east-1': 0.000074,
    'us-east-1': 0.000415755,
    'us-east-2': 0.000440187,
    'us-gov-east-1': 0.000415755,
    'us-gov-west-1': 0.000350861,
    'us-west-1': 0.000350861,
    'us-west-2': 0.000350861,
  }

  const gcpCloudConstants = {
    powerUsageEffectiveness: 1.1,
  }
  const gcpEmissionsfactors = {
    'asia-east1': 0.000541,
    'asia-east2': 0.000626,
    'asia-northeast1': 0.000524,
    'asia-northeast2': 0.000524,
    'asia-northeast3': 0.00054,
    'asia-south1': 0.000723,
    'asia-southeast1': 0.000493,
    'asia-southeast2': 0.000772,
    'australia-southeast1': 0.000725,
    'europe-north1': 0.000181,
    'europe-west1': 0.000196,
    'europe-west2': 0.000257,
    'europe-west3': 0.000319,
    'europe-west4': 0.000474,
    'europe-west6': 0.000029,
    'northamerica-northeast1': 0.000143,
    'southamerica-east1': 0.000109,
    unknown: 0.0004108907,
    'us-central1': 0.000479,
    'us-central2': 0.000479,
    'us-east1': 0.0005,
    'us-east4': 0.000383,
    'us-west1': 0.000117,
    'us-west2': 0.000248,
    'us-west3': 0.000561,
    'us-west4': 0.000491,
  }

  beforeEach(() => {
    app = new App()
  })

  describe('getCostAndEstimates', () => {
    it('returns ebs estimates for a week', async () => {
      const mockGetCostAndEstimatesPerService: jest.Mock<
        Promise<FootprintEstimate[]>
      > = jest.fn()
      const mockGetCostPerService: jest.Mock<Promise<Cost[]>> = jest.fn()
      setUpServices(
        getServices as jest.Mock,
        [mockGetCostAndEstimatesPerService],
        ['ebs'],
        [mockGetCostPerService],
      )

      const expectedUsageEstimate: FootprintEstimate[] = [...Array(7)].map(
        (v, i) => {
          return {
            timestamp: moment.utc(startDate).add(i, 'days').toDate(),
            kilowattHours: 1.0944,
            co2e: 0.0007737845760000001,
          }
        },
      )
      mockGetCostAndEstimatesPerService.mockResolvedValueOnce(
        expectedUsageEstimate,
      )

      const costs: Cost[] = [...Array(7)].map((v, i) => {
        return {
          timestamp: moment.utc(startDate).add(i, 'days').toDate(),
          currency: '$',
          amount: 5,
        }
      })
      mockGetCostPerService.mockResolvedValueOnce(costs)

      const estimationResult: EstimationResult[] =
        await app.getCostAndEstimates(request)

      const expectedEstimationResults: EstimationResult[] = [...Array(7)].map(
        (v, i) => {
          return {
            timestamp: moment.utc(startDate).add(i, 'days').toDate(),
            serviceEstimates: [
              {
                cloudProvider: 'AWS',
                accountName: testAwsAccountName,
                serviceName: 'ebs',
                kilowattHours: 1.0944,
                co2e: 0.0007737845760000001,
                cost: 5,
                region: region,
                usesAverageCPUConstant: false,
              },
            ],
          }
        },
      )

      expect(estimationResult).toEqual(expectedEstimationResults)
    })

    it('returns estimates for 2 services', async () => {
      const mockGetEstimates1: jest.Mock<Promise<FootprintEstimate[]>> =
        jest.fn()
      const mockGetEstimates2: jest.Mock<Promise<FootprintEstimate[]>> =
        jest.fn()
      const mockGetCostPerService1: jest.Mock<Promise<Cost[]>> = jest.fn()
      const mockGetCostPerService2: jest.Mock<Promise<Cost[]>> = jest.fn()
      setUpServices(
        getServices as jest.Mock,
        [mockGetEstimates1, mockGetEstimates2],
        ['serviceOne', 'serviceTwo'],
        [mockGetCostPerService1, mockGetCostPerService2],
      )

      const expectedStorageEstimate: FootprintEstimate[] = [
        {
          timestamp: new Date(startDate),
          kilowattHours: 2,
          co2e: 2,
        },
      ]
      mockGetEstimates1.mockResolvedValueOnce(expectedStorageEstimate)

      const expectedStorageEstimate2: FootprintEstimate[] = [
        {
          timestamp: new Date(startDate),
          kilowattHours: 1,
          co2e: 1,
        },
      ]
      mockGetEstimates2.mockResolvedValueOnce(expectedStorageEstimate2)

      const expectedCosts: Cost[] = [
        {
          timestamp: new Date(startDate),
          currency: '$',
          amount: 3,
        },
      ]
      mockGetCostPerService1.mockResolvedValueOnce(expectedCosts)

      const expectedCosts2: Cost[] = [
        {
          timestamp: new Date(startDate),
          currency: '$$',
          amount: 4,
        },
      ]
      mockGetCostPerService2.mockResolvedValueOnce(expectedCosts2)

      const estimationResult: EstimationResult[] =
        await app.getCostAndEstimates(request)

      const expectedEstimationResults = [
        {
          timestamp: new Date(startDate),
          serviceEstimates: [
            {
              cloudProvider: 'AWS',
              accountName: testAwsAccountName,
              serviceName: 'serviceOne',
              kilowattHours: 2,
              co2e: 2,
              cost: 3,
              region: region,
              usesAverageCPUConstant: false,
            },
            {
              cloudProvider: 'AWS',
              accountName: testAwsAccountName,
              serviceName: 'serviceTwo',
              kilowattHours: 1,
              co2e: 1,
              cost: 4,
              region: region,
              usesAverageCPUConstant: false,
            },
          ],
        },
      ]

      expect(estimationResult).toEqual(expectedEstimationResults)
    })

    it('aggregates per day', async () => {
      const mockGetEstimates: jest.Mock<Promise<FootprintEstimate[]>> =
        jest.fn()
      setUpServices(
        getServices as jest.Mock,
        [mockGetEstimates],
        ['serviceOne'],
        [jest.fn().mockResolvedValue([])],
      )
      const expectedStorageEstimate: FootprintEstimate[] = [
        {
          timestamp: new Date(startDate + 'T01:00:00Z'),
          kilowattHours: 1,
          co2e: 2,
        },
        {
          timestamp: new Date(startDate + 'T12:59:59Z'),
          kilowattHours: 1,
          co2e: 2,
        },
        {
          timestamp: new Date(startDate + 'T23:59:59Z'),
          kilowattHours: 1,
          co2e: 2,
        },
      ]
      mockGetEstimates.mockResolvedValueOnce(expectedStorageEstimate)

      const estimationResult: EstimationResult[] =
        await app.getCostAndEstimates(request)

      const expectedEstimationResults = [
        {
          timestamp: new Date(startDate),
          serviceEstimates: [
            {
              cloudProvider: 'AWS',
              accountName: testAwsAccountName,
              serviceName: 'serviceOne',
              kilowattHours: 3,
              co2e: 6,
              cost: 0,
              region: region,
              usesAverageCPUConstant: false,
            },
          ],
        },
      ]
      expect(estimationResult).toEqual(expectedEstimationResults)
    })

    it('uses cache decorator', async () => {
      const mockGetCostAndEstimatesPerService: jest.Mock<
        Promise<FootprintEstimate[]>
      > = jest.fn()
      setUpServices(
        getServices as jest.Mock,
        [mockGetCostAndEstimatesPerService],
        ['ebs'],
        [jest.fn().mockResolvedValue([])],
      )
      mockGetCostAndEstimatesPerService.mockResolvedValueOnce([])

      await app.getCostAndEstimates(request)
      expect(cache).toHaveBeenCalled()
    })

    it('returns ebs estimates ordered by timestamp ascending', async () => {
      const mockGetCostAndEstimatesPerService: jest.Mock<
        Promise<FootprintEstimate[]>
      > = jest.fn()
      setUpServices(
        getServices as jest.Mock,
        [mockGetCostAndEstimatesPerService],
        ['ebs'],
        [jest.fn().mockResolvedValue([])],
      )

      const expectedUsageEstimate: FootprintEstimate[] = [...Array(7)].map(
        (v, i) => {
          return {
            timestamp: moment.utc(startDate).subtract(i, 'days').toDate(),
            kilowattHours: 1.0944,
            co2e: 0.0007737845760000001,
          }
        },
      )
      mockGetCostAndEstimatesPerService.mockResolvedValueOnce(
        expectedUsageEstimate,
      )

      const estimationResult: EstimationResult[] =
        await app.getCostAndEstimates(request)

      const expectedEstimationResults: EstimationResult[] = [...Array(7)].map(
        (v, i) => {
          return {
            timestamp: moment
              .utc(startDate)
              .subtract(6 - i, 'days')
              .toDate(),
            serviceEstimates: [
              {
                cloudProvider: 'AWS',
                accountName: testAwsAccountName,
                serviceName: 'ebs',
                kilowattHours: 1.0944,
                co2e: 0.0007737845760000001,
                cost: 0,
                region: region,
                usesAverageCPUConstant: false,
              },
            ],
          }
        },
      )

      expect(estimationResult).toEqual(expectedEstimationResults)
    })
  })

  it('returns estimates for multiple regions', async () => {
    const mockGetEstimates: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
    setUpServices(
      getServices as jest.Mock,
      [mockGetEstimates],
      ['serviceOne'],
      [jest.fn().mockResolvedValue([])],
    )
    setUpServices(
      getGCPServices as jest.Mock,
      [jest.fn().mockResolvedValue([])],
      [],
      [jest.fn().mockResolvedValue([])],
    )

    const expectedStorageEstimate: FootprintEstimate[] = [
      {
        timestamp: new Date(startDate),
        kilowattHours: 3,
        co2e: 6,
      },
    ]
    mockGetEstimates.mockResolvedValue(expectedStorageEstimate)

    const start = moment(startDate).toDate()
    const end = moment(startDate).add(1, 'day').toDate()
    const request: EstimationRequest = {
      startDate: start,
      endDate: end,
    }

    const result = await app.getCostAndEstimates(request)

    const expectedEstimationResults = [
      {
        timestamp: new Date(startDate),
        serviceEstimates: [
          {
            cloudProvider: 'AWS',
            accountName: testAwsAccountName,
            serviceName: 'serviceOne',
            kilowattHours: 3,
            co2e: 6,
            cost: 0,
            region: testRegions[0],
            usesAverageCPUConstant: false,
          },
          {
            cloudProvider: 'AWS',
            accountName: testAwsAccountName,
            serviceName: 'serviceOne',
            kilowattHours: 3,
            co2e: 6,
            cost: 0,
            region: testRegions[1],
            usesAverageCPUConstant: false,
          },
        ],
      },
    ]

    // expect(AWSAccount).toHaveBeenCalledWith('12345678', 'us-east-1')
    // expect(AWSAccount).toHaveBeenCalledWith('12345678', 'us-east-2')

    expect(mockGetEstimates).toHaveBeenNthCalledWith(
      1,
      new Date(start),
      new Date(end),
      'us-east-1',
      awsEmissionsFactors,
      awsCloudConstants,
    )
    expect(mockGetEstimates).toHaveBeenNthCalledWith(
      2,
      new Date(start),
      new Date(end),
      'us-east-2',
      awsEmissionsFactors,
      awsCloudConstants,
    )

    expect(result).toEqual(expectedEstimationResults)
  })

  it('returns estimates for multiple services in multiple regions', async () => {
    const mockGetEstimates: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
    const mockGetEstimates2: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
    const mockGetCostPerService1: jest.Mock<Promise<Cost[]>> = jest.fn()
    const mockGetCostPerService2: jest.Mock<Promise<Cost[]>> = jest.fn()

    setUpServices(
      getServices as jest.Mock,
      [mockGetEstimates, mockGetEstimates2],
      ['serviceOne', 'serviceTwo'],
      [mockGetCostPerService1, mockGetCostPerService2],
    )
    setUpServices(
      getGCPServices as jest.Mock,
      [jest.fn().mockResolvedValue([])],
      [],
      [jest.fn().mockResolvedValue([])],
    )

    const expectedStorageEstimate: FootprintEstimate[] = [
      {
        timestamp: new Date(startDate),
        kilowattHours: 3,
        co2e: 6,
      },
    ]
    mockGetEstimates.mockResolvedValue(expectedStorageEstimate)

    const expectedStorageEstimate2: FootprintEstimate[] = [
      {
        timestamp: new Date(startDate),
        kilowattHours: 4,
        co2e: 8,
      },
    ]
    mockGetEstimates2.mockResolvedValue(expectedStorageEstimate2)

    const expectedCosts: Cost[] = [
      {
        timestamp: new Date(startDate),
        currency: '$',
        amount: 3,
      },
    ]
    mockGetCostPerService1.mockResolvedValue(expectedCosts)
    mockGetCostPerService2.mockResolvedValue(expectedCosts)

    const start = moment(startDate).toDate()
    const end = moment(startDate).add(1, 'day').toDate()
    const request: EstimationRequest = {
      startDate: start,
      endDate: end,
    }

    const result = await app.getCostAndEstimates(request)

    const expectedEstimationResults = [
      {
        timestamp: new Date(startDate),
        serviceEstimates: [
          {
            cloudProvider: 'AWS',
            accountName: testAwsAccountName,
            serviceName: 'serviceOne',
            kilowattHours: 3,
            co2e: 6,
            cost: 3,
            region: testRegions[0],
            usesAverageCPUConstant: false,
          },
          {
            cloudProvider: 'AWS',
            accountName: testAwsAccountName,
            serviceName: 'serviceTwo',
            kilowattHours: 4,
            co2e: 8,
            cost: 3,
            region: testRegions[0],
            usesAverageCPUConstant: false,
          },
          {
            cloudProvider: 'AWS',
            accountName: testAwsAccountName,
            serviceName: 'serviceOne',
            kilowattHours: 3,
            co2e: 6,
            cost: 3,
            region: testRegions[1],
            usesAverageCPUConstant: false,
          },
          {
            cloudProvider: 'AWS',
            accountName: testAwsAccountName,
            serviceName: 'serviceTwo',
            kilowattHours: 4,
            co2e: 8,
            cost: 3,
            region: testRegions[1],
            usesAverageCPUConstant: false,
          },
        ],
      },
    ]

    expect(mockGetEstimates).toHaveBeenNthCalledWith(
      1,
      new Date(start),
      new Date(end),
      'us-east-1',
      awsEmissionsFactors,
      awsCloudConstants,
    )
    expect(mockGetEstimates).toHaveBeenNthCalledWith(
      2,
      new Date(start),
      new Date(end),
      'us-east-2',
      awsEmissionsFactors,
      awsCloudConstants,
    )

    expect(result).toEqual(expectedEstimationResults)
  })

  it('returns estimates for multiple regions and accounts in multiple cloud providers', async () => {
    const mockGetAWSEstimates: jest.Mock<Promise<FootprintEstimate[]>> =
      jest.fn()
    setUpServices(
      getServices as jest.Mock,
      [mockGetAWSEstimates],
      ['serviceOne'],
      [jest.fn().mockResolvedValue([])],
    )

    const mockGetGCPEstimates: jest.Mock<Promise<FootprintEstimate[]>> =
      jest.fn()
    setUpServices(
      getGCPServices as jest.Mock,
      [mockGetGCPEstimates],
      ['serviceTwo'],
      [jest.fn().mockResolvedValue([])],
    )

    const expectedStorageEstimate: FootprintEstimate[] = [
      {
        timestamp: new Date(startDate),
        kilowattHours: 3,
        co2e: 6,
      },
    ]
    mockGetAWSEstimates.mockResolvedValue(expectedStorageEstimate)

    const expectedStorageEstimate2: FootprintEstimate[] = [
      {
        timestamp: new Date(startDate),
        kilowattHours: 4,
        co2e: 8,
      },
    ]
    mockGetGCPEstimates.mockResolvedValue(expectedStorageEstimate2)

    const start = moment(startDate).toDate()
    const end = moment(startDate).add(1, 'day').toDate()
    const request: EstimationRequest = {
      startDate: start,
      endDate: end,
    }

    const result = await app.getCostAndEstimates(request)

    const expectedEstimationResults = [
      {
        timestamp: new Date(startDate),
        serviceEstimates: [
          {
            cloudProvider: 'AWS',
            accountName: testAwsAccountName,
            serviceName: 'serviceOne',
            kilowattHours: 3,
            co2e: 6,
            cost: 0,
            region: 'us-east-1',
            usesAverageCPUConstant: false,
          },
          {
            cloudProvider: 'AWS',
            accountName: testAwsAccountName,
            serviceName: 'serviceOne',
            kilowattHours: 3,
            co2e: 6,
            cost: 0,
            region: 'us-east-2',
            usesAverageCPUConstant: false,
          },
          {
            cloudProvider: 'GCP',
            accountName: testGcpAccountName,
            serviceName: 'serviceTwo',
            kilowattHours: 4,
            co2e: 8,
            cost: 0,
            region: 'us-east1',
            usesAverageCPUConstant: false,
          },
          {
            cloudProvider: 'GCP',
            accountName: testGcpAccountName,
            serviceName: 'serviceTwo',
            kilowattHours: 4,
            co2e: 8,
            cost: 0,
            region: 'us-west1',
            usesAverageCPUConstant: false,
          },
          {
            cloudProvider: 'GCP',
            accountName: testGcpAccountName,
            serviceName: 'serviceTwo',
            kilowattHours: 4,
            co2e: 8,
            cost: 0,
            region: 'us-central1',
            usesAverageCPUConstant: false,
          },
          {
            accountName: 'test GCP account 2',
            cloudProvider: 'GCP',
            co2e: 8,
            cost: 0,
            region: 'us-east1',
            serviceName: 'serviceTwo',
            usesAverageCPUConstant: false,
            kilowattHours: 4,
          },
          {
            accountName: 'test GCP account 2',
            cloudProvider: 'GCP',
            co2e: 8,
            cost: 0,
            region: 'us-west1',
            serviceName: 'serviceTwo',
            usesAverageCPUConstant: false,
            kilowattHours: 4,
          },
          {
            accountName: 'test GCP account 2',
            cloudProvider: 'GCP',
            co2e: 8,
            cost: 0,
            region: 'us-central1',
            serviceName: 'serviceTwo',
            usesAverageCPUConstant: false,
            kilowattHours: 4,
          },
        ],
      },
    ]

    expect(mockGetAWSEstimates).toHaveBeenCalledTimes(2)
    expect(mockGetAWSEstimates).toHaveBeenNthCalledWith(
      1,
      new Date(start),
      new Date(end),
      'us-east-1',
      awsEmissionsFactors,
      awsCloudConstants,
    )
    expect(mockGetAWSEstimates).toHaveBeenNthCalledWith(
      2,
      new Date(start),
      new Date(end),
      'us-east-2',
      awsEmissionsFactors,
      awsCloudConstants,
    )

    expect(mockGetGCPEstimates).toHaveBeenCalledTimes(6)
    expect(mockGetGCPEstimates).toHaveBeenNthCalledWith(
      1,
      new Date(start),
      new Date(end),
      'us-east1',
      gcpEmissionsfactors,
      gcpCloudConstants,
    )
    expect(mockGetGCPEstimates).toHaveBeenNthCalledWith(
      2,
      new Date(start),
      new Date(end),
      'us-west1',
      gcpEmissionsfactors,
      gcpCloudConstants,
    )
    expect(mockGetGCPEstimates).toHaveBeenNthCalledWith(
      3,
      new Date(start),
      new Date(end),
      'us-central1',
      gcpEmissionsfactors,
      gcpCloudConstants,
    )
    expect(mockGetGCPEstimates).toHaveBeenNthCalledWith(
      4,
      new Date(start),
      new Date(end),
      'us-east1',
      gcpEmissionsfactors,
      gcpCloudConstants,
    )
    expect(mockGetGCPEstimates).toHaveBeenNthCalledWith(
      5,
      new Date(start),
      new Date(end),
      'us-west1',
      gcpEmissionsfactors,
      gcpCloudConstants,
    )
    expect(mockGetGCPEstimates).toHaveBeenNthCalledWith(
      6,
      new Date(start),
      new Date(end),
      'us-central1',
      gcpEmissionsfactors,
      gcpCloudConstants,
    )

    expect(result).toEqual(expectedEstimationResults)
  })

  it('returns emissions ratios from the getEmissionsFactors function', () => {
    // given
    const expectedResponse: EmissionRatioResult[] = [
      {
        region: 'awsRegion1',
        mtPerKwHour: 1,
      },
      {
        region: 'awsRegion2',
        mtPerKwHour: 2,
      },
      {
        region: 'gcpRegion1',
        mtPerKwHour: 3,
      },
      {
        region: 'gcpRegion2',
        mtPerKwHour: 4,
      },
      {
        region: 'azureRegion1',
        mtPerKwHour: 5,
      },
      {
        region: 'azureRegion2',
        mtPerKwHour: 6,
      },
    ]
    // when
    const response = app.getEmissionsFactors()

    // then
    expect(response).toEqual(expectedResponse)
  })
})

function setUpServices(
  servicesRegistered: jest.Mock<ICloudService[]>,
  mockGetEstimates: jest.Mock<Promise<FootprintEstimate[]>>[],
  serviceNames: string[],
  mockGetCosts: jest.Mock<Promise<Cost[]>>[],
) {
  let mockGetUsage: jest.Mock<Promise<UsageData[]>>
  const mockCloudServices: ICloudService[] = mockGetEstimates.map(
    (mockGetEstimate, i) => {
      return {
        getEstimates: mockGetEstimate,
        serviceName: serviceNames[i],
        getUsage: mockGetUsage,
        getCosts: mockGetCosts[i],
      }
    },
  )
  servicesRegistered.mockReturnValue(mockCloudServices)
}
