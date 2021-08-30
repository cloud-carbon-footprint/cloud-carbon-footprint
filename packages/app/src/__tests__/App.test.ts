/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import {
  UsageData,
  FootprintEstimate,
  ICloudService,
  Cost,
} from '@cloud-carbon-footprint/core'
import {
  AWS_DEFAULT_RECOMMENDATION_TARGET,
  AWS_RECOMMENDATIONS_TARGETS,
  configLoader,
  EmissionRatioResult,
  EstimationResult,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'
import { AWSAccount } from '@cloud-carbon-footprint/aws'
import { GCPAccount } from '@cloud-carbon-footprint/gcp'
import App from '../App'
import cache from '../Cache'
import { EstimationRequest, RecommendationRequest } from '../CreateValidRequest'

const getDataForAWSRecommendations = jest.spyOn(
  AWSAccount.prototype,
  'getDataForRecommendations',
)
const getDataForGCPRecommendations = jest.spyOn(
  GCPAccount.prototype,
  'getDataForRecommendations',
)
const getServices = jest.spyOn(AWSAccount.prototype, 'getServices')
const getGCPServices = jest.spyOn(GCPAccount.prototype, 'getServices')

jest.mock('../Cache')
jest.mock('@cloud-carbon-footprint/common', () => ({
  ...(jest.requireActual('@cloud-carbon-footprint/common') as Record<
    string,
    unknown
  >),
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
            targetRoleName: 'test-target',
            proxyAccountId: 'test-account-id',
            proxyRoleName: 'test-role-name',
          },
        },
      },
      GCP: {
        projects: [
          { id: '987654321', name: 'test GCP account' },
          { id: '11223344', name: 'test GCP account 2' },
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
  ...(jest.requireActual('@cloud-carbon-footprint/aws') as Record<
    string,
    unknown
  >),
  AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH: {
    awsRegion1: 1,
    awsRegion2: 2,
  },
}))

jest.mock('@cloud-carbon-footprint/gcp', () => ({
  ...(jest.requireActual('@cloud-carbon-footprint/gcp') as Record<
    string,
    unknown
  >),
  GCP_EMISSIONS_FACTORS_METRIC_TON_PER_KWH: {
    gcpRegion1: 3,
    gcpRegion2: 4,
  },
}))

jest.mock('@cloud-carbon-footprint/azure', () => ({
  ...(jest.requireActual('@cloud-carbon-footprint/azure') as Record<
    string,
    unknown
  >),
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
  const testAwsAccountId = '12345678'
  const testAwsAccountName = 'test AWS account'
  const testGcpAccountIdOne = '987654321'
  const testGcpAccountIdTwo = '11223344'
  const testGcpAccountNameOne = 'test GCP account'
  const testGcpAccountNameTwo = 'test GCP account 2'

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
                accountId: testAwsAccountId,
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
              accountId: testAwsAccountId,
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
              accountId: testAwsAccountId,
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
              accountId: testAwsAccountId,
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
                accountId: testAwsAccountId,
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
            accountId: testAwsAccountId,
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
            accountId: testAwsAccountId,
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

    expect(mockGetEstimates).toHaveBeenNthCalledWith(
      1,
      new Date(start),
      new Date(end),
      'us-east-1',
      expect.anything(),
      expect.anything(),
    )
    expect(mockGetEstimates).toHaveBeenNthCalledWith(
      2,
      new Date(start),
      new Date(end),
      'us-east-2',
      expect.anything(),
      expect.anything(),
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

    const expectedEstimationResults: EstimationResult[] = [
      {
        timestamp: new Date(startDate),
        serviceEstimates: [
          {
            cloudProvider: 'AWS',
            accountId: testAwsAccountId,
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
            accountId: testAwsAccountId,
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
            accountId: testAwsAccountId,
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
            accountId: testAwsAccountId,
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
      expect.anything(),
      expect.anything(),
    )
    expect(mockGetEstimates).toHaveBeenNthCalledWith(
      2,
      new Date(start),
      new Date(end),
      'us-east-2',
      expect.anything(),
      expect.anything(),
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

    const expectedEstimationResults: EstimationResult[] = [
      {
        timestamp: new Date(startDate),
        serviceEstimates: [
          {
            cloudProvider: 'AWS',
            accountId: testAwsAccountId,
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
            accountId: testAwsAccountId,
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
            accountId: testGcpAccountIdOne,
            accountName: testGcpAccountNameOne,
            serviceName: 'serviceTwo',
            kilowattHours: 4,
            co2e: 8,
            cost: 0,
            region: 'us-east1',
            usesAverageCPUConstant: false,
          },
          {
            cloudProvider: 'GCP',
            accountId: testGcpAccountIdOne,
            accountName: testGcpAccountNameOne,
            serviceName: 'serviceTwo',
            kilowattHours: 4,
            co2e: 8,
            cost: 0,
            region: 'us-west1',
            usesAverageCPUConstant: false,
          },
          {
            cloudProvider: 'GCP',
            accountId: testGcpAccountIdOne,
            accountName: testGcpAccountNameOne,
            serviceName: 'serviceTwo',
            kilowattHours: 4,
            co2e: 8,
            cost: 0,
            region: 'us-central1',
            usesAverageCPUConstant: false,
          },
          {
            accountId: testGcpAccountIdTwo,
            accountName: testGcpAccountNameTwo,
            cloudProvider: 'GCP',
            co2e: 8,
            cost: 0,
            region: 'us-east1',
            serviceName: 'serviceTwo',
            usesAverageCPUConstant: false,
            kilowattHours: 4,
          },
          {
            accountId: testGcpAccountIdTwo,
            accountName: testGcpAccountNameTwo,
            cloudProvider: 'GCP',
            co2e: 8,
            cost: 0,
            region: 'us-west1',
            serviceName: 'serviceTwo',
            usesAverageCPUConstant: false,
            kilowattHours: 4,
          },
          {
            accountId: testGcpAccountIdTwo,
            accountName: testGcpAccountNameTwo,
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
      expect.anything(),
      expect.anything(),
    )
    expect(mockGetAWSEstimates).toHaveBeenNthCalledWith(
      2,
      new Date(start),
      new Date(end),
      'us-east-2',
      expect.anything(),
      expect.anything(),
    )

    expect(mockGetGCPEstimates).toHaveBeenCalledTimes(6)
    expect(mockGetGCPEstimates).toHaveBeenNthCalledWith(
      1,
      new Date(start),
      new Date(end),
      'us-east1',
      expect.anything(),
      expect.anything(),
    )
    expect(mockGetGCPEstimates).toHaveBeenNthCalledWith(
      2,
      new Date(start),
      new Date(end),
      'us-west1',
      expect.anything(),
      expect.anything(),
    )
    expect(mockGetGCPEstimates).toHaveBeenNthCalledWith(
      3,
      new Date(start),
      new Date(end),
      'us-central1',
      expect.anything(),
      expect.anything(),
    )
    expect(mockGetGCPEstimates).toHaveBeenNthCalledWith(
      4,
      new Date(start),
      new Date(end),
      'us-east1',
      expect.anything(),
      expect.anything(),
    )
    expect(mockGetGCPEstimates).toHaveBeenNthCalledWith(
      5,
      new Date(start),
      new Date(end),
      'us-west1',
      expect.anything(),
      expect.anything(),
    )
    expect(mockGetGCPEstimates).toHaveBeenNthCalledWith(
      6,
      new Date(start),
      new Date(end),
      'us-central1',
      expect.anything(),
      expect.anything(),
    )

    expect(result).toEqual(expectedEstimationResults)
  })

  it('returns emissions ratios from the getEmissionsFactors function', () => {
    // given
    const expectedResponse: EmissionRatioResult[] = [
      {
        cloudProvider: 'AWS',
        region: 'awsRegion1',
        mtPerKwHour: 1,
      },
      {
        cloudProvider: 'AWS',
        region: 'awsRegion2',
        mtPerKwHour: 2,
      },
      {
        cloudProvider: 'GCP',
        region: 'gcpRegion1',
        mtPerKwHour: 3,
      },
      {
        cloudProvider: 'GCP',
        region: 'gcpRegion2',
        mtPerKwHour: 4,
      },
      {
        cloudProvider: 'AZURE',
        region: 'azureRegion1',
        mtPerKwHour: 5,
      },
      {
        cloudProvider: 'AZURE',
        region: 'azureRegion2',
        mtPerKwHour: 6,
      },
    ]
    // when
    const response = app.getEmissionsFactors()

    // then
    expect(response).toEqual(expectedResponse)
  })

  describe('recommendations', () => {
    const defaultRequest: RecommendationRequest = {
      awsRecommendationTarget: AWS_DEFAULT_RECOMMENDATION_TARGET,
    }

    it('returns recommendations for aws', async () => {
      const expectedRecommendations: RecommendationResult[] = [
        {
          cloudProvider: 'AWS',
          accountId: 'account-id',
          accountName: 'account-name',
          region: 'us-east-1',
          recommendationType: 'Terminate',
          recommendationDetail: 'Terminate instance: instance-name',
          kilowattHourSavings: 5,
          co2eSavings: 4,
          costSavings: 3,
        },
      ]

      getDataForGCPRecommendations.mockResolvedValue([])
      getDataForAWSRecommendations.mockResolvedValue(expectedRecommendations)
      const result = await app.getRecommendations(defaultRequest)

      expect(getDataForAWSRecommendations).toHaveBeenCalledWith(
        AWS_RECOMMENDATIONS_TARGETS.SAME_INSTANCE_FAMILY,
      )
      expect(result).toEqual(expectedRecommendations)
    })

    it('returns recommendations for aws with billing data', async () => {
      ;(configLoader as jest.Mock).mockReturnValue({
        ...configLoader(),
        AWS: {
          ...configLoader().AWS,
          USE_BILLING_DATA: true,
        },
      })
      const expectedRecommendations: RecommendationResult[] = [
        {
          cloudProvider: 'AWS',
          accountId: 'account-id',
          accountName: 'account-name',
          region: 'us-east-1',
          recommendationType: 'Terminate',
          recommendationDetail: 'Terminate instance: instance-name',
          kilowattHourSavings: 5,
          co2eSavings: 4,
          costSavings: 3,
        },
      ]

      getDataForGCPRecommendations.mockResolvedValue([])
      getDataForAWSRecommendations.mockResolvedValue(expectedRecommendations)
      const result = await app.getRecommendations(defaultRequest)

      expect(result).toEqual(expectedRecommendations)
    })

    it('returns recommendations for aws with Cross Instance Family specified', async () => {
      ;(configLoader as jest.Mock).mockReturnValue({
        ...configLoader(),
        AWS: {
          ...configLoader().AWS,
          USE_BILLING_DATA: true,
        },
      })

      const request: RecommendationRequest = {
        awsRecommendationTarget:
          AWS_RECOMMENDATIONS_TARGETS.CROSS_INSTANCE_FAMILY,
      }

      const expectedRecommendations: RecommendationResult[] = [
        {
          cloudProvider: 'AWS',
          accountId: 'account-id',
          accountName: 'account-name',
          region: 'us-east-1',
          recommendationType: 'Terminate',
          recommendationDetail: 'Terminate instance: instance-name',
          kilowattHourSavings: 5,
          co2eSavings: 4,
          costSavings: 3,
        },
      ]

      getDataForGCPRecommendations.mockResolvedValue([])
      getDataForAWSRecommendations.mockResolvedValue(expectedRecommendations)
      const result = await app.getRecommendations(request)

      expect(result).toEqual(expectedRecommendations)
      expect(getDataForAWSRecommendations).toHaveBeenCalledWith(
        AWS_RECOMMENDATIONS_TARGETS.CROSS_INSTANCE_FAMILY,
      )
    })

    it('returns recommendations for aws with Same Instance Family specified', async () => {
      ;(configLoader as jest.Mock).mockReturnValue({
        ...configLoader(),
        AWS: {
          ...configLoader().AWS,
          USE_BILLING_DATA: true,
        },
      })

      const request: RecommendationRequest = {
        awsRecommendationTarget:
          AWS_RECOMMENDATIONS_TARGETS.SAME_INSTANCE_FAMILY,
      }

      const expectedRecommendations: RecommendationResult[] = [
        {
          cloudProvider: 'AWS',
          accountId: 'account-id',
          accountName: 'account-name',
          region: 'us-east-1',
          recommendationType: 'Terminate',
          recommendationDetail: 'Terminate instance: instance-name',
          kilowattHourSavings: 5,
          co2eSavings: 4,
          costSavings: 3,
        },
      ]

      getDataForGCPRecommendations.mockResolvedValue([])
      getDataForAWSRecommendations.mockResolvedValue(expectedRecommendations)
      const result = await app.getRecommendations(request)

      expect(result).toEqual(expectedRecommendations)
      expect(getDataForAWSRecommendations).toHaveBeenCalledWith(
        AWS_RECOMMENDATIONS_TARGETS.SAME_INSTANCE_FAMILY,
      )
    })

    it('returns recommendations for gcp', async () => {
      const expectedRecommendations: RecommendationResult[] = [
        {
          cloudProvider: 'GCP',
          accountId: 'account-id',
          accountName: 'account-name',
          region: 'us-east1',
          recommendationType: 'STOP_VM',
          recommendationDetail:
            "Save cost by stopping Idle VM 'test-instance'.",
          kilowattHourSavings: 5,
          co2eSavings: 20,
          costSavings: 3,
        },
        {
          cloudProvider: 'GCP',
          accountId: 'account-id-5',
          accountName: 'account-name-5',
          region: 'us-east1',
          recommendationType: 'STOP_VM',
          recommendationDetail:
            "Save cost by stopping Idle VM 'test-instance'.",
          kilowattHourSavings: 5,
          co2eSavings: 20,
          costSavings: 13,
        },
      ]

      getDataForAWSRecommendations.mockResolvedValue([])
      getDataForGCPRecommendations
        .mockResolvedValueOnce([expectedRecommendations[0]])
        .mockResolvedValue([expectedRecommendations[1]])
      const result = await app.getRecommendations(defaultRequest)

      expect(result).toEqual(expectedRecommendations)
    })

    it('returns recommendations for gcp with billing data', async () => {
      ;(configLoader as jest.Mock).mockReturnValue({
        ...configLoader(),
        GCP: {
          ...configLoader().GCP,
          USE_BILLING_DATA: true,
        },
      })
      const expectedRecommendations: RecommendationResult[] = [
        {
          cloudProvider: 'GCP',
          accountId: 'account-id',
          accountName: 'account-name',
          region: 'us-east-1',
          recommendationType: 'STOP_VM',
          recommendationDetail:
            "Save cost by stopping Idle VM 'test-instance'.",
          kilowattHourSavings: 5,
          co2eSavings: 20,
          costSavings: 3,
        },
      ]

      getDataForAWSRecommendations.mockResolvedValue([])
      getDataForGCPRecommendations.mockResolvedValue(expectedRecommendations)
      const result = await app.getRecommendations(defaultRequest)

      expect(result).toEqual(expectedRecommendations)
    })
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
