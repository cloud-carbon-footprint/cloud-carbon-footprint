/*
 * © 2021 Thoughtworks, Inc.
 */

import { Resource } from '@google-cloud/resource-manager'
import { compute_v1, google } from 'googleapis'
import { GoogleAuth } from 'google-auth-library'
import { RecommenderClient } from '@google-cloud/recommender'
import { GoogleAuthClient, wait } from '@cloud-carbon-footprint/common'
import {
  InstanceData,
  mockedAddressesResultItems,
  mockedAddressGetDetails,
  mockedDisksGetSSDDetails,
  mockedDisksResultItems,
  mockedImageGetDetails,
  mockedInstanceGetItems,
  mockedInstanceResultItems,
  mockedMachineTypesGetItems,
} from './fixtures/googleapis.fixtures'
import Schema$Instance = compute_v1.Schema$Instance
import Schema$MachineType = compute_v1.Schema$MachineType

import ServiceWrapper from '../lib/ServiceWrapper'
import {
  ActiveProject,
  RecommenderRecommendations,
} from '../lib/RecommendationsTypes'

import { mockStopVMRecommendationsResults } from './fixtures/recommender.fixtures'
import { mockedProjects } from './fixtures/resourceManager.fixtures'
import { setupSpy, setupSpyWithRejectedValue } from './helpers'

jest.mock('@cloud-carbon-footprint/common', () => ({
  ...(jest.requireActual('@cloud-carbon-footprint/common') as Record<
    string,
    unknown
  >),
  wait: jest.fn(),
}))

jest.mock('@google-cloud/resource-manager', () => ({
  Resource: jest.fn().mockImplementation(() => ({
    getProjects: jest.fn().mockResolvedValue(mockedProjects),
  })),
}))

const mockRecommenderClientListRecommendations = jest.fn()
jest.mock('@google-cloud/recommender', () => ({
  RecommenderClient: jest.fn().mockImplementation(() => ({
    listRecommendations: mockRecommenderClientListRecommendations,
    projectLocationRecommenderPath: jest.fn(),
  })),
}))

describe('GCP Service Wrapper', () => {
  let serviceWrapper: ServiceWrapper

  beforeEach(async () => {
    const auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    })

    const getClientSpy = jest.spyOn(auth, 'getClient')

    ;(getClientSpy as jest.Mock).mockResolvedValue(jest.fn())

    const googleAuthClient: GoogleAuthClient = await auth.getClient()
    const googleComputeClient = google.compute('v1')

    serviceWrapper = new ServiceWrapper(
      new Resource(),
      googleAuthClient,
      googleComputeClient,
      new RecommenderClient(),
    )

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
    setupSpy(googleComputeClient.disks, 'get', mockedDisksGetSSDDetails)
    setupSpy(
      googleComputeClient.addresses,
      'aggregatedList',
      mockedAddressesResultItems,
    )
    setupSpy(
      googleComputeClient.machineTypes,
      'get',
      mockedMachineTypesGetItems,
    )
    setupSpy(googleComputeClient.instances, 'get', mockedInstanceGetItems)
    setupSpy(googleComputeClient.images, 'get', mockedImageGetDetails)
    setupSpy(googleComputeClient.addresses, 'get', mockedAddressGetDetails)
  })

  it('gets active projects', async () => {
    const activeProjectsAndZones: ActiveProject[] =
      await serviceWrapper.getActiveProjectsAndZones()

    const expectedResult: ActiveProject[] = [
      {
        id: 'project',
        name: 'project-name',
        zones: ['us-west1-a', 'us-east1-a', 'global'],
      },
    ]

    expect(activeProjectsAndZones).toEqual(expectedResult)
  })

  it('gets recommendations by recommender ids', async () => {
    mockRecommenderClientListRecommendations
      .mockResolvedValueOnce(mockStopVMRecommendationsResults)
      .mockResolvedValue([[]])

    const recommenderIds = ['test-id-1', 'test-id-2']

    const recommendations: RecommenderRecommendations[] =
      await serviceWrapper.getRecommendationsForRecommenderIds(
        'test-project-id',
        'us-west1-a',
        recommenderIds,
      )

    const expectedResult: RecommenderRecommendations[] = [
      {
        id: 'test-id-1',
        zone: 'us-west1-a',
        recommendations: mockStopVMRecommendationsResults[0],
      },
      {
        id: 'test-id-2',
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
        'test-instance',
        'us-west1-b',
      )

    const expectedResult: InstanceData = {
      data: {
        machineType:
          'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/machineTypes/n2-standard-32',
        disks: [],
        id: '12456789012',
        name: 'test-resource-name',
      },
    }

    expect(instanceDetails).toEqual(expectedResult.data)
  })

  it('gets machine type details', async () => {
    const machineTypeDetails: Schema$MachineType =
      await serviceWrapper.getMachineTypeDetails(
        'project',
        'test-instance',
        'us-west1-b',
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

  it('gets disks details', async () => {
    const diskDetails = await serviceWrapper.getDiskDetails(
      'project',
      'test-disk',
      'us-west1-b',
    )

    const expectedResult = {
      sizeGb: '20',
      type: 'https://www.googleapis.com/compute/v1/projects/techops-events/zones/us-central1-b/diskTypes/pd-standard-ssd',
      id: '12456789012',
      name: 'test-resource-name',
    }

    expect(diskDetails).toEqual(expectedResult)
  })

  it('gets image details', async () => {
    const imageDetails = await serviceWrapper.getImageDetails(
      'project',
      'test-image',
    )

    const expectedResult = {
      archiveSizeBytes: '580709696',
      id: '12456789012',
      name: 'test-resource-name',
    }

    expect(imageDetails).toEqual(expectedResult)
  })

  it('gets address details', async () => {
    const addressDetails = await serviceWrapper.getAddressDetails(
      'project',
      'test-address',
      'us-west1',
    )

    const expectedResult = {
      id: '123456789012345',
      name: 'test-address',
      address: '38.141.210.105',
    }

    expect(addressDetails).toEqual(expectedResult)
  })

  describe('error handling', () => {
    let serviceWrapper: ServiceWrapper
    const googleComputeClient = google.compute('v1')

    beforeEach(async () => {
      const auth = new GoogleAuth({
        scopes: 'https://www.googleapis.com/auth/cloud-platform',
      })

      const getClientSpy = jest.spyOn(auth, 'getClient')

      ;(getClientSpy as jest.Mock).mockResolvedValue(jest.fn())

      const googleAuthClient: GoogleAuthClient = await auth.getClient()

      serviceWrapper = new ServiceWrapper(
        new Resource(),
        googleAuthClient,
        googleComputeClient,
        new RecommenderClient(),
      )
    })

    it('fails to get active zones for project', async () => {
      setupSpyWithRejectedValue(
        googleComputeClient.instances,
        'aggregatedList',
        'error',
      )
      const activeProjectsAndZones: ActiveProject[] =
        await serviceWrapper.getActiveProjectsAndZones()

      const expectedResult: ActiveProject[] = []

      expect(activeProjectsAndZones).toEqual(expectedResult)
    })

    it('exceeds the quota for recommender client api calls', async () => {
      mockRecommenderClientListRecommendations
        .mockRejectedValueOnce({
          details: 'Quota exceeded',
        })
        .mockRejectedValueOnce({})
        .mockResolvedValue([[]])

      console.warn = jest.fn().mockResolvedValue('Warn')

      const recommenderIds = ['test-id-1']
      await serviceWrapper.getRecommendationsForRecommenderIds(
        'test-project-id',
        'us-west1-a',
        recommenderIds,
      )

      expect(wait).toHaveBeenCalled()
    })
  })
})
