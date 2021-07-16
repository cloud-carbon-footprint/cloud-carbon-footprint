/*
 * © 2021 ThoughtWorks, Inc.
 */
import { google } from 'googleapis'
import { APIEndpoint } from 'googleapis-common'
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
import { setupSpy, setupSpyWithMultipleValues } from './helpers'
import {
  mockChangeMachineTypeRecommendationsResults,
  mockStopVMRecommendationsResults,
} from './fixtures/recommender.fixtures'
import {
  mockedAddressesResultItems,
  mockedDisksResultItems,
  mockedInstanceGetItems,
  mockedInstanceGetItemsNew,
  mockedInstanceGetItemsCurrent,
  mockedInstanceGetItemsWithBothDisks,
  mockedInstanceGetItemsWithHDDDisks,
  mockedInstanceGetItemsWithSSDDisks,
  mockedInstanceResultItems,
  mockedMachineTypesGetItems,
  mockedMachineTypesGetItemsNew,
  mockedMachineTypesGetItemsCurrent,
} from './fixtures/googleapis.fixtures'

jest.mock('moment', () => {
  return () => jest.requireActual('moment')('2020-04-01T00:00:00.000Z')
})

jest.mock('@google-cloud/resource-manager', () => ({
  Resource: jest.fn().mockImplementation(() => ({
    getProjects: jest.fn().mockResolvedValue(mockedProjects),
  })),
}))

const mockListRecommendations = jest.fn()

jest.mock('@google-cloud/recommender', () => ({
  RecommenderClient: jest.fn().mockImplementation(() => ({
    listRecommendations: mockListRecommendations,
    projectLocationRecommenderPath: jest.fn(),
  })),
}))

describe('GCP Recommendations Service', () => {
  let googleAuthClient: any
  let googleComputeClient: APIEndpoint

  beforeAll(async () => {
    const getClientSpy = jest.spyOn(google.auth, 'getClient')

    ;(getClientSpy as jest.Mock).mockResolvedValue(jest.fn())

    googleAuthClient = await google.auth.getClient({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })
    googleComputeClient = google.compute('v1')

    setupSpy(
      googleComputeClient.instances,
      'aggregatedList',
      mockedInstanceResultItems,
    )
    setupSpy(
      googleComputeClient.disks,
      'aggregatedList',
      mockedDisksResultItems,
    )
    setupSpy(
      googleComputeClient.addresses,
      'aggregatedList',
      mockedAddressesResultItems,
    )
  })

  describe('Stop VM Recommendations', () => {
    beforeAll(() => {
      setupSpy(
        googleComputeClient.machineTypes,
        'get',
        mockedMachineTypesGetItems,
      )
    })

    it('returns recommendations for stop VM with no storage', async () => {
      mockListRecommendations
        .mockResolvedValueOnce(mockStopVMRecommendationsResults)
        .mockResolvedValue([[]])
      setupSpy(googleComputeClient.instances, 'get', mockedInstanceGetItems)

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
          recommendationDetail:
            "Save cost by stopping Idle VM 'test-instance'.",
          kilowattHourSavings: 58.530816,
          co2eSavings: 0.006848105472,
          costSavings: 15,
        },
      ]

      expect(recommendations).toEqual(expectedResult)
    })

    it('returns recommendations for stop VM with an SSD disk for storage', async () => {
      mockListRecommendations
        .mockResolvedValueOnce(mockStopVMRecommendationsResults)
        .mockResolvedValue([[]])
      setupSpy(
        googleComputeClient.instances,
        'get',
        mockedInstanceGetItemsWithSSDDisks,
      )

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
          recommendationDetail:
            "Save cost by stopping Idle VM 'test-instance'.",
          kilowattHourSavings: 58.5497376,
          co2eSavings: 0.0068503192992,
          costSavings: 15,
        },
      ]

      expect(recommendations).toEqual(expectedResult)
    })

    it('returns recommendations for stop VM with an HDD disk for storage', async () => {
      mockListRecommendations
        .mockResolvedValueOnce(mockStopVMRecommendationsResults)
        .mockResolvedValue([[]])
      setupSpy(
        googleComputeClient.instances,
        'get',
        mockedInstanceGetItemsWithHDDDisks,
      )

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
          recommendationDetail:
            "Save cost by stopping Idle VM 'test-instance'.",
          kilowattHourSavings: 58.5410652,
          co2eSavings: 0.0068493046284,
          costSavings: 15,
        },
      ]

      expect(recommendations).toEqual(expectedResult)
    })

    it('returns recommendations for stop VM with an HDD and SSD disks for storage', async () => {
      mockListRecommendations
        .mockResolvedValueOnce(mockStopVMRecommendationsResults)
        .mockResolvedValue([[]])
      setupSpy(
        googleComputeClient.instances,
        'get',
        mockedInstanceGetItemsWithBothDisks,
      )

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
          recommendationDetail:
            "Save cost by stopping Idle VM 'test-instance'.",
          kilowattHourSavings: 58.559986800000004,
          co2eSavings: 0.0068515184556,
          costSavings: 15,
        },
      ]

      expect(recommendations).toEqual(expectedResult)
    })
  })

  it('returns recommendations for change machine type', async () => {
    mockListRecommendations
      .mockResolvedValueOnce(mockChangeMachineTypeRecommendationsResults)
      .mockResolvedValue([[]])

    setupSpyWithMultipleValues(
      googleComputeClient.instances,
      'get',
      mockedInstanceGetItemsCurrent,
      mockedInstanceGetItemsNew,
    )

    setupSpyWithMultipleValues(
      googleComputeClient.machineTypes,
      'get',
      mockedMachineTypesGetItemsCurrent,
      mockedMachineTypesGetItemsNew,
    )

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
        recommendationType: 'CHANGE_MACHINE_TYPE',
        recommendationDetail:
          'Save cost by changing machine type from e2-medium to e2-small.',
        kilowattHourSavings: 1.6832339999999997,
        co2eSavings: 0.00019693837799999997,
        costSavings: 20,
      },
    ]

    expect(recommendations).toEqual(expectedResult)
  })
})
