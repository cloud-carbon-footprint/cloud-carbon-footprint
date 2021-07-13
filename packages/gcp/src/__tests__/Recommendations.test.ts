/*
 * © 2021 ThoughtWorks, Inc.
 */

import { Resource } from '@google-cloud/resource-manager'
import { RecommendationResult } from '@cloud-carbon-footprint/common'
import {
  ComputeEstimator,
  StorageEstimator,
} from '@cloud-carbon-footprint/core'
import { GCP_CLOUD_CONSTANTS } from '../domain'
import Recommendations from '../lib/Recommendations'
import ServiceWrapper from '../lib/ServiceWrapper'
import { mockedProjects } from './fixtures/resourceManager.fixtures'
import {
  mockGoogleAuthClient,
  mockGoogleComputeClient,
} from './fixtures/googleapis.fixtures'
import { mockRecommenderClient } from './fixtures/recommender.fixtures'

jest.mock('moment', () => {
  return () => jest.requireActual('moment')('2020-04-01T00:00:00.000Z')
})

jest.mock('@google-cloud/resource-manager', () => ({
  Resource: jest.fn().mockImplementation(() => ({
    getProjects: jest.fn().mockResolvedValue(mockedProjects),
  })),
}))

jest.mock('googleapis', () => ({
  google: jest.fn().mockImplementation(() => ({
    compute: mockGoogleComputeClient,
    auth: jest.fn().mockImplementation(() => ({
      getClient: jest.fn().mockResolvedValue(mockGoogleAuthClient),
    })),
  })),
}))

describe('GCP Recommendations Service', () => {
  it('return recommendations for stop VM', async () => {
    const recommendationsService = new Recommendations(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      mockGoogleAuthClient,
      mockGoogleComputeClient,
      mockRecommenderClient,
      new ServiceWrapper(
        new Resource(),
        mockGoogleAuthClient,
        mockGoogleComputeClient,
        mockRecommenderClient,
      ),
    )

    const recommendations = await recommendationsService.getRecommendations()

    const expectedResult: RecommendationResult[] = [
      {
        cloudProvider: 'GCP',
        accountId: 'project',
        accountName: 'project-name',
        region: 'us-west1',
        recommendationType: 'STOP_VM',
        recommendationDetail: "Save cost by stopping Idle VM 'test-instance'.",
        kilowattHourSavings: 58.530816,
        co2eSavings: 0.006848105472,
        costSavings: 15,
      },
    ]

    expect(recommendations).toEqual(expectedResult)
  })
})
