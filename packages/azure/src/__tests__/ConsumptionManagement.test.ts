/*
 * © 2021 Thoughtworks, Inc.
 */

import { ConsumptionManagementClient } from '@azure/arm-consumption'

import {
  EstimationResult,
  GroupBy,
  LookupTableInput,
  LookupTableOutput,
  setConfig,
} from '@cloud-carbon-footprint/common'
import {
  ComputeEstimator,
  EmbodiedEmissionsEstimator,
  MemoryEstimator,
  NetworkingEstimator,
  StorageEstimator,
  UnknownEstimator,
} from '@cloud-carbon-footprint/core'

import {
  mockConsumptionManagementResponseEight,
  mockConsumptionManagementResponseEleven,
  mockConsumptionManagementResponseFive,
  mockConsumptionManagementResponseFour,
  mockConsumptionManagementResponseNine,
  mockConsumptionManagementResponseOne,
  mockConsumptionManagementResponseSeven,
  mockConsumptionManagementResponseSix,
  mockConsumptionManagementResponseTen,
  mockConsumptionManagementResponseThree,
  mockConsumptionManagementResponseTwo,
  mockIterableResponse,
} from './fixtures/consumptionManagement.fixtures'

import { ConsumptionManagementService } from '../lib'
import { AZURE_CLOUD_CONSTANTS } from '../domain'

const mockUsageDetails = { list: jest.fn() }

jest.mock('@cloud-carbon-footprint/common', () => ({
  ...(jest.requireActual('@cloud-carbon-footprint/common') as Record<
    string,
    unknown
  >),
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

describe('Azure Consumption Management Service', () => {
  const startDate = new Date('2020-11-02')
  const endDate = new Date('2020-11-07')
  const grouping: GroupBy = GroupBy.day
  const subscriptionId = 'test-subscription-id'
  const subscriptionName = 'test-subscription'
  const mockCredentials = {
    msalFlow: jest.fn(),
    getToken: jest.fn(),
  }

  beforeEach(() => {
    AZURE_CLOUD_CONSTANTS.KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT = {
      total: {},
    }

    setConfig({
      AZURE: {
        RESOURCE_TAG_NAMES: ['resourceGroup', 'custom', 'created-by', 'other'],
      },
    })
  })

  it('Returns estimates for Compute', async () => {
    mockUsageDetails.list.mockReturnValue(
      mockIterableResponse(mockConsumptionManagementResponseOne),
    )

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AZURE_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AZURE_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )

    const result = await consumptionManagementService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            kilowattHours: 0.2614738305048199,
            co2e: 0.00005883161186358448,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Virtual Machines',
            cost: 5,
            region: 'uksouth',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            kilowattHours: 0.002863085156621724,
            co2e: 9.402371654345742e-7, // Very very small decimal
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Virtual Machines',
            cost: 10,
            region: 'westeurope',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            kilowattHours: 0.0683736557005491,
            co2e: 0.00002914454423698185,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Azure App Service',
            cost: 10,
            region: 'CentralUS',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-02T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-02T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2020-11-03'),
        serviceEstimates: [
          {
            kilowattHours: 0.025359,
            co2e: 0.000009464764929,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Container Instances',
            cost: 12,
            region: 'SouthCentralUS',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            kilowattHours: 0.18258479999999996,
            co2e: 0.00006413838151448518,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Azure Database for MySQL',
            cost: 12,
            region: 'Unknown',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            accountId: 'test-subscription-id',
            accountName: 'test-subscription',
            cloudProvider: 'AZURE',
            co2e: 0.00004108157999999999,
            cost: 12,
            kilowattHours: 0.18258479999999996,
            region: 'ukwest',
            serviceName: 'Virtual Machines Licenses',
            usesAverageCPUConstant: false,
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            accountId: 'test-subscription-id',
            accountName: 'test-subscription',
            cloudProvider: 'AZURE',
            co2e: 0.00006413838151448518,
            cost: 12,
            kilowattHours: 0.18258479999999996,
            region: 'Unknown',
            serviceName: 'VPN Gateway',
            usesAverageCPUConstant: false,
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-03T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-03T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimates for Storage', async () => {
    mockUsageDetails.list.mockReturnValue(
      mockIterableResponse(mockConsumptionManagementResponseTwo),
    )

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AZURE_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AZURE_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )

    const result = await consumptionManagementService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            kilowattHours: 0.010374912000000002,
            co2e: 0.0000023343552,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Storage',
            cost: 10,
            region: 'uksouth',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            kilowattHours: 0.011157869359725106,
            co2e: 0.000003664244297733725,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Storage',
            cost: 10,
            region: 'westeurope',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            kilowattHours: 0.000204768,
            co2e: 6.72458112e-8, // Very very small decimal
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Azure Database for MySQL',
            cost: 5,
            region: 'westeurope',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            kilowattHours: 0.00034127999999999996,
            co2e: 1.12076352e-7,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Container Registry',
            cost: 5,
            region: 'westeurope',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            kilowattHours: 0.018929664000000002,
            co2e: 0.0000042591744,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'HDInsight',
            cost: 5,
            region: 'uksouth',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            kilowattHours: 0.068256,
            co2e: 0.0000153576,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Azure Synapse Analytics',
            cost: 5,
            region: 'uksouth',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            kilowattHours: 0.0010238399999999998,
            co2e: 7.250834879999999e-7, // Very very small decimal
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Storage',
            cost: 5,
            region: 'centralindia',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            kilowattHours: 0.003276288,
            co2e: 0.0000011508943225029118,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Storage',
            cost: 1,
            region: 'Unknown',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-02T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-02T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimates for Networking', async () => {
    mockUsageDetails.list.mockReturnValue(
      mockIterableResponse(mockConsumptionManagementResponseThree),
    )

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AZURE_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AZURE_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )

    const result = await consumptionManagementService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            kilowattHours: 0.011850000000000001,
            co2e: 0.00000266625,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Storage',
            cost: 5,
            region: 'uksouth',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            kilowattHours: 11.850000000000001,
            co2e: 0.0026662500000000002,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Bandwidth',
            cost: 5,
            region: 'uksouth',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-02T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-02T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimates for Memory', async () => {
    mockUsageDetails.list.mockReturnValue(
      mockIterableResponse(mockConsumptionManagementResponseFive),
    )

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AZURE_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AZURE_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )

    const result = await consumptionManagementService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-03'),
        serviceEstimates: [
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 0.00005086835935908219,
            cost: 20,
            region: 'northeurope',
            serviceName: 'Virtual Machines',
            usesAverageCPUConstant: true,
            kilowattHours: 0.18258564019771067,
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 0.000018194319360000002,
            cost: 5,
            region: 'apsoutheast',
            serviceName: 'Redis Cache',
            usesAverageCPUConstant: false,
            kilowattHours: 0.04459392,
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-03T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-03T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 5.4476337675375e-12,
            cost: 10,
            region: 'EastUS2',
            serviceName: 'Functions',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0000000143710875,
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 0.00000151024596203943,
            cost: 7,
            region: 'ukwest',
            serviceName: 'Container Instances',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0067122042757308,
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-02T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-02T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimates for Storage services with replication factors', async () => {
    mockUsageDetails.list.mockReturnValue(
      mockIterableResponse(mockConsumptionManagementResponseSix),
    )

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AZURE_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AZURE_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )

    const result = await consumptionManagementService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-03'),
        serviceEstimates: [
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 8.7541516223712e-11,
            cost: 20,
            region: 'WestUS',
            serviceName: 'Storage',
            usesAverageCPUConstant: false,
            kilowattHours: 0.000000271727136,
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 4.669232137601761e-10,
            cost: 15,
            region: 'SouthCentralUS',
            serviceName: 'Storage',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0000012510300960000003,
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 6.91092e-13,
            cost: 10,
            region: 'uksouth',
            serviceName: 'Storage',
            usesAverageCPUConstant: false,
            kilowattHours: 3.07152e-9,
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 1.813633281101952e-9,
            cost: 5,
            region: 'westus2',
            serviceName: 'Storage',
            usesAverageCPUConstant: false,
            kilowattHours: 0.000005629481856,
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-03T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-03T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2020-11-04'),
        serviceEstimates: [
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 0.0000029486592,
            cost: 2,
            region: 'uksouth',
            serviceName: 'Storage',
            usesAverageCPUConstant: false,
            kilowattHours: 0.013105152,
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 0.0000012568113792000002,
            cost: 2,
            region: 'westindia',
            serviceName: 'Storage',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0017746560000000003,
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-04T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-04T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimates for Database and Cache services with replication factors', async () => {
    mockUsageDetails.list.mockReturnValue(
      mockIterableResponse(mockConsumptionManagementResponseSeven),
    )

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AZURE_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AZURE_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )

    const result = await consumptionManagementService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-03'),
        serviceEstimates: [
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 3.09629032372008e-10,
            cost: 20,
            region: 'uksouth',
            serviceName: 'Azure Database for MySQL',
            usesAverageCPUConstant: false,
            kilowattHours: 0.00000137612903276448,
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 0.0000034234649999999996,
            cost: 45,
            region: 'uksouth',
            serviceName: 'SQL Database',
            usesAverageCPUConstant: true,
            kilowattHours: 0.015215399999999999,
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-03T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-03T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2020-11-04'),
        serviceEstimates: [
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 0.00004108157999999999,
            cost: 30,
            region: 'uksouth',
            serviceName: 'Azure Database for MySQL',
            usesAverageCPUConstant: true,
            kilowattHours: 0.18258479999999996,
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 1.2515071940042559e-9,
            cost: 35,
            region: 'CentralUS',
            serviceName: 'Azure Cosmos DB',
            usesAverageCPUConstant: false,
            kilowattHours: 0.00000293605970619456,
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            accountId: subscriptionId,
            accountName: subscriptionName,
            cloudProvider: 'AZURE',
            co2e: 1.610070967511351e-10,
            cost: 40,
            region: 'uksouth',
            serviceName: 'SQL Database',
            usesAverageCPUConstant: false,
            kilowattHours: 7.155870966717116e-7,
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-04T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-04T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Handles Unknown usage and ignores unsupported usage types', async () => {
    mockUsageDetails.list.mockReturnValue(
      mockIterableResponse(mockConsumptionManagementResponseFour),
    )

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AZURE_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AZURE_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )

    const result = await consumptionManagementService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    expect(result).toEqual([])
  })

  it('Returns estimates for reclassified unknowns', async () => {
    mockUsageDetails.list.mockReturnValue(
      mockIterableResponse(mockConsumptionManagementResponseEight),
    )

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AZURE_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AZURE_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )

    const result = await consumptionManagementService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            kilowattHours: 0.18258564019771067,
            co2e: 0.00005086835935908219,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Virtual Machines',
            cost: 5,
            region: 'northeurope',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            kilowattHours: 0,
            co2e: 0,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'API Management',
            cost: 1.579140496,
            region: 'northeurope',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-02T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-02T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2020-11-03'),
        serviceEstimates: [
          {
            accountId: 'test-subscription-id',
            accountName: 'test-subscription',
            cloudProvider: 'AZURE',
            co2e: 8.179862341458044e-10,
            cost: 35,
            kilowattHours: 0.00000293605970619456,
            region: 'northeurope',
            serviceName: 'Azure Cosmos DB',
            usesAverageCPUConstant: false,
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            kilowattHours: 0,
            co2e: 0,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Advanced Data Security',
            cost: 0.4835702479,
            region: 'northeurope',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-03T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-03T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2020-11-04'),
        serviceEstimates: [
          {
            accountId: 'test-subscription-id',
            accountName: 'test-subscription',
            cloudProvider: 'AZURE',
            co2e: 0.00000330141,
            cost: 5,
            kilowattHours: 0.011850000000000001,
            region: 'northeurope',
            serviceName: 'Storage',
            usesAverageCPUConstant: false,
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            kilowattHours: 0,
            co2e: 0,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Load Balancer',
            cost: 0.006280996057,
            region: 'northeurope',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-04T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-04T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2020-11-05'),
        serviceEstimates: [
          {
            accountId: 'test-subscription-id',
            accountName: 'test-subscription',
            cloudProvider: 'AZURE',
            co2e: 0.0000018700201112186009,
            cost: 7,
            kilowattHours: 0.0067122042757308,
            region: 'northeurope',
            serviceName: 'Container Instances',
            usesAverageCPUConstant: false,
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            kilowattHours: 0,
            co2e: 0,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Azure Databricks',
            cost: 18,
            region: 'northeurope',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-05T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-05T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2020-11-06'),
        serviceEstimates: [
          {
            accountId: 'test-subscription-id',
            accountName: 'test-subscription',
            cloudProvider: 'AZURE',
            co2e: 0,
            cost: 0.003168316832,
            kilowattHours: 0,
            region: 'All Regions',
            serviceName: 'Azure DNS',
            usesAverageCPUConstant: false,
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-06T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-06T00:00:00.000Z'),
      },
    ]

    expect(result).toEqual(expectedResult)
  })

  it('Returns estimates for Compute with Embodied Emissions, and modern usage type', async () => {
    mockUsageDetails.list.mockReturnValue(
      mockIterableResponse(mockConsumptionManagementResponseNine),
    )

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AZURE_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AZURE_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )

    const result = await consumptionManagementService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            kilowattHours: 0.18258564019771067,
            co2e: 0.00005086835935908219,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Virtual Machines',
            cost: 10,
            region: 'northeurope',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            kilowattHours: 0.013126433307939065,
            co2e: 0.000004310720698327189,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Virtual Machines',
            cost: 15,
            region: 'westeurope',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            kilowattHours: 0.2614738305048199,
            co2e: 0.00005883161186358448,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Virtual Machines',
            cost: 5,
            region: 'uksouth',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            accountId: 'test-subscription-id',
            accountName: 'test-subscription',
            cloudProvider: 'AZURE',
            co2e: 0.00007408639568815949,
            cost: 5,
            kilowattHours: 0.19544303461417178,
            region: 'EastUS',
            serviceName: 'Virtual Machines',
            usesAverageCPUConstant: true,
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-02T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-02T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimates for GPU Virtual Machines', async () => {
    mockUsageDetails.list.mockReturnValue(
      mockIterableResponse(mockConsumptionManagementResponseEleven),
    )

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AZURE_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AZURE_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )

    const result = await consumptionManagementService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            kilowattHours: 0.9444048570032982,
            co2e: 0.00026311119316111894,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Virtual Machines',
            cost: 10,
            region: 'northeurope',
            tags: {
              custom: 'custom-tag-value',
              other: 'other-custom-tag-value',
              resourceGroup: 'first-resource-group',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-02T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-02T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2020-11-03'),
        serviceEstimates: [
          {
            kilowattHours: 0.9420988104279044,
            co2e: 0.0003571204539700953,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Virtual Machines',
            cost: 10,
            region: 'EastUS',
            tags: {
              custom: 'custom-tag-value',
              'created-by': 'created-by-tag-value',
              resourceGroup: 'second-resource-group',
            },
          },
          {
            kilowattHours: 2.774591597330377,
            co2e: 0.0009111758805632959,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Virtual Machines',
            cost: 10,
            region: 'westeurope',
            tags: {
              resourceGroup: 'third-resource-group',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-03T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-03T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('successfully returns estimation for lookup table input data', () => {
    const inputData: LookupTableInput[] = [
      {
        serviceName: 'Virtual Machines',
        region: 'uksouth',
        usageType: 'D2 v2/DS2 v2',
        usageUnit: '10 Hours',
      },
    ]

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AZURE_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AZURE_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
    )

    const result =
      consumptionManagementService.getEstimatesFromInputData(inputData)

    const expectedResult: LookupTableOutput[] = [
      {
        serviceName: 'Virtual Machines',
        region: 'uksouth',
        usageType: 'D2 v2/DS2 v2',
        kilowattHours: 0.015380813559107052,
        co2e: 0.0000034606830507990865,
      },
    ]

    expect(result).toEqual(expectedResult)
  })

  it('Pages through results', async () => {
    const mockResponse = mockIterableResponse(
      mockConsumptionManagementResponseThree,
    )
    jest.spyOn(mockResponse, 'next')
    mockUsageDetails.list.mockReturnValue(mockResponse)

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AZURE_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AZURE_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )

    const result = await consumptionManagementService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            kilowattHours: 0.011850000000000001,
            co2e: 0.00000266625,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Storage',
            cost: 5,
            region: 'uksouth',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
          {
            kilowattHours: 11.850000000000001,
            co2e: 0.0026662500000000002,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Bandwidth',
            cost: 5,
            region: 'uksouth',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-02T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-02T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
    expect(mockResponse.next).toHaveBeenCalled()
  })

  describe('When group query results by week is true', () => {
    it('Returns estimates for Compute grouped by week', async () => {
      mockUsageDetails.list.mockReturnValue(
        mockIterableResponse(mockConsumptionManagementResponseOne),
      )

      const consumptionManagementService = new ConsumptionManagementService(
        new ComputeEstimator(),
        new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
        new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
        new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
        new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
        new UnknownEstimator(AZURE_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
        new EmbodiedEmissionsEstimator(
          AZURE_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
        ),
        new ConsumptionManagementClient(mockCredentials, subscriptionId),
      )

      const groupingByWeek = GroupBy.week

      const result = await consumptionManagementService.getEstimates(
        startDate,
        endDate,
        groupingByWeek,
      )

      const expectedResult: EstimationResult[] = [
        {
          timestamp: new Date('2020-11-02'),
          serviceEstimates: [
            {
              kilowattHours: 0.2614738305048199,
              co2e: 0.00005883161186358448,
              usesAverageCPUConstant: true,
              cloudProvider: 'AZURE',
              accountId: subscriptionId,
              accountName: subscriptionName,
              serviceName: 'Virtual Machines',
              cost: 5,
              region: 'uksouth',
              tags: {
                resourceGroup: 'test-resource-group',
              },
            },
            {
              kilowattHours: 0.002863085156621724,
              co2e: 9.402371654345742e-7, // Very very small number
              usesAverageCPUConstant: true,
              cloudProvider: 'AZURE',
              accountId: subscriptionId,
              accountName: subscriptionName,
              serviceName: 'Virtual Machines',
              cost: 10,
              region: 'westeurope',
              tags: {
                resourceGroup: 'test-resource-group',
              },
            },
            {
              kilowattHours: 0.0683736557005491,
              co2e: 0.00002914454423698185,
              usesAverageCPUConstant: true,
              cloudProvider: 'AZURE',
              accountId: subscriptionId,
              accountName: subscriptionName,
              serviceName: 'Azure App Service',
              cost: 10,
              region: 'CentralUS',
              tags: {
                resourceGroup: 'test-resource-group',
              },
            },
            {
              kilowattHours: 0.025359,
              co2e: 0.000009464764929,
              usesAverageCPUConstant: true,
              cloudProvider: 'AZURE',
              accountId: subscriptionId,
              accountName: subscriptionName,
              serviceName: 'Container Instances',
              cost: 12,
              region: 'SouthCentralUS',
              tags: {
                resourceGroup: 'test-resource-group',
              },
            },
            {
              kilowattHours: 0.18258479999999996,
              co2e: 0.00006413838151448518,
              usesAverageCPUConstant: true,
              cloudProvider: 'AZURE',
              accountId: subscriptionId,
              accountName: subscriptionName,
              serviceName: 'Azure Database for MySQL',
              cost: 12,
              region: 'Unknown',
              tags: {
                resourceGroup: 'test-resource-group',
              },
            },
            {
              accountId: 'test-subscription-id',
              accountName: 'test-subscription',
              cloudProvider: 'AZURE',
              co2e: 0.00004108157999999999,
              cost: 12,
              kilowattHours: 0.18258479999999996,
              region: 'ukwest',
              serviceName: 'Virtual Machines Licenses',
              usesAverageCPUConstant: false,
              tags: {
                resourceGroup: 'test-resource-group',
              },
            },
            {
              accountId: 'test-subscription-id',
              accountName: 'test-subscription',
              cloudProvider: 'AZURE',
              co2e: 0.00006413838151448518,
              cost: 12,
              kilowattHours: 0.18258479999999996,
              region: 'Unknown',
              serviceName: 'VPN Gateway',
              usesAverageCPUConstant: false,
              tags: {
                resourceGroup: 'test-resource-group',
              },
            },
          ],
          groupBy: GroupBy.week,
          periodEndDate: new Date('2020-11-08T23:59:59.000Z'),
          periodStartDate: new Date('2020-11-02T00:00:00.000Z'),
        },
      ]
      expect(result).toEqual(expectedResult)
    })
  })

  it('Returns estimates filtered within the start and end date', async () => {
    mockUsageDetails.list.mockReturnValue(
      mockIterableResponse(mockConsumptionManagementResponseTen),
    )

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AZURE_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AZURE_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )

    const result = await consumptionManagementService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-07'),
        serviceEstimates: [
          {
            kilowattHours: 0.013126433307939065,
            co2e: 0.000004310720698327189,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountId: subscriptionId,
            accountName: subscriptionName,
            serviceName: 'Virtual Machines',
            cost: 15,
            region: 'westeurope',
            tags: {
              resourceGroup: 'test-resource-group',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-07T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-07T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  // Note: Might need to consider test and try/catch retry logic.
  // usageDetails.list synchronously returns iterator and does not do API call nor affects rate limit
  xit('Throws an error when usageDetails.list fails', async () => {
    const errorMessage = 'Something went wrong!'

    mockUsageDetails.list.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AZURE_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AZURE_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )
    await expect(() =>
      consumptionManagementService.getEstimates(startDate, endDate, grouping),
    ).rejects.toThrow(
      `Azure ConsumptionManagementClient.usageDetails.list failed. Reason: ${errorMessage}`,
    )
  })

  it('Throws an error when iteration on a usageRow fails', async () => {
    const errorMessage = 'Something went wrong!'
    const _headersMap = new Map([
      ["'x-ms-ratelimit-remaining-microsoft.consumption-tenant-requests':", 1],
    ])
    const testError = {
      message: errorMessage,
      response: {
        headers: {
          _headersMap,
        },
      },
    }
    const mockResponse = mockIterableResponse(
      mockConsumptionManagementResponseOne,
    )
    const nextPageSpy = jest.spyOn(mockResponse, 'next')
    mockUsageDetails.list.mockReturnValue(mockResponse)
    nextPageSpy.mockRejectedValue(testError)

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AZURE_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AZURE_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )

    await expect(() =>
      consumptionManagementService.getEstimates(startDate, endDate, grouping),
    ).rejects.toThrow(
      `Azure ConsumptionManagementClient UsageDetailRow paging failed. Reason: ${errorMessage}`,
    )
  })
})
