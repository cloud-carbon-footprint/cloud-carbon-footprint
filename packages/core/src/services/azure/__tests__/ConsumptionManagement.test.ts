/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import ServiceWrapper from '../../azure/ServiceWrapper'
import { ServiceClientCredentials } from '@azure/ms-rest-js'
import { SubscriptionClient } from '@azure/arm-subscriptions'
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

  const getServiceWrapper = () =>
    new ServiceWrapper(
      new SubscriptionClient(mockCredentials),
      // eslint-disable-next-line
      // @ts-ignore: @azure/arm-consumption is using an older version of @azure/ms-rest-js, causing a type error.
      new ConsumptionManagementClient(mockCredentials, subscriptionId),
    )

  it('returns estimates for Virtual Machines Compute', async () => {
    mockUsageDetails.list.mockResolvedValue(
      mockConsumptionManagementResponseOne,
    )

    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.HDDCOEFFICIENT),
      new NetworkingEstimator(),
      getServiceWrapper(),
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
        ],
      },
    ]

    expect(result).toEqual(expectedResult)
  })
})
