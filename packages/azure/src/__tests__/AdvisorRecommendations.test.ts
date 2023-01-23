import { AdvisorManagementClient } from '@azure/arm-advisor'
import { ComputeEstimator, MemoryEstimator } from '@cloud-carbon-footprint/core'
import { RecommendationResult } from '@cloud-carbon-footprint/common'
import {
  mockRightsizeVmRecommendationsResults,
  mockShutdownVmRecommendationsResult,
} from './fixtures/advisor.fixtures'
import { AZURE_CLOUD_CONSTANTS } from '../domain'
import AdvisorRecommendations from '../lib/AdvisorRecommendations'

const mockListRecommendations = { list: jest.fn() }

jest.mock('@azure/arm-advisor', () => {
  return {
    AdvisorManagementClient: jest.fn().mockImplementation(() => {
      return {
        recommendations: mockListRecommendations,
      }
    }),
  }
})

describe('Azure Advisor Recommendations Service', () => {
  const subscriptionId = 'test-subscription-id'
  const mockCredentials = {
    msalFlow: jest.fn(),
    getToken: jest.fn(),
  }

  it('Get recommendations from Advisor API type: Shutdown', async () => {
    mockListRecommendations.list.mockReturnValue(
      mockShutdownVmRecommendationsResult,
    )

    const azureRecommendationsServices = new AdvisorRecommendations(
      new ComputeEstimator(),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new AdvisorManagementClient(mockCredentials, subscriptionId),
    )

    const result = await azureRecommendationsServices.getRecommendations()

    const expectedResult: RecommendationResult[] = [
      {
        accountId: subscriptionId,
        accountName: subscriptionId,
        cloudProvider: 'AZURE',
        co2eSavings: 0.0014303862427248,
        costSavings: 30,
        instanceName: 'test-vm-name',
        kilowattHourSavings: 3.7734191999999998,
        recommendationDetail: 'Shutdown instance: test-vm-name.',
        recommendationType: 'Shutdown',
        region: 'EastUS',
        resourceId: 'test-resource-id',
      },
      {
        accountId: subscriptionId,
        accountName: subscriptionId,
        cloudProvider: 'AZURE',
        co2eSavings: 0.331186314674052,
        costSavings: 30,
        instanceName: null,
        kilowattHourSavings: 942.7987672848001,
        recommendationDetail:
          'Shutdown instance with Resource ID: test-resource-id.',
        recommendationType: 'Shutdown',
        region: 'Unknown',
        resourceId: 'test-resource-id',
      },
      {
        accountId: 'test-subscription-id',
        accountName: 'test-subscription-id',
        cloudProvider: 'AZURE',
        co2eSavings: 0.06597353757199936,
        costSavings: 30,
        instanceName: 'test-vm-name',
        kilowattHourSavings: 174.0409729416,
        recommendationDetail: 'Shutdown instance: test-vm-name.',
        recommendationType: 'Shutdown',
        region: 'EastUS',
        resourceId: 'test-resource-id',
      },
      {
        accountId: 'test-subscription-id',
        accountName: 'test-subscription-id',
        cloudProvider: 'AZURE',
        co2eSavings: 0.0007151931213624,
        costSavings: 30,
        instanceName: 'test-vm-name',
        kilowattHourSavings: 1.8867095999999999,
        recommendationDetail: 'Shutdown instance: test-vm-name.',
        recommendationType: 'Shutdown',
        region: 'EastUS',
        resourceId: 'test-resource-id',
      },
    ]

    expect(result).toEqual(expectedResult)
  })

  it('Get recommendations from Advisor API type: Right-size', async () => {
    mockListRecommendations.list.mockReturnValue(
      mockRightsizeVmRecommendationsResults,
    )

    const azureRecommendationsServices = new AdvisorRecommendations(
      new ComputeEstimator(),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new AdvisorManagementClient(mockCredentials, subscriptionId),
    )

    const result = await azureRecommendationsServices.getRecommendations()

    const expectedResult: RecommendationResult[] = [
      {
        accountId: subscriptionId,
        accountName: subscriptionId,
        cloudProvider: 'AZURE',
        co2eSavings: 0.020799503354697324,
        costSavings: 30,
        instanceName: 'test-vm-name',
        kilowattHourSavings: 54.86996656201727,
        recommendationDetail:
          'Right-size instance: test-vm-name. Update instance type M16ms to M8ms',
        recommendationType: 'Right-size',
        region: 'EastUS',
        resourceId: 'test-resource-id',
      },
    ]

    expect(result).toEqual(expectedResult)
  })
})
