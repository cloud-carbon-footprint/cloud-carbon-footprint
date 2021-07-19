/*
 * © 2021 ThoughtWorks, Inc.
 */

export const mockedInstanceResultItems: any = {
  data: {
    items: {
      'zones/us-west1-a': {
        instances: [{ id: 'test-instance' }],
      },
      'zones/us-west1-b': { warning: { code: 'NO_RESULTS_ON_PAGE' } },
    },
  },
}
export const mockedDisksResultItems: any = {
  data: { items: {} },
}
export const mockedDisksGetSSDDetails: any = {
  data: {
    sizeGb: '200',
    type: 'https://www.googleapis.com/compute/v1/projects/techops-events/zones/us-central1-b/diskTypes/pd-standard-ssd',
  },
}
export const mockedDisksGetHDDDetails: any = {
  data: {
    sizeGb: '300',
    type: 'https://www.googleapis.com/compute/v1/projects/techops-events/zones/us-central1-b/diskTypes/pd-standard',
  },
}
export const mockedAddressesResultItems: any = {
  data: { items: {} },
}
export const mockedInstanceGetItems: any = {
  data: {
    machineType:
      'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/machineTypes/n2-standard-32',
    disks: [],
  },
}
export const mockedInstanceGetItemsCurrent: any = {
  data: {
    machineType:
      'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/machineTypes/e2-medium',
    disks: [],
  },
}
export const mockedInstanceGetItemsNew: any = {
  data: {
    machineType:
      'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/machineTypes/e2-small',
    disks: [],
  },
}
export const mockedInstanceGetItemsWithSSDDisks: any = {
  data: {
    machineType:
      'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/machineTypes/n2-standard-32',
    disks: [
      {
        deviceName: 'ssd-test',
        diskSizeGb: '20',
      },
    ],
  },
}
export const mockedInstanceGetItemsWithHDDDisks: any = {
  data: {
    machineType:
      'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/machineTypes/n2-standard-32',
    disks: [
      {
        deviceName: 'hdd-test',
        diskSizeGb: '20',
      },
    ],
  },
}
export const mockedInstanceGetItemsWithBothDisks: any = {
  data: {
    machineType:
      'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/machineTypes/n2-standard-32',
    disks: [
      {
        deviceName: 'ssd-test',
        diskSizeGb: '20',
      },
      {
        deviceName: 'hdd-test',
        diskSizeGb: '20',
      },
    ],
  },
}
export const mockedMachineTypesGetItems: any = {
  data: {
    guestCpus: 32,
  },
}
export const mockedMachineTypesGetItemsCurrent: any = {
  data: {
    guestCpus: 2,
  },
}
export const mockedMachineTypesGetItemsNew: any = {
  data: {
    guestCpus: 1,
  },
}
