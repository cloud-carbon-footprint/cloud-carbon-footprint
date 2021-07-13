/*
 * © 2021 ThoughtWorks, Inc.
 */

import { Resource } from '@google-cloud/resource-manager'
import ServiceWrapper from '../lib/ServiceWrapper'
import {
  ActiveProject,
  RecommenderRecommendations,
} from '../lib/RecommendationsTypes'
import {
  mockGoogleAuthClient,
  mockGoogleComputeClient,
} from './fixtures/googleapis.fixtures'
import {
  mockRecommendationsResults,
  mockRecommenderClient,
} from './fixtures/recommender.fixtures'
import { mockedProjects } from './fixtures/resourceManager.fixtures'

jest.mock('@google-cloud/resource-manager', () => ({
  Resource: jest.fn().mockImplementation(() => ({
    getProjects: jest.fn().mockResolvedValue(mockedProjects),
  })),
}))

describe('GCP Service Wrapper', () => {
  const serviceWrapper = new ServiceWrapper(
    new Resource(),
    mockGoogleAuthClient,
    mockGoogleComputeClient,
    mockRecommenderClient,
  )

  it('gets active projects', async () => {
    const activeProjectsAndZones: ActiveProject[] =
      await serviceWrapper.getActiveProjectsAndZones()

    const expectedResult: ActiveProject[] = [
      {
        id: 'project',
        name: 'project-name',
        zones: ['us-west1-a', 'global'],
      },
    ]

    expect(activeProjectsAndZones).toEqual(expectedResult)
  })

  it('gets recommendations by recommender ids', async () => {
    const activeProjectsAndZones: ActiveProject[] =
      await serviceWrapper.getActiveProjectsAndZones()

    const recommendations: RecommenderRecommendations[] =
      await serviceWrapper.getRecommendationsByRecommenderIds(
        activeProjectsAndZones[0],
        'us-west1-a',
      )

    const expectedResult: RecommenderRecommendations[] = [
      {
        id: 'google.compute.image.IdleResourceRecommender',
        zone: 'us-west1-a',
        recommendations: mockRecommendationsResults[0],
      },
      {
        id: 'google.compute.address.IdleResourceRecommender',
        zone: 'us-west1-a',
        recommendations: [],
      },
      {
        id: 'google.compute.disk.IdleResourceRecommender',
        zone: 'us-west1-a',
        recommendations: [],
      },
      {
        id: 'google.compute.instance.IdleResourceRecommender',
        zone: 'us-west1-a',
        recommendations: [],
      },
      {
        id: 'google.compute.instance.MachineTypeRecommender',
        zone: 'us-west1-a',
        recommendations: [],
      },
      {
        id: 'google.compute.instanceGroupManager.MachineTypeRecommender',
        zone: 'us-west1-a',
        recommendations: [],
      },
      {
        id: 'google.logging.productSuggestion.ContainerRecommender',
        zone: 'us-west1-a',
        recommendations: [],
      },
      {
        id: 'google.monitoring.productSuggestion.ComputeRecommender',
        zone: 'us-west1-a',
        recommendations: [],
      },
    ]

    expect(recommendations).toEqual(expectedResult)
  })
})
