/*
 * © 2021 ThoughtWorks, Inc.
 */

import {
  ComputeEstimator,
  StorageEstimator,
} from '@cloud-carbon-footprint/core'
import { Project } from '@google-cloud/resource-manager'
import { GCP_CLOUD_CONSTANTS } from '../domain'
import Recommendations from '../lib/Recommendations'

const projects: Partial<Project>[][] = [
  [
    {
      id: 'project',
      metadata: {
        name: 'project-name',
        lifecycleState: 'ACTIVE',
      },
    },
  ],
]

jest.mock('@google-cloud/resource-manager', () => ({
  Resource: jest.fn().mockImplementation(() => ({
    getProjects: jest.fn().mockResolvedValue(projects),
  })),
}))

const mockedInstanceResultItems: any = {
  data: {
    items: {
      'zones/us-central1-a': ['us-central1-a', 'us-central1-c'],
      'zones/us-central1-b': [],
    },
  },
}

const googleAuthClient = jest.mock('googleapis', () => ({
  google: jest.fn().mockImplementation(() => ({
    compute: jest.fn().mockResolvedValue(mockedInstanceResultItems),
    auth: jest.fn().mockImplementation(() => ({
      getClient: jest.fn().mockResolvedValue({}),
    })),
  })),
}))

describe('GCP Recommendations Service', () => {
  it('return recommendations for stop VM', async () => {
    const recommendationsService = new Recommendations(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      googleAuthClient,
    )

    const recommendations = await recommendationsService.getRecommendations()

    expect(recommendations).toEqual([])
  })
})
