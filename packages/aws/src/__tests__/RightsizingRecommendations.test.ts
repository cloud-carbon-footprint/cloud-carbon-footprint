/*
 * © 2021 Thoughtworks, Inc.
 */
import {
  GetRightsizingRecommendationCommand,
  GetRightsizingRecommendationCommandOutput,
} from '@aws-sdk/client-cost-explorer'
import { mockClient } from 'aws-sdk-client-mock'
import moment from 'moment'
import { CloudWatchClient } from '@aws-sdk/client-cloudwatch'
import { CostExplorerClient } from '@aws-sdk/client-cost-explorer'
import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs'
import { S3Client } from '@aws-sdk/client-s3'

import { ComputeEstimator, MemoryEstimator } from '@cloud-carbon-footprint/core'
import {
  AWS_DEFAULT_RECOMMENDATION_TARGET,
  AWS_RECOMMENDATIONS_TARGETS,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'

import {
  rightsizingCrossFamilyRecommendationModify,
  rightsizingCrossFamilyRecommendationTerminate,
  rightsizingRecommendationModify,
  rightsizingRecommendationTerminate,
} from './fixtures/costExplorer.fixtures'
import { AWS_CLOUD_CONSTANTS } from '../domain'
import { ServiceWrapper, RightsizingRecommendations } from '../lib'

describe('AWS Rightsizing Recommendations Service', () => {
  const getServiceWrapper = () =>
    new ServiceWrapper(
      new CloudWatchClient(),
      new CloudWatchLogsClient(),
      new CostExplorerClient(),
      new S3Client(),
    )

  const costExplorerMock = mockClient(CostExplorerClient)

  afterEach(() => {
    costExplorerMock.reset()
    jest.restoreAllMocks()
    getRightsizingRecommendationSpy.mockClear()
  })

  const getRightsizingRecommendationSpy = jest.fn()

  function mockGetRightsizingRecommendation(
    response: GetRightsizingRecommendationCommandOutput,
  ) {
    costExplorerMock.on(GetRightsizingRecommendationCommand).resolves(response)
  }

  it('Get recommendations from Rightsizing API type: Terminate with pagination', async () => {
    moment.now = function () {
      return +new Date('2020-04-01T00:00:00.000Z')
    }
    mockGetRightsizingRecommendation(rightsizingRecommendationTerminate)

    const awsRecommendationsServices = new RightsizingRecommendations(
      new ComputeEstimator(),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      getServiceWrapper(),
    )

    const result = await awsRecommendationsServices.getRecommendations(
      AWS_DEFAULT_RECOMMENDATION_TARGET,
    )

    const calls = costExplorerMock.commandCalls(
      GetRightsizingRecommendationCommand,
    )

    expect(calls).toHaveLength(1)

    expect(calls[0].args[0].input).toEqual({
      Service: 'AmazonEC2',
      Configuration: {
        BenefitsConsidered: false,
        RecommendationTarget: 'SAME_INSTANCE_FAMILY',
      },
    })

    const expectedResult: RecommendationResult[] = [
      {
        cloudProvider: 'AWS',
        accountId: 'test-account',
        accountName: 'test-account',
        region: 'us-east-2',
        recommendationType: 'TERMINATE',
        recommendationDetail: 'TERMINATE instance: test-instance-name.',
        kilowattHourSavings: 272.409501312,
        resourceId: 'test-id',
        instanceName: 'test-instance-name',
        co2eSavings: 0.10246092769914705,
        costSavings: 20,
      },
      {
        cloudProvider: 'AWS',
        accountId: 'test-account-1',
        accountName: 'test-account-1',
        region: 'us-east-2',
        recommendationType: 'TERMINATE',
        recommendationDetail: 'TERMINATE instance: test-instance-name.',
        kilowattHourSavings: 60.276672000000005,
        resourceId: 'test-id',
        instanceName: 'test-instance-name',
        co2eSavings: 0.0226717632901637,
        costSavings: 80,
      },
      {
        cloudProvider: 'AWS',
        accountId: 'test-account-2',
        accountName: 'test-account-2',
        region: 'us-east-2',
        recommendationType: 'TERMINATE',
        recommendationDetail: 'TERMINATE instance: test-instance-name.',
        kilowattHourSavings: 0.37672920000000004,
        resourceId: 'test-id',
        instanceName: 'test-instance-name',
        co2eSavings: 0.00014169852056352314,
        costSavings: 20,
      },
      {
        accountId: 'test-account-3',
        accountName: 'test-account-3',
        cloudProvider: 'AWS',
        co2eSavings: 0.00014169852056352314,
        costSavings: 30,
        kilowattHourSavings: 0.37672920000000004,
        recommendationDetail: 'TERMINATE instance with Resource ID: test-id.',
        recommendationType: 'TERMINATE',
        region: 'us-east-2',
        resourceId: 'test-id',
        instanceName: '',
      },
    ]

    expect(result).toEqual(expectedResult)
  })

  it('Get recommendations from Rightsizing API type: Modify', async () => {
    moment.now = function () {
      return +new Date('2020-04-01T00:00:00.000Z')
    }
    mockGetRightsizingRecommendation(rightsizingRecommendationModify)

    const awsRecommendationsServices = new RightsizingRecommendations(
      new ComputeEstimator(),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      getServiceWrapper(),
    )

    const result = await awsRecommendationsServices.getRecommendations(
      AWS_DEFAULT_RECOMMENDATION_TARGET,
    )
    const calls = costExplorerMock.commandCalls(
      GetRightsizingRecommendationCommand,
    )

    expect(calls).toHaveLength(1)

    expect(calls[0].args[0].input).toEqual({
      Service: 'AmazonEC2',
      Configuration: {
        BenefitsConsidered: false,
        RecommendationTarget: 'SAME_INSTANCE_FAMILY',
      },
    })
    const expectedResult: RecommendationResult[] = [
      {
        cloudProvider: 'AWS',
        accountId: 'test-account',
        accountName: 'test-account',
        region: 'us-east-2',
        recommendationType: 'MODIFY',
        recommendationDetail:
          'MODIFY instance: test-instance-name. Update instance type t2.micro to t2.nano',
        kilowattHourSavings: 0.18836460000000002,
        resourceId: 'Test-resource-id',
        instanceName: 'test-instance-name',
        co2eSavings: 0.00007084926028176157,
        costSavings: 226,
      },
    ]

    expect(result).toEqual(expectedResult)
  })

  it('Get recommendations from Rightsizing API type: Terminate with Cross Family parameter', async () => {
    moment.now = function () {
      return +new Date('2020-04-01T00:00:00.000Z')
    }
    mockGetRightsizingRecommendation(
      rightsizingCrossFamilyRecommendationTerminate,
    )

    const awsRecommendationsServices = new RightsizingRecommendations(
      new ComputeEstimator(),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      getServiceWrapper(),
    )

    const result = await awsRecommendationsServices.getRecommendations(
      AWS_RECOMMENDATIONS_TARGETS.CROSS_INSTANCE_FAMILY,
    )

    const calls = costExplorerMock.commandCalls(
      GetRightsizingRecommendationCommand,
    )

    expect(calls).toHaveLength(1)

    expect(calls[0].args[0].input).toEqual({
      Service: 'AmazonEC2',
      Configuration: {
        BenefitsConsidered: false,
        RecommendationTarget: AWS_RECOMMENDATIONS_TARGETS.CROSS_INSTANCE_FAMILY,
      },
    })
    const expectedResult: RecommendationResult[] = [
      {
        cloudProvider: 'AWS',
        accountId: 'test-account',
        accountName: 'test-account',
        region: 'us-east-2',
        recommendationType: 'TERMINATE',
        recommendationDetail: 'TERMINATE instance: test-instance-name.',
        kilowattHourSavings: 0.37672920000000004,
        resourceId: 'Test-resource-id',
        instanceName: 'test-instance-name',
        co2eSavings: 0.00014169852056352314,
        costSavings: 20,
      },
    ]

    expect(result).toEqual(expectedResult)
  })

  it('Get recommendations from Rightsizing API type: Modify with Cross Family parameter', async () => {
    moment.now = function () {
      return +new Date('2020-04-01T00:00:00.000Z')
    }
    mockGetRightsizingRecommendation(rightsizingCrossFamilyRecommendationModify)

    const awsRecommendationsServices = new RightsizingRecommendations(
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
        recommendationType: 'MODIFY',
        recommendationDetail:
          'MODIFY instance: test-instance-name. Update instance type t2.micro to t3.micro',
        kilowattHourSavings: -0.37672920000000004,
        resourceId: 'Test-resource-id',
        instanceName: 'test-instance-name',
        co2eSavings: -0.00014169852056352314,
        costSavings: 20,
      },
    ]

    expect(result).toEqual(expectedResult)
  })

  it('Logs the error response if there is a problem getting recommendations', async () => {
    getRightsizingRecommendationSpy.mockRejectedValue({
      message: 'error-test',
    })
    costExplorerMock
      .on(GetRightsizingRecommendationCommand)
      .callsFake(getRightsizingRecommendationSpy)

    const awsRecommendationsServices = new RightsizingRecommendations(
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
})
