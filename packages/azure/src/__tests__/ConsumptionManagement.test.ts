/*
 * © 2021 Thoughtworks, Inc.
 */

import { ServiceClientCredentials } from '@azure/ms-rest-js'
import { ConsumptionManagementClient } from '@azure/arm-consumption'

import { EstimationResult, configLoader } from '@cloud-carbon-footprint/common'
import {
  StorageEstimator,
  ComputeEstimator,
  NetworkingEstimator,
  MemoryEstimator,
} from '@cloud-carbon-footprint/core'

import {
  mockConsumptionManagementResponseFour,
  mockConsumptionManagementResponseOne,
  mockConsumptionManagementResponseThree,
  mockConsumptionManagementResponseTwo,
  mockConsumptionManagementResponseFive,
  mockConsumptionManagementResponseSix,
  mockConsumptionManagementResponseSeven,
} from './fixtures/consumptionManagement.fixtures'

import { ConsumptionManagementService } from '../lib'
import { AZURE_CLOUD_CONSTANTS } from '../domain'

const mockUsageDetails = { list: jest.fn(), listNext: jest.fn() }

jest.mock('@cloud-carbon-footprint/common', () => ({
  ...(jest.requireActual('@cloud-carbon-footprint/common') as Record<
    string,
    unknown
  >),
  configLoader: jest.fn().mockImplementation(() => {
    return {
      GROUP_QUERY_RESULTS_BY: 'day',
    }
  }),
}))

jest.mock('@azure/arm-consumption', () => {
  return {
    ConsumptionManagementClient: jest.fn().mockImplementation(() => {
      return {
        usageDetails: mockUsageDetails,
      }
    }),
  }
})

jest.mock('@cloud-carbon-footprint/common', () => ({
  ...(jest.requireActual('@cloud-carbon-footprint/common') as Record<
    string,
    unknown
  >),
  configLoader: jest.fn().mockImplementation(() => {
    return {
      GROUP_QUERY_RESULTS_BY: 'day',
    }
  }),
}))

describe('Azure Consumption Management Service', () => {
  const startDate = new Date('2020-11-02')
  const endDate = new Date('2020-11-03')
  const subscriptionId = 'test-subscription-id'
  const subscriptionName = 'test-subscription'
  const mockCredentials: ServiceClientCredentials = { signRequest: jest.fn() }

  it('Returns estimates for Compute', async () => {
    mockUsageDetails.list.mockResolvedValue(
      mockConsumptionManagementResponseOne,
    )

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      // eslint-disable-next-line
      // @ts-ignore: @azure/arm-consumption is using an older version of @azure/ms-rest-js, causing a type error.
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )

    const result = await consumptionManagementService.getEstimates(
      startDate,
      endDate,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            kilowattHours: 0.09901267500000002,
            co2e: 0.000022574889900000007,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Virtual Machines',
            cost: 5,
            region: 'UK South',
          },
          {
            kilowattHours: 0.0025099471835124,
            co2e: 9.788794015698361e-7,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Virtual Machines',
            cost: 10,
            region: 'EU West',
          },
          {
            kilowattHours: 0.0203849625,
            co2e: 0.000009626390841375,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Azure App Service',
            cost: 10,
            region: 'US Central',
          },
        ],
      },
      {
        timestamp: new Date('2020-11-03'),
        serviceEstimates: [
          {
            kilowattHours: 0.026899499999999996,
            co2e: 0.000010660083553499998,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Container Instances',
            cost: 12,
            region: 'US South Central',
          },
          {
            kilowattHours: 0.19367639999999997,
            co2e: 0.00007890376535999999,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Azure Database for MySQL',
            cost: 12,
            region: 'Unknown',
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimates for Storage', async () => {
    mockUsageDetails.list.mockResolvedValue(
      mockConsumptionManagementResponseTwo,
    )

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      // eslint-disable-next-line
      // @ts-ignore: @azure/arm-consumption is using an older version of @azure/ms-rest-js, causing a type error.
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )

    const result = await consumptionManagementService.getEstimates(
      startDate,
      endDate,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            kilowattHours: 0.010374912000000002,
            co2e: 0.0000023654799360000005,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Storage',
            cost: 10,
            region: 'UK South',
          },
          {
            kilowattHours: 0.000409536,
            co2e: 1.5971904e-7,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Storage',
            cost: 5,
            region: 'EU West',
          },
          {
            kilowattHours: 0.000204768,
            co2e: 7.985952e-8,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Azure Database for MySQL',
            cost: 5,
            region: 'EU West',
          },
          {
            kilowattHours: 0.00034127999999999996,
            co2e: 1.3309919999999998e-7,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Container Registry',
            cost: 5,
            region: 'EU West',
          },
          {
            kilowattHours: 0.018929664000000002,
            co2e: 0.000004315963392000001,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'HDInsight',
            cost: 5,
            region: 'UK South',
          },
          {
            kilowattHours: 0.068256,
            co2e: 0.000015562368,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Azure Synapse Analytics',
            cost: 5,
            region: 'UK South',
          },
          {
            kilowattHours: 0.0010238399999999998,
            co2e: 7.248787199999998e-7,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Storage',
            cost: 5,
            region: 'IN Central',
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })
  it('Returns estimates for Networking', async () => {
    mockUsageDetails.list.mockResolvedValue(
      mockConsumptionManagementResponseThree,
    )

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      // eslint-disable-next-line
      // @ts-ignore: @azure/arm-consumption is using an older version of @azure/ms-rest-js, causing a type error.
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )

    const result = await consumptionManagementService.getEstimates(
      startDate,
      endDate,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            kilowattHours: 0.011850000000000001,
            co2e: 0.0000027018000000000005,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Storage',
            cost: 5,
            region: 'UK South',
          },
          {
            kilowattHours: 11.850000000000001,
            co2e: 0.0027018000000000003,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Bandwidth',
            cost: 5,
            region: 'UK South',
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('estimation for Memory', async () => {
    mockUsageDetails.list.mockResolvedValue(
      mockConsumptionManagementResponseFive,
    )

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      // eslint-disable-next-line
      // @ts-ignore: @azure/arm-consumption is using an older version of @azure/ms-rest-js, causing a type error.
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )

    const result = await consumptionManagementService.getEstimates(
      startDate,
      endDate,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2021-11-03'),
        serviceEstimates: [
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 0.000053946954360000005,
            cost: 20,
            region: 'EU North',
            serviceName: 'Virtual Machines',
            usesAverageCPUConstant: true,
            kilowattHours: 0.17071821,
          },
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 0.000018216616320000003,
            cost: 5,
            region: 'AP Southeast',
            serviceName: 'Redis Cache',
            usesAverageCPUConstant: false,
            kilowattHours: 0.04459392,
          },
        ],
      },
      {
        timestamp: new Date('2021-11-02'),
        serviceEstimates: [
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 5.9748514835625e-12,
            cost: 10,
            region: 'US East 2',
            serviceName: 'Functions',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0000000143710875,
          },
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 0.0000015303825748666226,
            cost: 7,
            region: 'UK West',
            serviceName: 'Container Instances',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0067122042757308,
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('estimation for Storage services with replication factors', async () => {
    mockUsageDetails.list.mockResolvedValue(
      mockConsumptionManagementResponseSix,
    )

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      // eslint-disable-next-line
      // @ts-ignore: @azure/arm-consumption is using an older version of @azure/ms-rest-js, causing a type error.
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )

    const result = await consumptionManagementService.getEstimates(
      startDate,
      endDate,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2021-11-03'),
        serviceEstimates: [
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 9.5338454664096e-11,
            cost: 20,
            region: 'US West',
            serviceName: 'Storage',
            usesAverageCPUConstant: false,
            kilowattHours: 0.000000271727136,
          },
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 4.95774469834128e-10,
            cost: 15,
            region: 'US South Central',
            serviceName: 'Storage',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0000012510300960000003,
          },
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 7.003065600000001e-13,
            cost: 10,
            region: 'UK South',
            serviceName: 'Storage',
            usesAverageCPUConstant: false,
            kilowattHours: 3.07152e-9,
          },
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 1.9751656334780162e-9,
            cost: 5,
            region: 'US West 2',
            serviceName: 'Storage',
            usesAverageCPUConstant: false,
            kilowattHours: 0.000005629481856,
          },
        ],
      },
      {
        timestamp: new Date('2021-11-04'),
        serviceEstimates: [
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 0.000002987974656,
            cost: 2,
            region: 'UK South',
            serviceName: 'Storage',
            usesAverageCPUConstant: false,
            kilowattHours: 0.013105152,
          },
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 0.0000012564564480000002,
            cost: 2,
            region: 'IN West',
            serviceName: 'Storage',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0017746560000000003,
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('estimation for Database and Cache services with replication factors', async () => {
    mockUsageDetails.list.mockResolvedValue(
      mockConsumptionManagementResponseSeven,
    )

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      // eslint-disable-next-line
      // @ts-ignore: @azure/arm-consumption is using an older version of @azure/ms-rest-js, causing a type error.
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )

    const result = await consumptionManagementService.getEstimates(
      startDate,
      endDate,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2021-11-03'),
        serviceEstimates: [
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 3.1375741947030145e-10,
            cost: 20,
            region: 'UK South',
            serviceName: 'Azure Database for MySQL',
            usesAverageCPUConstant: false,
            kilowattHours: 0.00000137612903276448,
          },
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 0.0000036798515999999995,
            cost: 45,
            region: 'UK South',
            serviceName: 'SQL Database',
            usesAverageCPUConstant: true,
            kilowattHours: 0.016139699999999996,
          },
        ],
      },
      {
        timestamp: new Date('2021-11-04'),
        serviceEstimates: [
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 0.000044158219199999995,
            cost: 30,
            region: 'UK South',
            serviceName: 'Azure Database for MySQL',
            usesAverageCPUConstant: true,
            kilowattHours: 0.19367639999999997,
          },
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 1.386495475056257e-9,
            cost: 35,
            region: 'US Central',
            serviceName: 'Azure Cosmos DB',
            usesAverageCPUConstant: false,
            kilowattHours: 0.00000293605970619456,
          },
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 1.6315385804115026e-10,
            cost: 40,
            region: 'UK South',
            serviceName: 'SQL Database',
            usesAverageCPUConstant: false,
            kilowattHours: 7.155870966717116e-7,
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Ignores Unknown/Unsupported Usage Types', async () => {
    mockUsageDetails.list.mockResolvedValue(
      mockConsumptionManagementResponseFour,
    )

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      // eslint-disable-next-line
      // @ts-ignore: @azure/arm-consumption is using an older version of @azure/ms-rest-js, causing a type error.
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )

    const result = await consumptionManagementService.getEstimates(
      startDate,
      endDate,
    )

    expect(result).toEqual([])
  })

  it('Pages through results', async () => {
    const testNextLink = 'test-next-link'
    mockUsageDetails.list.mockResolvedValue({ nextLink: testNextLink })
    mockUsageDetails.listNext.mockResolvedValue(
      mockConsumptionManagementResponseThree,
    )

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      // eslint-disable-next-line
      // @ts-ignore: @azure/arm-consumption is using an older version of @azure/ms-rest-js, causing a type error.
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )

    const result = await consumptionManagementService.getEstimates(
      startDate,
      endDate,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            kilowattHours: 0.011850000000000001,
            co2e: 0.0000027018000000000005,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Storage',
            cost: 5,
            region: 'UK South',
          },
          {
            kilowattHours: 11.850000000000001,
            co2e: 0.0027018000000000003,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Bandwidth',
            cost: 5,
            region: 'UK South',
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
    expect(mockUsageDetails.listNext).toHaveBeenCalledWith(testNextLink)
  })

  describe('When group query results by week is true', () => {
    beforeEach(() => {
      ;(configLoader as jest.Mock).mockReturnValue({
        GROUP_QUERY_RESULTS_BY: 'week',
      })
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('Returns estimates for Compute grouped by week', async () => {
      mockUsageDetails.list.mockResolvedValue(
        mockConsumptionManagementResponseOne,
      )

      const consumptionManagementService = new ConsumptionManagementService(
        new ComputeEstimator(),
        new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
        new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
        new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
        new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
        // eslint-disable-next-line
        // @ts-ignore: @azure/arm-consumption is using an older version of @azure/ms-rest-js, causing a type error.
        new ConsumptionManagementClient(mockCredentials, subscriptionId),
      )

      const result = await consumptionManagementService.getEstimates(
        startDate,
        endDate,
      )

      const expectedResult: EstimationResult[] = [
        {
          timestamp: new Date('2020-11-02'),
          serviceEstimates: [
            {
              kilowattHours: 0.09901267500000002,
              co2e: 0.000022574889900000007,
              usesAverageCPUConstant: true,
              cloudProvider: 'AZURE',
              accountId: subscriptionId,
              accountName: subscriptionName,
              serviceName: 'Virtual Machines',
              cost: 5,
              region: 'UK South',
            },
            {
              kilowattHours: 0.0025099471835124,
              co2e: 9.788794015698361e-7,
              usesAverageCPUConstant: true,
              cloudProvider: 'AZURE',
              accountId: subscriptionId,
              accountName: subscriptionName,
              serviceName: 'Virtual Machines',
              cost: 10,
              region: 'EU West',
            },
            {
              kilowattHours: 0.0203849625,
              co2e: 0.000009626390841375,
              usesAverageCPUConstant: true,
              cloudProvider: 'AZURE',
              accountId: subscriptionId,
              accountName: subscriptionName,
              serviceName: 'Azure App Service',
              cost: 10,
              region: 'US Central',
            },
            {
              kilowattHours: 0.026899499999999996,
              co2e: 0.000010660083553499998,
              usesAverageCPUConstant: true,
              cloudProvider: 'AZURE',
              accountId: subscriptionId,
              accountName: subscriptionName,
              serviceName: 'Container Instances',
              cost: 12,
              region: 'US South Central',
            },
            {
              kilowattHours: 0.19367639999999997,
              co2e: 0.00007890376535999999,
              usesAverageCPUConstant: true,
              cloudProvider: 'AZURE',
              accountId: subscriptionId,
              accountName: subscriptionName,
              serviceName: 'Azure Database for MySQL',
              cost: 12,
              region: 'Unknown',
            },
          ],
        },
      ]
      expect(result).toEqual(expectedResult)
    })
  })

  it('Throws an error when usageDetails.list fails', async () => {
    const errorMessage = 'Something went wrong!'
    const testError = new Error(errorMessage)
    mockUsageDetails.list.mockRejectedValue(testError)

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      // eslint-disable-next-line
      // @ts-ignore: @azure/arm-consumption is using an older version of @azure/ms-rest-js, causing a type error.
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )
    await expect(() =>
      consumptionManagementService.getEstimates(startDate, endDate),
    ).rejects.toThrow(
      `Azure ConsumptionManagementClient.usageDetails.list failed. Reason: ${errorMessage}`,
    )
  })

  it('Throws an error when usageDetails.listNext fails', async () => {
    const errorMessage = {
      message: 'Something went wrong!',
      response: {
        headers: {
          _headersMap: {
            'x-ms-ratelimit-remaining-microsoft.consumption-tenant-requests': {
              value: 1,
            },
            'x-ms-ratelimit-microsoft.consumption-tenant-retry-after': {
              value: 60,
            },
          },
        },
      },
    }

    mockConsumptionManagementResponseOne.nextLink = 'mock next link'
    mockUsageDetails.list.mockResolvedValue(
      mockConsumptionManagementResponseOne,
    )
    mockUsageDetails.listNext.mockRejectedValue(errorMessage)

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      // eslint-disable-next-line
      // @ts-ignore: @azure/arm-consumption is using an older version of @azure/ms-rest-js, causing a type error.
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )

    await expect(() =>
      consumptionManagementService.getEstimates(startDate, endDate),
    ).rejects.toThrow(
      `Azure ConsumptionManagementClient.usageDetails.listNext failed. Reason: ${errorMessage.message}`,
    )
  })
})
