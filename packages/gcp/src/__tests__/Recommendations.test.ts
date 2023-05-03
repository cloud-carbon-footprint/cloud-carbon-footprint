/*
 * © 2021 Thoughtworks, Inc.
 */
import {
  AddressesClient,
  DisksClient,
  ImagesClient,
  InstancesClient,
  MachineTypesClient,
} from '@google-cloud/compute'
import { GoogleAuth } from 'google-auth-library'
import { RecommenderClient } from '@google-cloud/recommender'
import { ProjectsClient } from '@google-cloud/resource-manager'
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
  mockAddressesResultItems,
  mockDisksResultItems,
  mockedInstanceGetItems,
  mockedInstanceGetItemsCurrent,
  mockedInstanceGetItemsWithBothDisks,
  mockedInstanceGetItemsWithHDDDisks,
  mockInstanceResultItems,
  mockedMachineTypesGetItems,
  mockedMachineTypesGetItemsNew,
  mockedMachineTypesGetItemsCurrent,
  mockedDisksGetSSDDetails,
  mockedDisksGetHDDDetails,
  mockedImageGetDetails,
  mockInstanceGlobalResultItems,
  mockInstanceRegionsResultItems,
  mockedAddressGetDetails,
} from './fixtures/googleapis.fixtures'

jest.mock('moment', () => {
  return () => jest.requireActual('moment')('2020-04-01T00:00:00.000Z')
})

jest.mock('@google-cloud/resource-manager', () => ({
  ProjectsClient: jest.fn().mockImplementation(() => ({
    searchProjects: jest.fn().mockResolvedValue(mockedProjects),
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
  let googleAuthClient: GoogleAuthClient,
    serviceWrapper: ServiceWrapper,
    mockGoogleCompute: any

  beforeEach(async () => {
    const googleAuth = new GoogleAuth()
    const getClientSpy = jest.spyOn(googleAuth, 'getClient')

    ;(getClientSpy as jest.Mock).mockResolvedValue(jest.fn())

    googleAuthClient = await googleAuth.getClient({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })

    mockGoogleCompute = {
      instances: new InstancesClient(),
      machineTypes: new MachineTypesClient(),
      disks: new DisksClient(),
      images: new ImagesClient(),
      addresses: new AddressesClient(),
    }

    setupSpy(
      mockGoogleCompute.instances,
      'aggregatedListAsync',
      mockInstanceResultItems(),
    )
    setupSpy(
      mockGoogleCompute.disks,
      'aggregatedListAsync',
      mockDisksResultItems(),
    )
    setupSpy(
      mockGoogleCompute.addresses,
      'aggregatedListAsync',
      mockAddressesResultItems(),
    )

    serviceWrapper = new ServiceWrapper(
      new ProjectsClient(),
      googleAuthClient,
      mockGoogleCompute.instances,
      mockGoogleCompute.disks,
      mockGoogleCompute.addresses,
      mockGoogleCompute.images,
      mockGoogleCompute.machineTypes,
      new RecommenderClient(),
    )
  })

  describe('Stop VM Recommendations', () => {
    beforeEach(() => {
      setupSpy(
        mockGoogleCompute.machineTypes,
        'get',
        mockedMachineTypesGetItems,
      )
    })

    it('returns recommendations for stop VM with no storage', async () => {
      mockListRecommendations
        .mockResolvedValueOnce(mockStopVMRecommendationsResults)
        .mockResolvedValue([[]])
      setupSpy(mockGoogleCompute.instances, 'get', mockedInstanceGetItems)

      const recommendationsService = new Recommendations(
        new ComputeEstimator(),
        new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
        new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
        serviceWrapper,
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

      setupSpy(mockGoogleCompute.instances, 'get', mockedInstanceGetItems)

      setupSpy(
        mockGoogleCompute.instances,
        'aggregatedListAsync',
        mockInstanceGlobalResultItems(),
      )

      const recommendationsService = new Recommendations(
        new ComputeEstimator(),
        new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
        new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
        serviceWrapper,
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

      setupSpy(mockGoogleCompute.instances, 'get', mockedInstanceGetItems)

      setupSpy(
        mockGoogleCompute.instances,
        'aggregatedListAsync',
        mockInstanceRegionsResultItems(),
      )

      const recommendationsService = new Recommendations(
        new ComputeEstimator(),
        new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
        new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
        serviceWrapper,
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

      const targetFunctionSpy = jest.spyOn(mockGoogleCompute.instances, 'get')
      ;(targetFunctionSpy as jest.Mock).mockRejectedValue('Error')

      const recommendationsService = new Recommendations(
        new ComputeEstimator(),
        new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
        new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
        serviceWrapper,
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
        mockGoogleCompute.instances,
        'get',
        mockedInstanceGetItemsWithHDDDisks,
      )
      setupSpy(mockGoogleCompute.disks, 'get', mockedDisksGetHDDDetails)

      const recommendationsService = new Recommendations(
        new ComputeEstimator(),
        new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
        new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
        serviceWrapper,
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
        mockGoogleCompute.instances,
        'get',
        mockedInstanceGetItemsWithBothDisks,
      )

      setupSpyWithMultipleValues(
        mockGoogleCompute.disks,
        'get',
        mockedDisksGetSSDDetails,
        mockedDisksGetHDDDetails,
      )

      const recommendationsService = new Recommendations(
        new ComputeEstimator(),
        new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
        new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
        serviceWrapper,
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
      mockGoogleCompute.machineTypes,
      'get',
      mockedMachineTypesGetItemsCurrent,
      mockedMachineTypesGetItemsNew,
    )

    setupSpy(mockGoogleCompute.instances, 'get', mockedInstanceGetItemsCurrent)

    const recommendationsService = new Recommendations(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      serviceWrapper,
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
      mockGoogleCompute.machineTypes,
      'get',
      mockedMachineTypesGetItemsCurrent,
      mockedMachineTypesGetItemsNew,
    )

    const targetFunctionSpy = jest.spyOn(mockGoogleCompute.instances, 'get')
    ;(targetFunctionSpy as jest.Mock).mockRejectedValue('Error')

    const recommendationsService = new Recommendations(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      serviceWrapper,
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

    setupSpy(mockGoogleCompute.disks, 'get', mockedDisksGetSSDDetails)

    const recommendationsService = new Recommendations(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      serviceWrapper,
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

    setupSpy(mockGoogleCompute.disks, 'get', mockedDisksGetHDDDetails)

    const recommendationsService = new Recommendations(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      serviceWrapper,
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

    setupSpy(mockGoogleCompute.images, 'get', mockedImageGetDetails)

    const recommendationsService = new Recommendations(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      serviceWrapper,
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

    setupSpy(mockGoogleCompute.addresses, 'get', mockedAddressGetDetails)

    const recommendationsService = new Recommendations(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      serviceWrapper,
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

    setupSpy(mockGoogleCompute.machineTypes, 'get', mockedMachineTypesGetItems)
    setupSpy(mockGoogleCompute.instances, 'get', mockedInstanceGetItems)
    setupSpy(mockGoogleCompute.addresses, 'get', mockedAddressGetDetails)

    const recommendationsService = new Recommendations(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      serviceWrapper,
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
        kilowattHourSavings: 155.07302400000003,
        co2eSavings: 0.07443505152000002,
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
      serviceWrapper,
    )

    const recommendations = await recommendationsService.getRecommendations()

    const expectedResult: RecommendationResult[] = []

    expect(recommendations).toEqual(expectedResult)
  })
})
