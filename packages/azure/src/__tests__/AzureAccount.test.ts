/*
 * © 2021 Thoughtworks, Inc.
 */
import {
  EstimationResult,
  GroupBy,
  LookupTableInput,
  LookupTableOutput,
  RecommendationResult,
  configLoader,
} from '@cloud-carbon-footprint/common'

import AzureAccount from '../application/AzureAccount'
import AzureCredentialsProvider from '../application/AzureCredentialsProvider'
import ConsumptionManagementService from '../lib/ConsumptionManagement'
import AdvisorRecommendations from '../lib/AdvisorRecommendations'

const mockListSubscriptions = { list: jest.fn(), get: jest.fn() }

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

  describe('getDataFromConsumptionManagement', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

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

      const promiseSpy = jest.spyOn(Promise, 'all')

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
      expect(promiseSpy).toBeCalledTimes(1)
    })

    describe('Fetch Configurations', () => {
      it('fetches data for all subscriptions when subscription chunks are set', async () => {
        const mockCredentials = {
          clientId: 'test-client-id',
          secret: 'test-client-secret',
          domain: 'test-tenant-id',
        }
        ;(createCredentialsSpy as jest.Mock).mockResolvedValue(mockCredentials)
        mockListSubscriptions.list.mockReturnValue([
          { subscriptionId: 'sub-1' },
          { subscriptionId: 'sub-2' },
          { subscriptionId: 'sub-3' },
          { subscriptionId: 'sub-4' },
          { subscriptionId: 'sub-5' },
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

        const AZURE = configLoader().AZURE || {}
        AZURE.SUBSCRIPTION_CHUNKS = 2
        const promiseSpy = jest.spyOn(Promise, 'all')
        // when
        const azureAccount = new AzureAccount()
        await azureAccount.initializeAccount()
        const results = await azureAccount.getDataFromConsumptionManagement(
          startDate,
          endDate,
          grouping,
        )

        // Results should be the same as the mockEstimates array repeated 5 times
        const expectedEstimates = Array.from(
          { length: 5 },
          () => mockEstimates[0],
        )

        expect(results).toEqual(expectedEstimates)

        // getEstimates should have been called 5 times (once for each subscription)
        expect(getEstimatesSpy).toHaveBeenCalledTimes(5)
        // Promise.all should have been called 3 times (once for each chunk of 2 subscriptions)
        expect(promiseSpy).toHaveBeenCalledTimes(3)

        // Reset the config
        delete AZURE.SUBSCRIPTION_CHUNKS
      })

      it('fetches data only for specific subscriptions when specified environment variable subscriptions are set', async () => {
        const mockCredentials = {
          clientId: 'test-client-id',
          secret: 'test-client-secret',
          domain: 'test-tenant-id',
        }
        ;(createCredentialsSpy as jest.Mock).mockResolvedValue(mockCredentials)

        const AZURE: any = configLoader().AZURE || {}
        const subscriptions = ['sub-1', 'sub-2', 'sub-3']
        AZURE.SUBSCRIPTIONS = subscriptions

        subscriptions.forEach((subscriptionId) => {
          mockListSubscriptions.get.mockReturnValueOnce({ subscriptionId })
        })

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
        const getDataForSubscriptionSpy = jest.spyOn(
          AzureAccount.prototype,
          'getDataForSubscription',
        )

        // when
        const azureAccount = new AzureAccount()
        await azureAccount.initializeAccount()
        const results = await azureAccount.getDataFromConsumptionManagement(
          startDate,
          endDate,
          grouping,
        )

        // Results should be the same as the mockEstimates array repeated35 times
        const expectedEstimates = Array.from(
          { length: 3 },
          () => mockEstimates[0],
        )

        expect(results).toEqual(expectedEstimates)
        // getDataForSubscription should have been called 3 times (once for each given subscription ID)
        subscriptions.forEach((subscriptionId) => {
          expect(getDataForSubscriptionSpy).toHaveBeenCalledWith(
            startDate,
            endDate,
            subscriptionId,
            grouping,
          )
        })

        // Reset the config
        delete AZURE.SUBSCRIPTIONS
      })

      it('fetches data only for specific subscriptions when specified parameter subscriptions are set', async () => {
        const mockCredentials = {
          clientId: 'test-client-id',
          secret: 'test-client-secret',
          domain: 'test-tenant-id',
        }
        ;(createCredentialsSpy as jest.Mock).mockResolvedValue(mockCredentials)

        const subscriptions = ['sub-1', 'sub-2', 'sub-3']

        subscriptions.forEach((subscriptionId) => {
          mockListSubscriptions.get.mockReturnValueOnce({ subscriptionId })
        })

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
        const getDataForSubscriptionSpy = jest.spyOn(
          AzureAccount.prototype,
          'getDataForSubscription',
        )

        // when
        const azureAccount = new AzureAccount()
        await azureAccount.initializeAccount()
        const results = await azureAccount.getDataFromConsumptionManagement(
          startDate,
          endDate,
          grouping,
          subscriptions,
        )

        // Results should be the same as the mockEstimates array repeated35 times
        const expectedEstimates = Array.from(
          { length: 3 },
          () => mockEstimates[0],
        )

        expect(results).toEqual(expectedEstimates)
        // getDataForSubscription should have been called 3 times (once for each given subscription ID)
        subscriptions.forEach((subscriptionId) => {
          expect(getDataForSubscriptionSpy).toHaveBeenCalledWith(
            startDate,
            endDate,
            subscriptionId,
            grouping,
          )
        })
      })
    })
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

  it('should getDataFromConsumptionManagementInputData', async () => {
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
    const result = await AWSAccount.getDataFromConsumptionManagementInputData(
      inputData,
    )

    const expectedResult: LookupTableOutput[] = [
      {
        serviceName: 'Virtual Machines',
        region: 'uksouth',
        usageType: 'D2 v2/DS2 v2',
        kilowattHours: 0.011945378995278953,
        co2e: 0.000004196172273564499,
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
