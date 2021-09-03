/*
 * © 2021 Thoughtworks, Inc.
 */
import { google } from 'googleapis'
import { APIEndpoint } from 'googleapis-common'
import { RecommenderClient } from '@google-cloud/recommender'
import { Resource } from '@google-cloud/resource-manager'
import {
  RecommendationResult,
  GoogleAuthClient,
} from '@cloud-carbon-footprint/common'
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
  mockDeleteDiskRecommendationsResults,
  mockDeleteImageRecommendationsResults,
  mockDeleteAddressRecommendationsResults,
  mockEmptyRecommendationsResults,
  mockSnapshotAndDeleteDiskRecommendationsResults,
  mockStopVMRecommendationsResults,
  mockStopVMWithAdditionalImpactRecommendationsResults,
  mockStopVmAndDeleteAddressRecommendations,
  mockDeleteAddressRecommendationsEast,
} from './fixtures/recommender.fixtures'
import {
  mockedAddressesResultItems,
  mockedDisksResultItems,
  mockedInstanceGetItems,
  mockedInstanceGetItemsCurrent,
  mockedInstanceGetItemsWithBothDisks,
  mockedInstanceGetItemsWithHDDDisks,
  mockedInstanceResultItems,
  mockedMachineTypesGetItems,
  mockedMachineTypesGetItemsNew,
  mockedMachineTypesGetItemsCurrent,
  mockedDisksGetSSDDetails,
  mockedDisksGetHDDDetails,
  mockedImageGetDetails,
  mockedInstanceGlobalResultItems,
  mockedInstanceRegionsResultItems,
  mockedAddressGetDetails,
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
  let googleAuthClient: GoogleAuthClient
  let googleComputeClient: APIEndpoint

  beforeEach(async () => {
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
    beforeEach(() => {
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
          kilowattHourSavings: 58.152384000000005,
          co2eSavings: 0.0045358859520000004,
          costSavings: 15,
          instanceName: 'test-resource-name',
          resourceId: '12456789012',
        },
      ]

      expect(recommendations).toEqual(expectedResult)
    })

    it('returns recommendations for stop VM with additional impact', async () => {
      mockListRecommendations
        .mockResolvedValueOnce(
          mockStopVMWithAdditionalImpactRecommendationsResults,
        )
        .mockResolvedValue([[]])

      setupSpy(googleComputeClient.instances, 'get', mockedInstanceGetItems)

      setupSpy(
        googleComputeClient.instances,
        'aggregatedList',
        mockedInstanceGlobalResultItems,
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
          region: 'Unknown',
          recommendationType: 'STOP_VM',
          recommendationDetail:
            "Save cost by stopping Idle VM 'test-instance'.",
          kilowattHourSavings: 58.41792000000001,
          co2eSavings: 0.024046546771602437,
          costSavings: 55,
          instanceName: 'test-resource-name',
          resourceId: '12456789012',
        },
      ]

      expect(recommendations).toEqual(expectedResult)
    })

    it('returns recommendations for stop VM with active regions', async () => {
      mockListRecommendations
        .mockResolvedValueOnce(mockStopVMRecommendationsResults)
        .mockResolvedValue([[]])

      setupSpy(googleComputeClient.instances, 'get', mockedInstanceGetItems)

      setupSpy(
        googleComputeClient.instances,
        'aggregatedList',
        mockedInstanceRegionsResultItems,
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
          kilowattHourSavings: 58.152384000000005,
          co2eSavings: 0.0045358859520000004,
          costSavings: 15,
          instanceName: 'test-resource-name',
          resourceId: '12456789012',
        },
      ]

      expect(recommendations).toEqual(expectedResult)
    })

    it('does not return recommendations for stop VM with an error', async () => {
      mockListRecommendations
        .mockResolvedValueOnce(mockStopVMRecommendationsResults)
        .mockResolvedValue([[]])

      const targetFunctionSpy = jest.spyOn(googleComputeClient.instances, 'get')
      ;(targetFunctionSpy as jest.Mock).mockRejectedValue('Error')

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
          kilowattHourSavings: 0,
          co2eSavings: 0,
          costSavings: 15,
          resourceId: '',
          instanceName: 'instance-name',
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
      setupSpy(googleComputeClient.disks, 'get', mockedDisksGetHDDDetails)

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
          kilowattHourSavings: 58.1626332,
          co2eSavings: 0.0045366853896,
          costSavings: 15,
          instanceName: 'test-instance-name',
          resourceId: '12456789012',
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

      setupSpyWithMultipleValues(
        googleComputeClient.disks,
        'get',
        mockedDisksGetSSDDetails,
        mockedDisksGetHDDDetails,
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
          kilowattHourSavings: 58.18155480000001,
          co2eSavings: 0.004538161274400001,
          costSavings: 15,
          instanceName: 'test-instance-name',
          resourceId: '12456789012',
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
      googleComputeClient.machineTypes,
      'get',
      mockedMachineTypesGetItemsCurrent,
      mockedMachineTypesGetItemsNew,
    )

    setupSpy(
      googleComputeClient.instances,
      'get',
      mockedInstanceGetItemsCurrent,
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
        kilowattHourSavings: 1.6960454999999999,
        co2eSavings: 0.00013229154899999999,
        costSavings: 20,
        resourceId: '12456789012',
        instanceName: 'test-resource-name',
      },
    ]

    expect(recommendations).toEqual(expectedResult)
  })

  it('returns recommendations for change machine type with failed getInstance call', async () => {
    mockListRecommendations
      .mockResolvedValueOnce(mockChangeMachineTypeRecommendationsResults)
      .mockResolvedValue([[]])

    setupSpyWithMultipleValues(
      googleComputeClient.machineTypes,
      'get',
      mockedMachineTypesGetItemsCurrent,
      mockedMachineTypesGetItemsNew,
    )

    const targetFunctionSpy = jest.spyOn(googleComputeClient.instances, 'get')
    ;(targetFunctionSpy as jest.Mock).mockRejectedValue('Error')

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
        kilowattHourSavings: 1.6960454999999999,
        co2eSavings: 0.00013229154899999999,
        costSavings: 20,
        resourceId: '',
        instanceName: 'instance-name',
      },
    ]

    expect(recommendations).toEqual(expectedResult)
  })

  it('returns recommendations for delete SSD disk', async () => {
    mockListRecommendations
      .mockResolvedValueOnce(mockDeleteDiskRecommendationsResults)
      .mockResolvedValue([[]])

    setupSpy(googleComputeClient.disks, 'get', mockedDisksGetSSDDetails)

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
        recommendationType: 'DELETE_DISK',
        recommendationDetail:
          "Save cost by deleting idle persistent disk 'test-disk'.",
        kilowattHourSavings: 0.0189216,
        co2eSavings: 0.0000014758848,
        costSavings: 50,
        resourceId: '12456789012',
        instanceName: 'test-resource-name',
      },
    ]

    expect(recommendations).toEqual(expectedResult)
  })

  it('returns recommendations for delete HDD disk', async () => {
    mockListRecommendations
      .mockResolvedValueOnce(mockSnapshotAndDeleteDiskRecommendationsResults)
      .mockResolvedValue([[]])

    setupSpy(googleComputeClient.disks, 'get', mockedDisksGetHDDDetails)

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
        recommendationType: 'SNAPSHOT_AND_DELETE_DISK',
        recommendationDetail:
          "Save cost by deleting idle persistent disk 'test-disk'.",
        kilowattHourSavings: 0.010249200000000002,
        co2eSavings: 7.994376000000002e-7,
        costSavings: 50,
        resourceId: '12456789012',
        instanceName: 'test-resource-name',
      },
    ]

    expect(recommendations).toEqual(expectedResult)
  })

  it('returns recommendations for delete image', async () => {
    mockListRecommendations
      .mockResolvedValueOnce(mockDeleteImageRecommendationsResults)
      .mockResolvedValue([[]])

    setupSpy(googleComputeClient.images, 'get', mockedImageGetDetails)

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
        recommendationType: 'DELETE_IMAGE',
        recommendationDetail: "Save cost by deleting idle image 'test-image'.",
        kilowattHourSavings: 0.0002771527420842647,
        co2eSavings: 2.1617913882572647e-8,
        costSavings: 30,
        resourceId: '12456789012',
        instanceName: 'test-resource-name',
      },
    ]

    expect(recommendations).toEqual(expectedResult)
  })

  it('returns estimates of zero for recommendation type DELETE_ADDRESS', async () => {
    mockListRecommendations
      .mockResolvedValueOnce(mockDeleteAddressRecommendationsResults)
      .mockResolvedValue([[]])

    setupSpy(googleComputeClient.addresses, 'get', mockedAddressGetDetails)

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
        recommendationType: 'DELETE_ADDRESS',
        recommendationDetail:
          "Save cost by deleting idle address 'test-address'.",
        kilowattHourSavings: 0,
        co2eSavings: 0,
        costSavings: 40,
        resourceId: '123456789012345',
        instanceName: 'test-address',
      },
    ]

    expect(recommendations).toEqual(expectedResult)
  })

  it('returns estimates for recommendation type DELETE_ADDRESS', async () => {
    mockListRecommendations
      .mockResolvedValueOnce(mockStopVmAndDeleteAddressRecommendations)
      .mockResolvedValueOnce(mockDeleteAddressRecommendationsEast)
      .mockResolvedValue([[]])

    setupSpy(
      googleComputeClient.machineTypes,
      'get',
      mockedMachineTypesGetItems,
    )
    setupSpy(googleComputeClient.instances, 'get', mockedInstanceGetItems)
    setupSpy(googleComputeClient.addresses, 'get', mockedAddressGetDetails)

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
        kilowattHourSavings: 58.152384000000005,
        co2eSavings: 0.0045358859520000004,
        costSavings: 15,
        instanceName: 'test-resource-name',
        resourceId: '12456789012',
      },
      {
        cloudProvider: 'GCP',
        accountId: 'project',
        accountName: 'project-name',
        region: 'us-west1',
        recommendationType: 'DELETE_ADDRESS',
        recommendationDetail:
          "Save cost by deleting idle address 'test-address'.",
        kilowattHourSavings: 155.07302400000003,
        co2eSavings: 0.012095695872000002,
        costSavings: 40,
        resourceId: '123456789012345',
        instanceName: 'test-address',
      },
      {
        cloudProvider: 'GCP',
        accountId: 'project',
        accountName: 'project-name',
        region: 'us-east1',
        recommendationType: 'DELETE_ADDRESS',
        recommendationDetail:
          "Save cost by deleting idle address 'test-address'.",
        kilowattHourSavings: 25.199366400000002,
        co2eSavings: 0.012095695872000002,
        costSavings: 40,
        resourceId: '123456789012345',
        instanceName: 'test-address',
      },
    ]

    expect(recommendations).toEqual(expectedResult)
  })

  it('does not return recommendations with an error getting recommender ids ', async () => {
    mockListRecommendations
      .mockRejectedValue(mockEmptyRecommendationsResults)
      .mockResolvedValue([[]])

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

    const expectedResult: RecommendationResult[] = []

    expect(recommendations).toEqual(expectedResult)
  })
})
