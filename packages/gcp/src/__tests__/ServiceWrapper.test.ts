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
import { mockRecommendationsResults } from './fixtures/recommender.fixtures'
import { mockedProjects } from './fixtures/resourceManager.fixtures'
import { compute_v1 } from 'googleapis'
import Schema$Instance = compute_v1.Schema$Instance
import Schema$MachineType = compute_v1.Schema$MachineType
import { RecommenderClient } from '@google-cloud/recommender'

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

describe('GCP Service Wrapper', () => {
  const serviceWrapper = new ServiceWrapper(
    new Resource(),
    mockGoogleAuthClient,
    mockGoogleComputeClient,
    new RecommenderClient(),
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

  it('gets instance details', async () => {
    const instanceDetails: Schema$Instance =
      await serviceWrapper.getInstanceDetails(
        'project',
        'us-west1-b',
        'test-instance',
      )

    const expectedResult: any = {
      machineType:
        'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/machineTypes/n2-standard-32',
      disks: [],
    }

    expect(instanceDetails).toEqual(expectedResult)
  })

  it('gets machine type details', async () => {
    const machineTypeDetails: Schema$MachineType =
      await serviceWrapper.getMachineTypeDetails(
        'project',
        'us-west1-b',
        'test-instance',
      )

    const expectedResult = {
      guestCpus: 32,
    }

    expect(machineTypeDetails).toEqual(expectedResult)
  })

  it('gets the storage type from a disk name', () => {
    const ssdStorageType = serviceWrapper.getStorageTypeFromDiskName('ssd-test')
    const hddStorageType = serviceWrapper.getStorageTypeFromDiskName('hdd-test')

    expect(ssdStorageType).toBe('SSD')
    expect(hddStorageType).toBe('HDD')
  })
})
