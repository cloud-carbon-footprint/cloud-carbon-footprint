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
        co2eSavings: 0.0012919617676223998,
        costSavings: 30,
        instanceName: 'test-vm-name',
        kilowattHourSavings: 3.4082495999999995,
        recommendationDetail: 'Shutdown instance: test-vm-name.',
        recommendationType: 'Shutdown',
        region: 'EastUS',
        resourceId: 'test-resource-id',
      },
      {
        accountId: subscriptionId,
        accountName: subscriptionId,
        cloudProvider: 'AZURE',
        co2eSavings: 0.2991360261572083,
        costSavings: 30,
        instanceName: null,
        kilowattHourSavings: 851.5601769024001,
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
        co2eSavings: 0.05958900167793491,
        costSavings: 30,
        instanceName: 'test-vm-name',
        kilowattHourSavings: 157.19829814079998,
        recommendationDetail: 'Shutdown instance: test-vm-name.',
        recommendationType: 'Shutdown',
        region: 'EastUS',
        resourceId: 'test-resource-id',
      },
      {
        accountId: 'test-subscription-id',
        accountName: 'test-subscription-id',
        cloudProvider: 'AZURE',
        co2eSavings: 0.0006459808838111999,
        costSavings: 30,
        instanceName: 'test-vm-name',
        kilowattHourSavings: 1.7041247999999998,
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
        co2eSavings: 0.018786648191339524,
        costSavings: 30,
        instanceName: 'test-vm-name',
        kilowattHourSavings: 49.55996979795109,
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
