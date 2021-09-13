/*
 * © 2021 Thoughtworks, Inc.
 */

import { Credentials } from 'aws-sdk'
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service'
import {
  Config as mockConfig,
  RecommendationResult,
  AWS_RECOMMENDATIONS_TARGETS,
  AWS_DEFAULT_RECOMMENDATION_TARGET,
  EstimationResult,
} from '@cloud-carbon-footprint/common'
import {
  EBS,
  S3,
  EC2,
  ElastiCache,
  RDS,
  Lambda,
  CostAndUsageReports,
} from '../lib'
import AWSCredentialsProvider from '../application/AWSCredentialsProvider'
import { Recommendations } from '../lib/Recommendations'
import { CloudProviderAccount } from '@cloud-carbon-footprint/core'

jest.mock('../application/AWSCredentialsProvider')

/* eslint-disable @typescript-eslint/no-var-requires */
describe('AWSAccount', () => {
  const CloudWatch = jest.fn()
  const CostExplorer = jest.fn()
  const CloudWatchLogs = jest.fn()
  const Athena = jest.fn()
  let expectedCredentials: Credentials

  beforeEach(() => {
    jest.doMock('aws-sdk', () => {
      return {
        CloudWatch: CloudWatch,
        CostExplorer: CostExplorer,
        CloudWatchLogs: CloudWatchLogs,
        Athena: Athena,
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
    mockConfig.AWS.CURRENT_SERVICES = []
    const AWSAccount = require('../application/AWSAccount').default
    const services = new AWSAccount().getServices()
    expect(services).toHaveLength(0)
  })

  it('should throw error if unknown service', () => {
    mockConfig.AWS.CURRENT_SERVICES = [
      {
        key: 'duck',
        name: '',
      },
    ]

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

    const result = await testAwsAccount.getDataForRegions(startDate, endDate)

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

  it('should get data for recommendations', async () => {
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
      Recommendations.prototype,
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
      Recommendations.prototype,
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
})

function expectAWSService(key: string) {
  mockConfig.AWS.CURRENT_SERVICES = [
    {
      key: key,
      name: '',
    },
  ]
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
    },
  ]
}
