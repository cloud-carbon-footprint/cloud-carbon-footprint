/*
 * © 2021 Thoughtworks, Inc.
 */
import {
  EstimationResult,
  GroupBy,
  LookupTableInput,
  LookupTableOutput,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'

import AzureAccount from '../application/AzureAccount'
import AzureCredentialsProvider from '../application/AzureCredentialsProvider'
import ConsumptionManagementService from '../lib/ConsumptionManagement'
import AdvisorRecommendations from '../lib/AdvisorRecommendations'

const mockListSubscriptions = { list: jest.fn() }

jest.mock('@azure/arm-resources-subscriptions', () => {
  return {
    SubscriptionClient: jest.fn().mockImplementation(() => {
      return {
        subscriptions: mockListSubscriptions,
      }
    }),
  }
})

jest.mock('@azure/arm-consumption')

const createCredentialsSpy = jest.spyOn(AzureCredentialsProvider, 'create')

const getEstimatesSpy = jest.spyOn(
  ConsumptionManagementService.prototype,
  'getEstimates',
)

const getRecommendationsSpy = jest.spyOn(
  AdvisorRecommendations.prototype,
  'getRecommendations',
)

describe('Azure Account', () => {
  const startDate: Date = new Date('2021-01-01')
  const endDate: Date = new Date('2021-01-01')
  const grouping: GroupBy = GroupBy.day
  const testAccountId = 'test-subscription-id'
  const testAccountName = 'test-subscription'

  it('gets results from getDataFromConsumptionManagement function', async () => {
    const mockCredentials = {
      clientId: 'test-client-id',
      secret: 'test-client-secret',
      domain: 'test-tenant-id',
    }
    ;(createCredentialsSpy as jest.Mock).mockResolvedValue(mockCredentials)

    mockListSubscriptions.list.mockReturnValue([
      { subscriptionId: 'sub-1' },
      { subscriptionId: 'sub-2' },
    ])

    const mockEstimates: EstimationResult[] = [
      {
        timestamp: startDate,
        serviceEstimates: [
          {
            kilowattHours: 0.09313874999999999,
            co2e: 0.000021235635,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'Virtual Machines',
            cost: 5,
            region: 'UK South',
          },
        ],
        periodStartDate: startDate,
        periodEndDate: endDate,
        groupBy: grouping,
      },
    ]

    ;(getEstimatesSpy as jest.Mock).mockResolvedValue(mockEstimates)

    // when
    const azureAccount = new AzureAccount()
    await azureAccount.initializeAccount()
    const results = await azureAccount.getDataFromConsumptionManagement(
      startDate,
      endDate,
      grouping,
    )

    // then
    const expectedEstimates: EstimationResult[] = [
      {
        timestamp: startDate,
        serviceEstimates: [
          {
            kilowattHours: 0.09313874999999999,
            co2e: 0.000021235635,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'Virtual Machines',
            cost: 5,
            region: 'UK South',
          },
        ],
        periodStartDate: startDate,
        periodEndDate: endDate,
        groupBy: grouping,
      },
      {
        timestamp: startDate,
        serviceEstimates: [
          {
            kilowattHours: 0.09313874999999999,
            co2e: 0.000021235635,
            usesAverageCPUConstant: true,
            cloudProvider: 'AZURE',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'Virtual Machines',
            cost: 5,
            region: 'UK South',
          },
        ],
        periodStartDate: startDate,
        periodEndDate: endDate,
        groupBy: grouping,
      },
    ]

    expect(results).toEqual(expectedEstimates)
    expect(getEstimatesSpy).toHaveBeenNthCalledWith(
      2,
      startDate,
      endDate,
      grouping,
    )
  })

  it('gets results from getDataFromAdvisorManagement function', async () => {
    const mockCredentials = {
      clientId: 'test-client-id',
      secret: 'test-client-secret',
      domain: 'test-tenant-id',
    }
    ;(createCredentialsSpy as jest.Mock).mockResolvedValue(mockCredentials)

    mockListSubscriptions.list.mockReturnValue([
      { subscriptionId: 'sub-1' },
      { subscriptionId: 'sub-2' },
    ])

    const mockRecommendations: RecommendationResult[] = [
      {
        cloudProvider: 'AZURE',
        accountId: 'test-account',
        accountName: 'test-account',
        region: 'useast',
        recommendationType: 'Shutdown',
        recommendationDetail:
          'Delete this Virtual Machine: test-instance-name.',
        kilowattHourSavings: 272.409501312,
        resourceId: 'test-id',
        instanceName: 'test-instance-name',
        co2eSavings: 0.1118535205147177,
        costSavings: 20,
      },
    ]

    ;(getRecommendationsSpy as jest.Mock).mockResolvedValue(mockRecommendations)

    // when
    const azureAccount = new AzureAccount()
    await azureAccount.initializeAccount()
    const results = await azureAccount.getDataFromAdvisorManagement()

    // then
    const expectedRecommendations: RecommendationResult[] = [
      {
        cloudProvider: 'AZURE',
        accountId: 'test-account',
        accountName: 'test-account',
        region: 'useast',
        recommendationType: 'Shutdown',
        recommendationDetail:
          'Delete this Virtual Machine: test-instance-name.',
        kilowattHourSavings: 272.409501312,
        resourceId: 'test-id',
        instanceName: 'test-instance-name',
        co2eSavings: 0.1118535205147177,
        costSavings: 20,
      },
      {
        cloudProvider: 'AZURE',
        accountId: 'test-account',
        accountName: 'test-account',
        region: 'useast',
        recommendationType: 'Shutdown',
        recommendationDetail:
          'Delete this Virtual Machine: test-instance-name.',
        kilowattHourSavings: 272.409501312,
        resourceId: 'test-id',
        instanceName: 'test-instance-name',
        co2eSavings: 0.1118535205147177,
        costSavings: 20,
      },
    ]

    expect(results).toEqual(expectedRecommendations)
    expect(getRecommendationsSpy).toHaveBeenCalledTimes(2)
  })

  it('should getDataFromConsumptionManagementInputData', () => {
    const inputData: LookupTableInput[] = [
      {
        serviceName: 'Virtual Machines',
        region: 'uksouth',
        usageType: 'D2 v2/DS2 v2',
        usageUnit: '10 Hours',
      },
    ]

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AWSAccount = require('../application/AzureAccount').default
    const result =
      AWSAccount.getDataFromConsumptionManagementInputData(inputData)

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

  it('Throws an error when AzureCredentialsProvider.create fails', async () => {
    const errorMessage = 'Some error'
    const apiError = new Error(errorMessage)

    ;(createCredentialsSpy as jest.Mock).mockRejectedValue(apiError)

    const azureAccount = new AzureAccount()

    await expect(() => azureAccount.initializeAccount()).rejects.toThrow(
      `Azure initializeAccount failed. Reason: ${errorMessage}`,
    )
  })
})
