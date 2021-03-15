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
import { mockConsumptionManagementResponseOne } from '../../../../test/fixtures/consumptionManagement.fixtures'
import { EstimationResult } from '../../../application'

const mockUsageDetails = { list: jest.fn() }

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

  it('returns estimates for Compute', async () => {
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
            kilowattHours: 0.09313874999999999,
            co2e: 0.000021235635,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountName: 'test-subscription',
            serviceName: 'Virtual Machines',
            cost: 5,
            region: 'UK South',
          },
          {
            kilowattHours: 0.00121501944,
            co2e: 0.0000004738575816,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountName: 'test-subscription',
            serviceName: 'Virtual Machines',
            cost: 10,
            region: 'EU West',
          },
          {
            kilowattHours: 0.019175624999999998,
            co2e: 0.000010363677463124999,
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
            kilowattHours: 0.02300625,
            co2e: 0.00000977482648125,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountName: 'test-subscription',
            serviceName: 'Container Instances',
            cost: 12,
            region: 'US South Central',
          },
        ],
      },
    ]

    expect(result).toEqual(expectedResult)
  })
})
