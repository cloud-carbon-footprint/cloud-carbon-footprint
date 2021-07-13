/*
 * © 2021 ThoughtWorks, Inc.
 */

const mockedInstanceResultItems: any = {
  data: {
    items: {
      'zones/us-west1-a': {
        instances: [{ id: 'test-instance' }],
      },
      'zones/us-west1-b': { warning: { code: 'NO_RESULTS_ON_PAGE' } },
    },
  },
}
const mockedDisksResultItems: any = {
  data: { items: {} },
}
const mockedAddressesResultItems: any = {
  data: { items: {} },
}
const mockedInstanceGetItems: any = {
  data: {
    machineType:
      'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/machineTypes/n2-standard-32',
  },
}
const mockedMachineTypesGetItems: any = {
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
