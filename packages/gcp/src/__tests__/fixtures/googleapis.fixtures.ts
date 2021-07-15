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

export const mockGoogleAuthClient = jest.fn()
export const mockGoogleComputeClient = {
  instances: {
    aggregatedList: jest.fn().mockResolvedValue(mockedInstanceResultItems),
    get: jest.fn().mockResolvedValue(mockedInstanceGetItems),
  },
  disks: {
    aggregatedList: jest.fn().mockResolvedValue(mockedDisksResultItems),
  },
  addresses: {
    aggregatedList: jest.fn().mockResolvedValue(mockedAddressesResultItems),
  },
  machineTypes: {
    get: jest.fn().mockResolvedValue(mockedMachineTypesGetItems),
  },
}
