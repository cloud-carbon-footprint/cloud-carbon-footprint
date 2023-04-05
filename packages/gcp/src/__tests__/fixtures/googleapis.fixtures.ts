/*
 * © 2021 Thoughtworks, Inc.
 */

import { protos as googleCompute } from '@google-cloud/compute'
import Instance = googleCompute.google.cloud.compute.v1.Instance
import MachineType = googleCompute.google.cloud.compute.v1.MachineType
import Disk = googleCompute.google.cloud.compute.v1.Disk
import Image = googleCompute.google.cloud.compute.v1.Image
import Address = googleCompute.google.cloud.compute.v1.Address
import InstanceAggregatedList = google.cloud.compute.v1.InstanceAggregatedList
import DiskAggregatedList = google.cloud.compute.v1.DiskAggregatedList
import AddressAggregatedList = google.cloud.compute.v1.AddressAggregatedList
import { google } from '@google-cloud/compute/build/protos/protos'

export type InstanceData = {
  data: Partial<Instance>
}

type MachineTypeData = {
  data: Partial<MachineType>
}

type ImageDetails = {
  data: Partial<Image>
}

type DiskData = {
  data: Partial<Disk>
}

type AddressDetails = {
  data: Partial<Address>
}

type InstanceAggregatedListData = {
  data: Partial<InstanceAggregatedList>
}

type DiskAggregatedListData = {
  data: Partial<DiskAggregatedList>
}

type AddressAggregatedListData = {
  data: Partial<AddressAggregatedList>
}

export const mockedInstanceResultItems: InstanceAggregatedListData = {
  data: {
    items: {
      'zones/us-west1-a': {
        instances: [{ id: 'test-instance' }],
      },
      'zones/us-east1-a': {
        instances: [{ id: 'test-instance-1' }],
      },
      'zones/us-west1-b': { warning: { code: 'NO_RESULTS_ON_PAGE' } },
    },
  },
}

export const mockedInstanceRegionsResultItems: InstanceAggregatedListData = {
  data: {
    items: {
      'regions/us-west1': {
        instances: [{ id: 'test-instance' }],
      },
    },
  },
}

export const mockedInstanceGlobalResultItems: InstanceAggregatedListData = {
  data: {
    items: {
      global: {
        instances: [{ id: 'test-instance-global' }],
      },
    },
  },
}

export const mockedAddressesResultItems: AddressAggregatedListData = {
  data: { items: {} },
}

export const mockedDisksResultItems: DiskAggregatedListData = {
  data: { items: {} },
}

export const mockedDisksGetSSDDetails: DiskData = {
  data: {
    sizeGb: '20',
    type: 'https://www.googleapis.com/compute/v1/projects/techops-events/zones/us-central1-b/diskTypes/pd-standard-ssd',
    id: '12456789012',
    name: 'test-resource-name',
  },
}

export const mockedDisksGetHDDDetails: DiskData = {
  data: {
    sizeGb: '20',
    type: 'https://www.googleapis.com/compute/v1/projects/techops-events/zones/us-central1-b/diskTypes/pd-standard',
    id: '12456789012',
    name: 'test-resource-name',
  },
}

export const mockedInstanceGetItems: InstanceData = {
  data: {
    machineType:
      'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/machineTypes/n2-standard-32',
    disks: [],
    id: '12456789012',
    name: 'test-resource-name',
  },
}

export const mockedInstanceGetItemsCurrent: InstanceData = {
  data: {
    machineType:
      'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/machineTypes/e2-medium',
    disks: [],
    id: '12456789012',
    name: 'test-resource-name',
  },
}

export const mockedInstanceGetItemsWithHDDDisks: InstanceData = {
  data: {
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
}

export const mockedInstanceGetItemsWithBothDisks: InstanceData = {
  data: {
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
}

export const mockedMachineTypesGetItems: MachineTypeData = {
  data: {
    guestCpus: 32,
  },
}

export const mockedMachineTypesGetItemsCurrent: MachineTypeData = {
  data: {
    guestCpus: 2,
  },
}

export const mockedMachineTypesGetItemsNew: MachineTypeData = {
  data: {
    guestCpus: 1,
  },
}

export const mockedImageGetDetails: ImageDetails = {
  data: {
    archiveSizeBytes: '580709696',
    id: '12456789012',
    name: 'test-resource-name',
  },
}

export const mockedAddressGetDetails: AddressDetails = {
  data: {
    id: '123456789012345',
    name: 'test-address',
    address: '38.141.210.105',
  },
}
