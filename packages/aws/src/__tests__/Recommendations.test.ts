/*
 * © 2021 ThoughtWorks, Inc.
 */
import { GetRightsizingRecommendationResponse } from 'aws-sdk/clients/costexplorer'
import AWSMock from 'aws-sdk-mock'
import AWS, { CloudWatch, CloudWatchLogs, CostExplorer } from 'aws-sdk'

import { ComputeEstimator, MemoryEstimator } from '@cloud-carbon-footprint/core'
import { RecommendationResult } from '@cloud-carbon-footprint/common'

import Recommendations from '../lib/Recommendations'
import { rightsizingRecommendationTerminate } from './fixtures/costExplorer.fixtures'
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

  it('Get recommendations from Rightsizing API type: Terminate', async () => {
    mockGetRightsizingRecommendation(rightsizingRecommendationTerminate)

    const awsRecommendationsServices = new Recommendations(
      new ComputeEstimator(),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      getServiceWrapper(),
    )

    const result = await awsRecommendationsServices.getRecommendations()

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
        recommendationDetail: 'Terminate instance "Test instance"',
        kilowattHourSavings: 274.19171644799997,
        co2eSavings: 0.12069562908809578,
        costSavings: 20,
      },
    ]

    expect(result).toEqual(expectedResult)
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
