/*
 * © 2021 ThoughtWorks, Inc.
 */
import { google } from 'googleapis'
import { RecommenderClient } from '@google-cloud/recommender'
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
  mockedAddressesResultItems,
  mockedDisksResultItems,
  mockedInstanceResultItems,
  mockedMachineTypesGetItems,
} from './fixtures/googleapis.fixtures'
import { mockRecommendationsResults } from './fixtures/recommender.fixtures'

jest.mock('moment', () => {
  return () => jest.requireActual('moment')('2020-04-01T00:00:00.000Z')
})

jest.mock('@google-cloud/resource-manager', () => ({
  Resource: jest.fn().mockImplementation(() => ({
    getProjects: jest.fn().mockResolvedValue(mockedProjects),
  })),
}))

jest.mock('@google-cloud/recommender', () => ({
  RecommenderClient: jest.fn().mockImplementation(() => ({
    listRecommendations: jest
      .fn()
      .mockResolvedValueOnce(mockRecommendationsResults)
      .mockResolvedValue([[]]),
    projectLocationRecommenderPath: jest.fn(),
  })),
}))

describe('GCP Recommendations Service', () => {
  let googleAuthClient: any
  let googleComputeClient: any

  beforeAll(async () => {
    const getClientSpy = jest.spyOn(google.auth, 'getClient')

    ;(getClientSpy as jest.Mock).mockResolvedValue(jest.fn())

    googleAuthClient = await google.auth.getClient({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })
    googleComputeClient = google.compute('v1')
  })

  it('return recommendations for stop VM', async () => {
    setupAggregatedListSpy(
      googleComputeClient.instances,
      mockedInstanceResultItems,
    )
    setupAggregatedListSpy(googleComputeClient.disks, mockedDisksResultItems)
    setupAggregatedListSpy(
      googleComputeClient.addresses,
      mockedAddressesResultItems,
    )

    setupGetSpy(googleComputeClient.machineTypes, mockedMachineTypesGetItems)

    const mockedInstanceGetItems: any = {
      data: {
        machineType:
          'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/machineTypes/n2-standard-32',
      },
    }

    setupGetSpy(googleComputeClient.instances, mockedInstanceGetItems)

    const recommendationsService = new Recommendations(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new ServiceWrapper(
        new Resource(),
        googleAuthClient,
        googleComputeClient,
        new RecommenderClient(),
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
  function setupAggregatedListSpy(spyMethod: any, result: any): void {
    const aggregatedListSpy = jest.spyOn(spyMethod, 'aggregatedList')
    ;(aggregatedListSpy as jest.Mock).mockResolvedValue(result)
  }

  function setupGetSpy(spyMethod: any, result: any): void {
    const getSpy = jest.spyOn(spyMethod, 'get')
    ;(getSpy as jest.Mock).mockResolvedValue(result)
  }
})
