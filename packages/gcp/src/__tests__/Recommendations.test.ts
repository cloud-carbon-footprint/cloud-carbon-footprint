/*
 * © 2021 ThoughtWorks, Inc.
 */

import {
  ComputeEstimator,
  StorageEstimator,
} from '@cloud-carbon-footprint/core'
import { GCP_CLOUD_CONSTANTS } from '../domain'
import Recommendations from '../lib/Recommendations'
import { RecommendationResult } from '@cloud-carbon-footprint/common'
import { mockedProjects } from './fixtures/resourceManager.fixtures'

jest.mock('moment', () => {
  return () => jest.requireActual('moment')('2020-04-01T00:00:00.000Z')
})

jest.mock('@google-cloud/resource-manager', () => ({
  Resource: jest.fn().mockImplementation(() => ({
    getProjects: jest.fn().mockResolvedValue(mockedProjects),
  })),
}))

const mockedInstanceResultItems: any = {
  data: {
    items: {
      'zones/us-west1-a': {
        instances: [{ id: 'test-instance' }],
      },
      'zones/us-west1-b': { warning: { code: 'NO_RESULTS_ON_PAGE' } },
    },
  },
}
const mockedDisksResultItems: any = {
  data: { items: {} },
}
const mockedAddressesResultItems: any = {
  data: { items: {} },
}
const mockedInstanceGetItems: any = {
  data: {
    machineType:
      'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/machineTypes/n2-standard-32',
  },
}
const mockedMachineTypesGetItems: any = {
  data: {
    guestCpus: 32,
  },
}

const mockGoogleAuthClient = jest.fn()
const mockGoogleComputeClient = {
  instances: {
    aggregatedList: jest.fn().mockResolvedValue(mockedInstanceResultItems),
    get: jest.fn().mockResolvedValue(mockedInstanceGetItems),
  },
  disks: {
    aggregatedList: jest.fn().mockResolvedValue(mockedDisksResultItems),
  },
  addresses: {
    aggregatedList: jest.fn().mockResolvedValue(mockedAddressesResultItems),
  },
  machineTypes: {
    get: jest.fn().mockResolvedValue(mockedMachineTypesGetItems),
  },
}

const mockRecommendationsResults: any = [
  [
    {
      additionalImpact: [],
      associatedInsights: [[Object]],
      name: 'project-name',
      description: "Save cost by stopping Idle VM 'test-instance'.",
      primaryImpact: {
        category: 'COST',
        costProjection: {
          cost: {
            units: -15,
            nanos: 0,
          },
        },
        projection: 'costProjection',
      },
      recommenderSubtype: 'STOP_VM',
    },
  ],
]

const mockRecommenderClient = {
  listRecommendations: jest
    .fn()
    .mockResolvedValueOnce(mockRecommendationsResults)
    .mockResolvedValue([[]]),
  projectLocationRecommenderPath: jest.fn(),
}

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
