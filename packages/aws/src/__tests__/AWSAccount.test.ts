/*
 * © 2021 Thoughtworks, Inc.
 */

import { Credentials } from 'aws-sdk'
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service'
import { CloudProviderAccount } from '@cloud-carbon-footprint/core'
import {
  AWS_DEFAULT_RECOMMENDATION_TARGET,
  AWS_RECOMMENDATIONS_SERVICES,
  AWS_RECOMMENDATIONS_TARGETS,
  setConfig,
  EstimationResult,
  getPeriodEndDate,
  GroupBy,
  LookupTableInput,
  LookupTableOutput,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'
import {
  CostAndUsageReports,
  EBS,
  EC2,
  ElastiCache,
  Lambda,
  RDS,
  S3,
} from '../lib'
import AWSCredentialsProvider from '../application/AWSCredentialsProvider'
import {
  RightsizingRecommendations,
  ComputeOptimizerRecommendations,
} from '../lib/Recommendations'

jest.mock('../application/AWSCredentialsProvider')

/* eslint-disable @typescript-eslint/no-var-requires */
describe('AWSAccount', () => {
  const CloudWatch = jest.fn()
  const CostExplorer = jest.fn()
  const CloudWatchLogs = jest.fn()
  const Athena = jest.fn()
  const S3Service = jest.fn()
  let expectedCredentials: Credentials

  beforeEach(() => {
    jest.doMock('aws-sdk', () => {
      return {
        CloudWatch: CloudWatch,
        CostExplorer: CostExplorer,
        CloudWatchLogs: CloudWatchLogs,
        Athena: Athena,
        S3: S3Service,
      }
    })

    const mockedCreate = jest.fn()
    expectedCredentials = new Credentials('test', 'test', 'test')
    mockedCreate.mockReturnValue(expectedCredentials)
    AWSCredentialsProvider.create = mockedCreate
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should return empty if no service in config file', () => {
    setConfig({
      AWS: {
        CURRENT_SERVICES: [],
      },
    })
    const AWSAccount = require('../application/AWSAccount').default
    const services = new AWSAccount().getServices()
    expect(services).toHaveLength(0)
  })

  it('should throw error if unknown service', () => {
    setConfig({
      AWS: {
        CURRENT_SERVICES: [{ key: 'duck', name: '' }],
      },
    })

    const awsAccount = require('../application/AWSAccount').default
    const account = new awsAccount('123', 'us-east-1')
    expect(() => {
      account.getServices()
    }).toThrowError('Unsupported service: duck')
  })

  it('should return instances from registered services in configuration file', () => {
    expectAWSService('ebs').toBeInstanceOf(EBS)
    expect(CloudWatch).toHaveBeenCalledWith({
      region: 'some-region',
      credentials: expectedCredentials,
    })
    expect(CostExplorer).toHaveBeenCalledWith({
      region: 'us-east-1',
      credentials: expectedCredentials,
    })
  })

  it('should return s3 instance', () => {
    expectAWSService('s3').toBeInstanceOf(S3)
  })

  it('should return ec2 instance', () => {
    expectAWSService('ec2').toBeInstanceOf(EC2)
  })

  it('should return elasticache instance', () => {
    expectAWSService('elasticache').toBeInstanceOf(ElastiCache)
  })

  it('should return rds instance', () => {
    expectAWSService('rds').toBeInstanceOf(RDS)
  })

  it('should return lambda instance', () => {
    expectAWSService('lambda').toBeInstanceOf(Lambda)
  })

  describe('credentials provider', () => {
    it('should set credentials to cloudwatch client', () => {
      // when
      expectAWSService('ebs')

      //then
      const options: ServiceConfigurationOptions = CloudWatch.mock.calls[0][0]
      expect(options.credentials).toEqual(expectedCredentials)
    })

    it('should set credentials to costExplorer client', () => {
      // when
      expectAWSService('s3')

      //then
      const options: ServiceConfigurationOptions = CostExplorer.mock.calls[0][0]
      expect(options.credentials).toEqual(expectedCredentials)
    })

    it('should set credentials to CloudWatchLogs client', () => {
      // when
      expectAWSService('lambda')

      //then
      const options: ServiceConfigurationOptions =
        CloudWatchLogs.mock.calls[0][0]
      expect(options.credentials).toEqual(expectedCredentials)
    })
  })

  it('should get data for regions', async () => {
    const startDate = new Date('2021-01-01')
    const endDate = new Date('2021-02-01')
    const AWSAccount = require('../application/AWSAccount').default
    const testAwsAccount = new AWSAccount('12345678', 'test account', [
      'region-a',
    ])
    const expectedEstimatesResult: EstimationResult[] =
      getExpectedEstimationResult(startDate)

    const getRegionDataSpy = jest.spyOn(
      CloudProviderAccount.prototype,
      'getRegionData',
    )

    getRegionDataSpy.mockResolvedValue(expectedEstimatesResult)

    const result = await testAwsAccount.getDataForRegions(
      startDate,
      endDate,
      GroupBy.day,
    )

    expect(result).toEqual(expectedEstimatesResult)
  })

  it('should getDataFromCostAndUsageReports', async () => {
    const startDate = new Date('2021-01-01')
    const endDate = new Date('2021-02-01')
    const AWSAccount = require('../application/AWSAccount').default
    const testAwsAccount = new AWSAccount('12345678', 'test account', [
      'region-a',
    ])
    const expectedEstimatesResult: EstimationResult[] =
      getExpectedEstimationResult(startDate)

    const costAndUsageReportsGetEstimatesSpy = jest.spyOn(
      CostAndUsageReports.prototype,
      'getEstimates',
    )

    costAndUsageReportsGetEstimatesSpy.mockResolvedValue(
      expectedEstimatesResult,
    )

    const result = await testAwsAccount.getDataFromCostAndUsageReports(
      startDate,
      endDate,
    )

    expect(result).toEqual(expectedEstimatesResult)
  })

  it('should getCostAndUsageReportsDataFromInputData', () => {
    const inputData: LookupTableInput[] = [
      {
        serviceName: 'AmazonEC2',
        region: 'us-east-1',
        usageType: 'USE2-BoxUsage:t2.micro',
        usageUnit: 'Hrs',
        vCpus: '2',
      },
    ]

    const AWSAccount = require('../application/AWSAccount').default
    const result = AWSAccount.getCostAndUsageReportsDataFromInputData(inputData)

    const expectedResult: LookupTableOutput[] = [
      {
        serviceName: 'AmazonEC2',
        region: 'us-east-1',
        usageType: 'USE2-BoxUsage:t2.micro',
        vCpus: '2',
        kilowattHours: 0.014425250356994983,
        co2e: 0.000005468165227575731,
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  describe('Recommendations', () => {
    it('should get data for rightsizing recommendations', async () => {
      const AWSAccount = require('../application/AWSAccount').default
      const testAwsAccount = new AWSAccount('12345678', 'test account', [
        'some-region',
      ])

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

      const getRecommendations = jest.spyOn(
        RightsizingRecommendations.prototype,
        'getRecommendations',
      )

      getRecommendations.mockResolvedValue(expectedRecommendations)
      const result = await testAwsAccount.getDataForRecommendations(
        AWS_DEFAULT_RECOMMENDATION_TARGET,
      )

      expect(result).toEqual(expectedRecommendations)
    })

    it('should get data for Cross Instance Family recommendations', async () => {
      const AWSAccount = require('../application/AWSAccount').default
      const testAwsAccount = new AWSAccount('12345678', 'test account', [
        'some-region',
      ])

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

      const getRecommendations = jest.spyOn(
        RightsizingRecommendations.prototype,
        'getRecommendations',
      )

      getRecommendations.mockResolvedValue(expectedRecommendations)
      const result = await testAwsAccount.getDataForRecommendations(
        AWS_RECOMMENDATIONS_TARGETS.CROSS_INSTANCE_FAMILY,
      )

      expect(result).toEqual(expectedRecommendations)
      expect(getRecommendations).toHaveBeenCalledWith(
        AWS_RECOMMENDATIONS_TARGETS.CROSS_INSTANCE_FAMILY,
      )
    })

    it('should get data for compute optimizer recommendations', async () => {
      const AWSAccount = require('../application/AWSAccount').default
      const testAwsAccount = new AWSAccount('12345678', 'test account', [
        'some-region',
      ])

      setConfig({
        AWS: {
          RECOMMENDATIONS_SERVICE:
            AWS_RECOMMENDATIONS_SERVICES.ComputeOptimizer,
        },
      })

      const expectedRecommendations: RecommendationResult[] = [
        {
          cloudProvider: 'AWS',
          accountId: '1234567890',
          accountName: '1234567890',
          region: 'eu-central-1',
          recommendationType: 'EC2-OVER_PROVISIONED',
          kilowattHourSavings: 0,
          resourceId: 'i-0c80d1b0f3a0c5c69',
          instanceName: 'PA-VM-100 | Networks',
          co2eSavings: 0,
          recommendationDetail: 't3.xlarge',
          costSavings: 33.79,
        },
      ]

      const getRecommendations = jest.spyOn(
        ComputeOptimizerRecommendations.prototype,
        'getRecommendations',
      )

      getRecommendations.mockResolvedValue(expectedRecommendations)
      const result = await testAwsAccount.getDataForRecommendations(
        AWS_DEFAULT_RECOMMENDATION_TARGET,
      )

      expect(result).toEqual(expectedRecommendations)
    })

    it('should get data for all recommendation services (compute optimizer and rightsizing)', async () => {
      const AWSAccount = require('../application/AWSAccount').default
      const testAwsAccount = new AWSAccount('12345678', 'test account', [
        'some-region',
      ])

      setConfig({
        AWS: {
          RECOMMENDATIONS_SERVICE: AWS_RECOMMENDATIONS_SERVICES.All,
        },
      })

      const expectedRecommendations: RecommendationResult[] = [
        {
          cloudProvider: 'AWS',
          accountId: '1234567890',
          accountName: '1234567890',
          region: 'eu-central-1',
          recommendationType: 'EC2-OVER_PROVISIONED',
          kilowattHourSavings: 0,
          resourceId: 'i-0c80d1b0f3a0c5c69',
          instanceName: 'PA-VM-100 | Networks',
          co2eSavings: 0,
          recommendationDetail: 't3.xlarge',
          costSavings: 33.79,
        },
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

      const getComputeOptimizerRecommendations = jest.spyOn(
        ComputeOptimizerRecommendations.prototype,
        'getRecommendations',
      )
      getComputeOptimizerRecommendations.mockResolvedValue([
        expectedRecommendations[0],
      ])

      const getRightsizingRecommendations = jest.spyOn(
        RightsizingRecommendations.prototype,
        'getRecommendations',
      )

      getRightsizingRecommendations.mockResolvedValue([
        expectedRecommendations[1],
      ])

      const result = await testAwsAccount.getDataForRecommendations(
        AWS_DEFAULT_RECOMMENDATION_TARGET,
      )

      expect(result).toEqual(expectedRecommendations)
    })

    it('should get data with highest savings when retrieving duplicate ids from all recommendation services', async () => {
      const AWSAccount = require('../application/AWSAccount').default
      const testAwsAccount = new AWSAccount('12345678', 'test account', [
        'some-region',
      ])

      setConfig({
        AWS: {
          RECOMMENDATIONS_SERVICE: AWS_RECOMMENDATIONS_SERVICES.All,
        },
      })

      const mockComputeOptimizerRecommendations = [
        {
          cloudProvider: 'AWS',
          accountId: '1234567890',
          accountName: '1234567890',
          region: 'eu-central-1',
          recommendationType: 'EC2-OVER_PROVISIONED',
          kilowattHourSavings: 0,
          resourceId: 'i-0c80d1b0f3a0c5c69',
          instanceName: 'PA-VM-100 | Networks',
          co2eSavings: 3,
          recommendationDetail: 't3.xlarge',
          costSavings: 33.79,
        },
        {
          cloudProvider: 'AWS',
          accountId: '0987654321',
          accountName: '0987654321',
          region: 'us-east-1',
          recommendationType: 'EC2-OVER_PROVISIONED',
          kilowattHourSavings: 0,
          resourceId: 'i-0c40d2b0p5a0c4c72',
          instanceName: 'PA-VM-100 | Networks',
          co2eSavings: 6,
          recommendationDetail: 't3.xlarge',
          costSavings: 33.79,
        },
        {
          cloudProvider: 'AWS',
          accountId: '0987654321',
          accountName: '0987654321',
          region: 'us-east-1',
          recommendationType: 'EC2-OVER_PROVISIONED',
          kilowattHourSavings: 0,
          resourceId: 'i-0c90f1b0p8a0c4c47',
          instanceName: 'PA-VM-100 | Networks',
          co2eSavings: 8,
          recommendationDetail: 't3.xlarge',
          costSavings: 44.83,
        },
      ]
      const mockRightsizingRecommendations: RecommendationResult[] = [
        {
          cloudProvider: 'AWS',
          accountId: '1234567890',
          accountName: '1234567890',
          region: 'eu-central-1',
          recommendationType: 'Terminate',
          resourceId: 'i-0c80d1b0f3a0c5c69',
          recommendationDetail: 'Terminate instance: instance-name',
          kilowattHourSavings: 5,
          co2eSavings: 2,
          costSavings: 3,
        },
        {
          cloudProvider: 'AWS',
          accountId: '0987654321',
          accountName: '0987654321',
          region: 'us-east-1',
          recommendationType: 'Modify',
          resourceId: 'i-0c40d2b0p5a0c4c72',
          recommendationDetail: 'Modify instance: instance-name',
          kilowattHourSavings: 5,
          co2eSavings: 6.12,
          costSavings: 3,
        },
        {
          cloudProvider: 'AWS',
          accountId: '0987654321',
          accountName: '0987654321',
          region: 'us-east-1',
          recommendationType: 'Modify',
          kilowattHourSavings: 0,
          resourceId: 'i-0c90f1b0p8a0c4c47',
          recommendationDetail: 't3.xlarge',
          co2eSavings: 8,
          costSavings: 45.72,
        },
      ]

      const expectedRecommendations = [
        {
          cloudProvider: 'AWS',
          accountId: '1234567890',
          accountName: '1234567890',
          region: 'eu-central-1',
          recommendationType: 'EC2-OVER_PROVISIONED',
          kilowattHourSavings: 0,
          resourceId: 'i-0c80d1b0f3a0c5c69',
          instanceName: 'PA-VM-100 | Networks',
          co2eSavings: 3,
          recommendationDetail: 't3.xlarge',
          costSavings: 33.79,
        },
        {
          cloudProvider: 'AWS',
          accountId: '0987654321',
          accountName: '0987654321',
          region: 'us-east-1',
          recommendationType: 'Modify',
          resourceId: 'i-0c40d2b0p5a0c4c72',
          recommendationDetail: 'Modify instance: instance-name',
          kilowattHourSavings: 5,
          co2eSavings: 6.12,
          costSavings: 3,
        },
        {
          cloudProvider: 'AWS',
          accountId: '0987654321',
          accountName: '0987654321',
          region: 'us-east-1',
          recommendationType: 'Modify',
          kilowattHourSavings: 0,
          resourceId: 'i-0c90f1b0p8a0c4c47',
          recommendationDetail: 't3.xlarge',
          co2eSavings: 8,
          costSavings: 45.72,
        },
      ]

      const getComputeOptimizerRecommendations = jest.spyOn(
        ComputeOptimizerRecommendations.prototype,
        'getRecommendations',
      )
      getComputeOptimizerRecommendations.mockResolvedValue(
        mockComputeOptimizerRecommendations,
      )

      const getRightsizingRecommendations = jest.spyOn(
        RightsizingRecommendations.prototype,
        'getRecommendations',
      )

      getRightsizingRecommendations.mockResolvedValue(
        mockRightsizingRecommendations,
      )

      const result = await testAwsAccount.getDataForRecommendations(
        AWS_DEFAULT_RECOMMENDATION_TARGET,
      )

      expect(result).toEqual(expectedRecommendations)
    })
  })
})

function expectAWSService(key: string) {
  setConfig({
    AWS: {
      CURRENT_SERVICES: [{ key: key, name: '' }],
    },
  })
  const testRegion = 'some-region'
  const AWSAccount = require('../application/AWSAccount').default
  const services = new AWSAccount('12345678', 'test account', [
    testRegion,
  ]).getServices(testRegion)
  return expect(services[0])
}

function getExpectedEstimationResult(startDate: Date = new Date()) {
  const testAccountId = 'test account'
  const region = 'region-a'
  return [
    {
      timestamp: new Date(startDate),
      serviceEstimates: [
        {
          cloudProvider: 'AWS',
          accountId: testAccountId,
          accountName: testAccountId,
          serviceName: 'serviceOne',
          kilowattHours: 2,
          co2e: 2,
          cost: 3,
          region: region,
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'AWS',
          accountId: testAccountId,
          accountName: testAccountId,
          serviceName: 'serviceTwo',
          kilowattHours: 1,
          co2e: 1,
          cost: 4,
          region: region,
          usesAverageCPUConstant: false,
        },
      ],
      periodStartDate: new Date(startDate),
      periodEndDate: getPeriodEndDate(new Date(startDate), GroupBy.day),
      groupBy: GroupBy.day,
    },
  ]
}
