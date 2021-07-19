/*
 * © 2021 ThoughtWorks, Inc.
 */

import { Resource } from '@google-cloud/resource-manager'
import { compute_v1, google } from 'googleapis'
import { RecommenderClient } from '@google-cloud/recommender'
import {
  mockedAddressesResultItems,
  mockedDisksGetSSDDetails,
  mockedDisksResultItems,
  mockedInstanceGetItems,
  mockedInstanceResultItems,
  mockedMachineTypesGetItems,
} from './fixtures/googleapis.fixtures'
import Schema$Instance = compute_v1.Schema$Instance
import Schema$MachineType = compute_v1.Schema$MachineType

import ServiceWrapper, { GoogleAuthClient } from '../lib/ServiceWrapper'
import {
  ActiveProject,
  RecommenderRecommendations,
} from '../lib/RecommendationsTypes'

import { mockStopVMRecommendationsResults } from './fixtures/recommender.fixtures'
import { mockedProjects } from './fixtures/resourceManager.fixtures'
import { setupSpy } from './helpers'
import { GoogleAuth } from 'google-auth-library'

jest.mock('@google-cloud/resource-manager', () => ({
  Resource: jest.fn().mockImplementation(() => ({
    getProjects: jest.fn().mockResolvedValue(mockedProjects),
  })),
}))

jest.mock('@google-cloud/recommender', () => ({
  RecommenderClient: jest.fn().mockImplementation(() => ({
    listRecommendations: jest
      .fn()
      .mockResolvedValueOnce(mockStopVMRecommendationsResults)
      .mockResolvedValue([[]]),
    projectLocationRecommenderPath: jest.fn(),
  })),
}))

describe('GCP Service Wrapper', () => {
  let serviceWrapper: ServiceWrapper

  beforeAll(async () => {
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
  })

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

  it('gets disks details', async () => {
    const diskDetails = await serviceWrapper.getDiskDetails(
      'project',
      'us-west1-b',
      'test-disk',
    )

    const expectedResult = {
      sizeGb: '200',
      type: 'https://www.googleapis.com/compute/v1/projects/techops-events/zones/us-central1-b/diskTypes/pd-standard-ssd',
    }

    expect(diskDetails).toEqual(expectedResult)
  })
})
