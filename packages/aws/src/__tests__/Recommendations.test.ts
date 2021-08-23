/*
 * © 2021 Thoughtworks, Inc.
 */
import { GetRightsizingRecommendationResponse } from 'aws-sdk/clients/costexplorer'
import AWSMock from 'aws-sdk-mock'
import AWS, { CloudWatch, CloudWatchLogs, CostExplorer } from 'aws-sdk'

import { ComputeEstimator, MemoryEstimator } from '@cloud-carbon-footprint/core'
import {
  AWS_DEFAULT_RECOMMENDATION_TARGET,
  AWS_RECOMMENDATIONS_TARGETS,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'

import { Recommendations } from '../lib/Recommendations'
import {
  rightsizingCrossFamilyRecommendationModify,
  rightsizingCrossFamilyRecommendationTerminate,
  rightsizingRecommendationModify,
  rightsizingRecommendationTerminate,
} from './fixtures/costExplorer.fixtures'
import { AWS_CLOUD_CONSTANTS } from '../domain/AwsFootprintEstimationConstants'
import { ServiceWrapper } from '../lib/ServiceWrapper'

jest.mock('moment', () => {
  return () => jest.requireActual('moment')('2020-04-01T00:00:00.000Z')
})

describe('AWS Recommendations Service', () => {
  const getServiceWrapper = () =>
    new ServiceWrapper(
      new CloudWatch(),
      new CloudWatchLogs(),
      new CostExplorer(),
    )

  beforeAll(() => {
    AWSMock.setSDKInstance(AWS)
  })

  afterEach(() => {
    AWSMock.restore()
    jest.restoreAllMocks()
    getRightsizingRecommendationSpy.mockClear()
  })

  it('Get recommendations from Rightsizing API type: Terminate with pagination', async () => {
    mockGetRightsizingRecommendation(rightsizingRecommendationTerminate)

    const awsRecommendationsServices = new Recommendations(
      new ComputeEstimator(),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      getServiceWrapper(),
    )

    const result = await awsRecommendationsServices.getRecommendations(
      AWS_DEFAULT_RECOMMENDATION_TARGET,
    )

    expect(getRightsizingRecommendationSpy).toHaveBeenCalledWith(
      {
        Service: 'AmazonEC2',
        Configuration: {
          BenefitsConsidered: false,
          RecommendationTarget: 'SAME_INSTANCE_FAMILY',
        },
      },
      expect.anything(),
    )
    const expectedResult: RecommendationResult[] = [
      {
        cloudProvider: 'AWS',
        accountId: 'test-account',
        accountName: 'test-account',
        region: 'us-east-2',
        recommendationType: 'Terminate',
        recommendationDetail: 'Terminate instance: test-instance-name.',
        kilowattHourSavings: 272.409501312,
        resourceId: 'test-id',
        instanceName: 'test-instance-name',
        co2eSavings: 0.11991112115402533,
        costSavings: 20,
      },
      {
        cloudProvider: 'AWS',
        accountId: 'test-account-1',
        accountName: 'test-account-1',
        region: 'us-east-2',
        recommendationType: 'Terminate',
        recommendationDetail: 'Terminate instance: test-instance-name.',
        kilowattHourSavings: 60.276672000000005,
        resourceId: 'test-id',
        instanceName: 'test-instance-name',
        co2eSavings: 0.026533007417664,
        costSavings: 80,
      },
      {
        cloudProvider: 'AWS',
        accountId: 'test-account-2',
        accountName: 'test-account-2',
        region: 'us-east-2',
        recommendationType: 'Terminate',
        recommendationDetail: 'Terminate instance: test-instance-name.',
        kilowattHourSavings: 0.37672920000000004,
        resourceId: 'test-id',
        instanceName: 'test-instance-name',
        co2eSavings: 0.0001658312963604,
        costSavings: 20,
      },
      {
        accountId: 'test-account-3',
        accountName: 'test-account-3',
        cloudProvider: 'AWS',
        co2eSavings: 0.0001658312963604,
        costSavings: 30,
        kilowattHourSavings: 0.37672920000000004,
        recommendationDetail: 'Terminate instance with Resource ID: test-id.',
        recommendationType: 'Terminate',
        region: 'us-east-2',
        resourceId: 'test-id',
        instanceName: '',
      },
    ]

    expect(result).toEqual(expectedResult)
  })

  it('Get recommendations from Rightsizing API type: Modify', async () => {
    mockGetRightsizingRecommendation(rightsizingRecommendationModify)

    const awsRecommendationsServices = new Recommendations(
      new ComputeEstimator(),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      getServiceWrapper(),
    )

    const result = await awsRecommendationsServices.getRecommendations(
      AWS_DEFAULT_RECOMMENDATION_TARGET,
    )

    expect(getRightsizingRecommendationSpy).toHaveBeenCalledWith(
      {
        Service: 'AmazonEC2',
        Configuration: {
          BenefitsConsidered: false,
          RecommendationTarget: 'SAME_INSTANCE_FAMILY',
        },
      },
      expect.anything(),
    )
    const expectedResult: RecommendationResult[] = [
      {
        cloudProvider: 'AWS',
        accountId: 'test-account',
        accountName: 'test-account',
        region: 'us-east-2',
        recommendationType: 'Modify',
        recommendationDetail:
          'Modify instance: test-instance-name. Update instance type t2.micro to t2.nano',
        kilowattHourSavings: 0.18836460000000002,
        resourceId: 'Test-resource-id',
        instanceName: 'test-instance-name',
        co2eSavings: 0.0000829156481802,
        costSavings: 226,
      },
    ]

    expect(result).toEqual(expectedResult)
  })

  it('Get recommendations from Rightsizing API type: Terminate with Cross Family parameter', async () => {
    mockGetRightsizingRecommendation(
      rightsizingCrossFamilyRecommendationTerminate,
    )

    const awsRecommendationsServices = new Recommendations(
      new ComputeEstimator(),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      getServiceWrapper(),
    )

    const result = await awsRecommendationsServices.getRecommendations(
      AWS_RECOMMENDATIONS_TARGETS.CROSS_INSTANCE_FAMILY,
    )

    expect(getRightsizingRecommendationSpy).toHaveBeenCalledWith(
      {
        Service: 'AmazonEC2',
        Configuration: {
          BenefitsConsidered: false,
          RecommendationTarget:
            AWS_RECOMMENDATIONS_TARGETS.CROSS_INSTANCE_FAMILY,
        },
      },
      expect.anything(),
    )
    const expectedResult: RecommendationResult[] = [
      {
        cloudProvider: 'AWS',
        accountId: 'test-account',
        accountName: 'test-account',
        region: 'us-east-2',
        recommendationType: 'Terminate',
        recommendationDetail: 'Terminate instance: test-instance-name.',
        kilowattHourSavings: 0.37672920000000004,
        resourceId: 'Test-resource-id',
        instanceName: 'test-instance-name',
        co2eSavings: 0.0001658312963604,
        costSavings: 20,
      },
    ]

    expect(result).toEqual(expectedResult)
  })

  it('Get recommendations from Rightsizing API type: Modify with Cross Family parameter', async () => {
    mockGetRightsizingRecommendation(rightsizingCrossFamilyRecommendationModify)

    const awsRecommendationsServices = new Recommendations(
      new ComputeEstimator(),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      getServiceWrapper(),
    )

    const result = await awsRecommendationsServices.getRecommendations(
      AWS_RECOMMENDATIONS_TARGETS.CROSS_INSTANCE_FAMILY,
    )

    const expectedResult: RecommendationResult[] = [
      {
        cloudProvider: 'AWS',
        accountId: 'test-account',
        accountName: 'test-account',
        region: 'us-east-2',
        recommendationType: 'Modify',
        recommendationDetail:
          'Modify instance: test-instance-name. Update instance type t2.micro to t3.micro',
        kilowattHourSavings: -0.37672920000000004,
        resourceId: 'Test-resource-id',
        instanceName: 'test-instance-name',
        co2eSavings: -0.0001658312963604,
        costSavings: 20,
      },
    ]

    expect(result).toEqual(expectedResult)
  })

  it('Logs the error response if there is a problem getting recommendations', async () => {
    getRightsizingRecommendationSpy.mockRejectedValue({ message: 'error-test' })
    AWSMock.mock(
      'CostExplorer',
      'getRightsizingRecommendation',
      getRightsizingRecommendationSpy,
    )

    const awsRecommendationsServices = new Recommendations(
      new ComputeEstimator(),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      getServiceWrapper(),
    )

    await expect(() =>
      awsRecommendationsServices.getRecommendations(
        AWS_DEFAULT_RECOMMENDATION_TARGET,
      ),
    ).rejects.toThrow(
      `Failed to grab AWS Rightsizing recommendations. Reason: error-test`,
    )
  })

  const getRightsizingRecommendationSpy = jest.fn()

  function mockGetRightsizingRecommendation(
    response: GetRightsizingRecommendationResponse,
  ) {
    getRightsizingRecommendationSpy.mockResolvedValue(response)
    AWSMock.mock(
      'CostExplorer',
      'getRightsizingRecommendation',
      getRightsizingRecommendationSpy,
    )
  }
})
