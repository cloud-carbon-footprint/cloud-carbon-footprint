/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { ServiceClientCredentials } from '@azure/ms-rest-js'
import { ConsumptionManagementClient } from '@azure/arm-consumption'

import ComputeEstimator from '../../../domain/ComputeEstimator'
import { StorageEstimator } from '../../../domain/StorageEstimator'
import { CLOUD_CONSTANTS } from '../../../domain/FootprintEstimationConstants'
import NetworkingEstimator from '../../../domain/NetworkingEstimator'
import ConsumptionManagementService from '../ConsumptionManagement'
import {
  mockConsumptionManagementResponseOne,
  mockConsumptionManagementResponseThree,
  mockConsumptionManagementResponseTwo,
} from '../../../../test/fixtures/consumptionManagement.fixtures'
import { EstimationResult } from '../../../application'
import config from '../../../application/ConfigLoader'

const mockUsageDetails = { list: jest.fn(), listNext: jest.fn() }

jest.mock('../../../application/ConfigLoader')

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
  const endDate = new Date('2020-11-03')
  const subscriptionId = 'test-subscription'
  const mockCredentials: ServiceClientCredentials = { signRequest: jest.fn() }

  beforeEach(() => {
    ;(config as jest.Mock).mockReturnValue({
      GROUP_QUERY_RESULTS_BY_WEEK: false,
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('Returns estimates for Compute', async () => {
    mockUsageDetails.list.mockResolvedValue(
      mockConsumptionManagementResponseOne,
    )

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.HDDCOEFFICIENT),
      new NetworkingEstimator(),
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
            kilowattHours: 0.09810615,
            co2e: 0.000022368202200000002,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountName: 'test-subscription',
            serviceName: 'Virtual Machines',
            cost: 5,
            region: 'UK South',
          },
          {
            kilowattHours: 0.0012798204768000002,
            co2e: 4.991299859520001e-7,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountName: 'test-subscription',
            serviceName: 'Virtual Machines',
            cost: 10,
            region: 'EU West',
          },
          {
            kilowattHours: 0.020198324999999996,
            co2e: 0.000010916406927824999,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountName: 'test-subscription',
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
            kilowattHours: 0.026721749999999996,
            co2e: 0.000011353456974749998,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountName: 'test-subscription',
            serviceName: 'Container Instances',
            cost: 12,
            region: 'US South Central',
          },
          {
            kilowattHours: 0.0641322,
            co2e: 0.00002612745828,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountName: 'test-subscription',
            serviceName: 'Azure Database for MySQL',
            cost: 12,
            region: 'Unknown',
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  describe('When group query results by week is true', () => {
    beforeEach(() => {
      ;(config as jest.Mock).mockReturnValue({
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
        new StorageEstimator(CLOUD_CONSTANTS.GCP.SSDCOEFFICIENT),
        new StorageEstimator(CLOUD_CONSTANTS.GCP.HDDCOEFFICIENT),
        new NetworkingEstimator(),
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
              kilowattHours: 0.09810615,
              co2e: 0.000022368202200000002,
              usesAverageCPUConstant: true,
              cloudProvider: 'AZURE',
              accountName: 'test-subscription',
              serviceName: 'Virtual Machines',
              cost: 5,
              region: 'UK South',
            },
            {
              kilowattHours: 0.0012798204768000002,
              co2e: 4.991299859520001e-7,
              usesAverageCPUConstant: true,
              cloudProvider: 'AZURE',
              accountName: 'test-subscription',
              serviceName: 'Virtual Machines',
              cost: 10,
              region: 'EU West',
            },
            {
              kilowattHours: 0.020198324999999996,
              co2e: 0.000010916406927824999,
              usesAverageCPUConstant: true,
              cloudProvider: 'AZURE',
              accountName: 'test-subscription',
              serviceName: 'Azure App Service',
              cost: 10,
              region: 'US Central',
            },
            {
              kilowattHours: 0.026721749999999996,
              co2e: 0.000011353456974749998,
              usesAverageCPUConstant: true,
              cloudProvider: 'AZURE',
              accountName: 'test-subscription',
              serviceName: 'Container Instances',
              cost: 12,
              region: 'US South Central',
            },
            {
              kilowattHours: 0.0641322,
              co2e: 0.00002612745828,
              usesAverageCPUConstant: true,
              cloudProvider: 'AZURE',
              accountName: 'test-subscription',
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

  it('Returns estimates for Storage', async () => {
    mockUsageDetails.list.mockResolvedValue(
      mockConsumptionManagementResponseTwo,
    )

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.HDDCOEFFICIENT),
      new NetworkingEstimator(),
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
            kilowattHours: 0.003458304,
            co2e: 7.88493312e-7,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountName: 'test-subscription',
            serviceName: 'Storage',
            cost: 10,
            region: 'UK South',
          },
          {
            kilowattHours: 0.00013651199999999998,
            co2e: 5.323967999999999e-8,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountName: 'test-subscription',
            serviceName: 'Storage',
            cost: 5,
            region: 'EU West',
          },
          {
            kilowattHours: 0.00006825599999999999,
            co2e: 2.6619839999999995e-8,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountName: 'test-subscription',
            serviceName: 'Azure Database for MySQL',
            cost: 5,
            region: 'EU West',
          },
          {
            kilowattHours: 0.00034127999999999996,
            co2e: 1.3309919999999998e-7,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountName: 'test-subscription',
            serviceName: 'Container Registry',
            cost: 5,
            region: 'EU West',
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
      new StorageEstimator(CLOUD_CONSTANTS.GCP.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.HDDCOEFFICIENT),
      new NetworkingEstimator(),
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
            accountName: 'test-subscription',
            serviceName: 'Storage',
            cost: 5,
            region: 'UK South',
          },
          {
            kilowattHours: 11.850000000000001,
            co2e: 0.0027018000000000003,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountName: 'test-subscription',
            serviceName: 'Bandwidth',
            cost: 5,
            region: 'UK South',
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Pages through results', async () => {
    const testNextLink = 'test-next-link'
    mockUsageDetails.list.mockResolvedValue({ nextLink: testNextLink })
    mockUsageDetails.listNext.mockResolvedValue(
      mockConsumptionManagementResponseThree,
    )

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.HDDCOEFFICIENT),
      new NetworkingEstimator(),
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
            accountName: 'test-subscription',
            serviceName: 'Storage',
            cost: 5,
            region: 'UK South',
          },
          {
            kilowattHours: 11.850000000000001,
            co2e: 0.0027018000000000003,
            usesAverageCPUConstant: false,
            cloudProvider: 'AZURE',
            accountName: 'test-subscription',
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

  it('Throws an error when usageDetails.list fails', async () => {
    const errorMessage = 'Something went wrong!'
    const testError = new Error(errorMessage)
    mockUsageDetails.list.mockRejectedValue(testError)

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.HDDCOEFFICIENT),
      new NetworkingEstimator(),
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
})
