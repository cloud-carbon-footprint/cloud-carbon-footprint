/*
 * © 2021 Thoughtworks, Inc.
 */

import { ScopedListResult } from '../../lib/ServiceWrapperTypes'
import { google } from '@google-cloud/compute/build/protos/protos'
import IDisk = google.cloud.compute.v1.IDisk
import IInstance = google.cloud.compute.v1.IInstance
import IMachineType = google.cloud.compute.v1.IMachineType
import IImage = google.cloud.compute.v1.IImage
import IAddress = google.cloud.compute.v1.IAddress

interface IterableMockResponse {
  next(): Promise<IteratorResult<ScopedListResult>>
}

const mockAsyncIterator = {
  // * = fancy generator function (https://javascript.info/generators)
  async *[Symbol.asyncIterator](mockResponse: ScopedListResult[]) {
    for (const response of mockResponse) yield response
  },
}

export const mockIterableResponse = (
  mockResponse: ScopedListResult[],
): IterableMockResponse => {
  return mockAsyncIterator[Symbol.asyncIterator](mockResponse)
}

export const mockInstanceResultItems = () =>
  mockIterableResponse([
    [
      'zones/us-west1-a',
      {
        instances: [{ id: 'test-instance' }],
      },
    ],
    [
      'zones/us-east1-a',
      {
        instances: [{ id: 'test-instance-1' }],
      },
    ],
    ['zones/us-west1-b', { warning: { code: 'NO_RESULTS_ON_PAGE' } }],
  ])

export const mockInstanceRegionsResultItems = () =>
  mockIterableResponse([
    [
      'regions/us-west1',
      {
        instances: [{ id: 'test-instance' }],
      },
    ],
  ])

export const mockInstanceGlobalResultItems = () =>
  mockIterableResponse([
    [
      'global',
      {
        instances: [{ id: 'test-instance-global' }],
      },
    ],
  ])

export const mockAddressesResultItems = () => mockIterableResponse([])

export const mockDisksResultItems = () => mockIterableResponse([])

export const mockedDisksGetSSDDetails: [IDisk] = [
  {
    sizeGb: '20',
    type: 'https://www.googleapis.com/compute/v1/projects/techops-events/zones/us-central1-b/diskTypes/pd-standard-ssd',
    id: '12456789012',
    name: 'test-resource-name',
  },
]

export const mockedDisksGetHDDDetails: [IDisk] = [
  {
    sizeGb: '20',
    type: 'https://www.googleapis.com/compute/v1/projects/techops-events/zones/us-central1-b/diskTypes/pd-standard',
    id: '12456789012',
    name: 'test-resource-name',
  },
]

export const mockedInstanceGetItems: [IInstance] = [
  {
    machineType:
      'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/machineTypes/n2-standard-32',
    disks: [],
    id: '12456789012',
    name: 'test-resource-name',
  },
]

export const mockedInstanceGetItemsCurrent: [IInstance] = [
  {
    machineType:
      'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/machineTypes/e2-medium',
    disks: [],
    id: '12456789012',
    name: 'test-resource-name',
  },
]

export const mockedInstanceGetItemsWithHDDDisks: [IInstance] = [
  {
    machineType:
      'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/machineTypes/n2-standard-32',
    disks: [
      {
        source:
          'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/disks/test-disk-id',
        diskSizeGb: '20',
      },
    ],
    id: '12456789012',
    name: 'test-instance-name',
  },
]

export const mockedInstanceGetItemsWithBothDisks: [IInstance] = [
  {
    machineType:
      'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/machineTypes/n2-standard-32',
    disks: [
      {
        source:
          'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/disks/test-disk-1',
        diskSizeGb: '20',
      },
      {
        source:
          'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/disks/test-disk-2',
        diskSizeGb: '20',
      },
    ],
    id: '12456789012',
    name: 'test-instance-name',
  },
]

export const mockedMachineTypesGetItems: [IMachineType] = [
  {
    guestCpus: 32,
  },
]

export const mockedMachineTypesGetItemsCurrent: [IMachineType] = [
  {
    guestCpus: 2,
  },
]

export const mockedMachineTypesGetItemsNew: [IMachineType] = [
  {
    guestCpus: 1,
  },
]

export const mockedImageGetDetails: [IImage] = [
  {
    archiveSizeBytes: '580709696',
    id: '12456789012',
    name: 'test-resource-name',
  },
]

export const mockedAddressGetDetails: [IAddress] = [
  {
    id: '123456789012345',
    name: 'test-address',
    address: '38.141.210.105',
  },
]
