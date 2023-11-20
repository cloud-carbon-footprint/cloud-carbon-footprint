/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  SubscriptionClient,
  Subscription,
} from '@azure/arm-resources-subscriptions'
import {
  ClientCertificateCredential,
  ClientSecretCredential,
  WorkloadIdentityCredential,
} from '@azure/identity'
import { ConsumptionManagementClient } from '@azure/arm-consumption'
import { AdvisorManagementClient } from '@azure/arm-advisor'

import {
  ComputeEstimator,
  StorageEstimator,
  NetworkingEstimator,
  MemoryEstimator,
  UnknownEstimator,
  CloudProviderAccount,
  EmbodiedEmissionsEstimator,
} from '@cloud-carbon-footprint/core'
import {
  configLoader,
  EstimationResult,
  GroupBy,
  Logger,
  LookupTableInput,
  LookupTableOutput,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'
import R from 'ramda'
import AzureCredentialsProvider from './AzureCredentialsProvider'
import ConsumptionManagementService from '../lib/ConsumptionManagement'
import AdvisorRecommendations from '../lib/AdvisorRecommendations'
import { AZURE_CLOUD_CONSTANTS } from '../domain'

export default class AzureAccount extends CloudProviderAccount {
  private credentials:
    | ClientCertificateCredential
    | ClientSecretCredential
    | WorkloadIdentityCredential
  private subscriptionClient: SubscriptionClient
  private logger: Logger

  constructor() {
    super()

    this.logger = new Logger('AzureAccount')
  }

  public async initializeAccount(): Promise<void> {
    try {
      this.credentials = await AzureCredentialsProvider.create()
      this.subscriptionClient = new SubscriptionClient(this.credentials)
    } catch (e) {
      throw new Error(`Azure initializeAccount failed. Reason: ${e.message}`)
    }
  }

  public async getDataFromAdvisorManagement(
    subscriptionIds: string[],
  ): Promise<RecommendationResult[]> {
    const subscriptions = await this.getSubscriptions(subscriptionIds)
    const recommendations = await Promise.all(
      subscriptions.map(async (subscription: Subscription) => {
        try {
          return await this.getRecommendationsForSubscription(
            subscription.subscriptionId,
          )
        } catch (e) {
          this.logger.warn(
            `Unable to get Advisor recommendations data for Azure subscription ${subscription.subscriptionId}: ${e.message}`,
          )
          return []
        }
      }),
    )
    return recommendations.flat()
  }

  public async getDataFromConsumptionManagement(
    startDate: Date,
    endDate: Date,
    grouping: GroupBy,
    subscriptionIds: string[],
  ): Promise<EstimationResult[]> {
    const AZURE = configLoader().AZURE
    const subscriptions = await this.getSubscriptions(subscriptionIds)
    const requests = this.createSubscriptionRequests(
      subscriptions,
      startDate,
      endDate,
      grouping,
    )

    // Fetch subscriptions in configured chunks or 10 at a time by default.
    const chunkedRequests = AZURE.SUBSCRIPTION_CHUNKS
      ? R.splitEvery(AZURE.SUBSCRIPTION_CHUNKS, requests)
      : [requests]
    this.logger.debug(
      `Fetching Azure consumption data with ${AZURE.SUBSCRIPTION_CHUNKS} chunk(s)`,
    )

    const estimationResults = []
    for (const requests of chunkedRequests) {
      estimationResults.push(
        await Promise.all(requests.map(async (request) => request())),
      )
    }

    return R.flatten(estimationResults)
  }

  private async getSubscriptions(
    subscriptionIds: string[] = [],
  ): Promise<Subscription[]> {
    const AZURE = configLoader().AZURE
    const defaultAzureSubscriptionIds = subscriptionIds.length
      ? subscriptionIds
      : AZURE.SUBSCRIPTIONS

    const getSubscriptions = async (): Promise<Subscription[]> => {
      const subscriptions = []
      for await (const subscription of this.subscriptionClient.subscriptions.list()) {
        subscriptions.push(subscription)
      }

      if (subscriptions.length === 0) {
        this.logger.warn(
          'No subscription returned for these Azure credentials, be sure the registered application has ' +
            'enough permissions. Go to https://www.cloudcarbonfootprint.org/docs/azure/ for more information.',
        )
      }

      return subscriptions
    }

    const getSubscriptionsByIds = async (
      subscriptionIds: string[],
    ): Promise<Subscription[]> => {
      const subscriptions = []

      for (const subscriptionId of subscriptionIds) {
        try {
          const subscription = await this.subscriptionClient.subscriptions.get(
            subscriptionId,
          )
          subscriptions.push(subscription)
        } catch (error) {
          this.logger.warn(
            `Unable to fetch subscription details for: "${subscriptionId}". Reason: ${error.message}`,
          )
        }
      }

      return subscriptions
    }

    const subscriptions = defaultAzureSubscriptionIds?.length
      ? await getSubscriptionsByIds(defaultAzureSubscriptionIds)
      : await getSubscriptions()

    return subscriptions
  }

  static async getDataFromConsumptionManagementInputData(
    inputData: LookupTableInput[],
  ): Promise<LookupTableOutput[]> {
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
    return await consumptionManagementService.getEstimatesFromInputData(
      inputData,
    )
  }

  private async getRecommendationsForSubscription(subscriptionId: string) {
    const advisorRecommendations = new AdvisorRecommendations(
      new ComputeEstimator(),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new AdvisorManagementClient(this.credentials, subscriptionId),
    )
    return advisorRecommendations.getRecommendations()
  }

  private async getDataForSubscription(
    startDate: Date,
    endDate: Date,
    subscriptionId: string,
    grouping: GroupBy,
  ) {
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
      new ConsumptionManagementClient(this.credentials, subscriptionId),
    )
    return await consumptionManagementService.getEstimates(
      startDate,
      endDate,
      grouping,
    )
  }

  /**
   * Creates an array of functions that each return a promise for EstimationResults.
   * Each Promise corresponds to a mapped getDataForSubscription result for that subscription.
   *
   * @param {Subscription[]} subscriptions - An array of subscription information to retrieve data for.
   * @param {Date} startDate - The start date for the estimation request period.
   * @param {Date} endDate - The end date for the estimation request period.
   * @param {GroupBy} grouping - The grouping method used intended for the estimation request.
   * @returns {(() => Promise<EstimationResult[]>)[]} An array of functions that each return a promise for an array of estimation results.
   */
  private createSubscriptionRequests(
    subscriptions: Subscription[],
    startDate: Date,
    endDate: Date,
    grouping: GroupBy,
  ): (() => Promise<EstimationResult[]>)[] {
    return subscriptions.map((subscription) => {
      return async () => {
        try {
          this.logger.info(`Getting data for ${subscription.displayName}...`)
          return await this.getDataForSubscription(
            startDate,
            endDate,
            subscription.subscriptionId,
            grouping,
          )
        } catch (e) {
          this.logger.warn(
            `Unable to get estimate data for Azure subscription ${subscription.subscriptionId}: ${e.message}`,
          )
          return []
        }
      }
    })
  }
}
