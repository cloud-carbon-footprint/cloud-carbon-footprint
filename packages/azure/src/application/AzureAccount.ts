/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  SubscriptionClient,
  Subscription,
} from '@azure/arm-resources-subscriptions'
import { ClientSecretCredential } from '@azure/identity'
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
  EstimationResult,
  GroupBy,
  Logger,
  LookupTableInput,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'
import AzureCredentialsProvider from './AzureCredentialsProvider'

import ConsumptionManagementService from '../lib/ConsumptionManagement'
import AdvisorRecommendations from '../lib/AdvisorRecommendations'
import { AZURE_CLOUD_CONSTANTS } from '../domain'

export default class AzureAccount extends CloudProviderAccount {
  private credentials: ClientSecretCredential
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

  public async getDataFromAdvisorManagement(): Promise<RecommendationResult[]> {
    const subscriptions = await this.getSubscriptions()
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
  ): Promise<EstimationResult[]> {
    const subscriptions = await this.getSubscriptions()

    this.logger.info('Mapping Over Subscriptions and Usage Rows')
    const estimationResults = await Promise.all(
      subscriptions.map(async (subscription: Subscription) => {
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
      }),
    )
    return estimationResults.flat()
  }

  public async getSubscriptions(): Promise<Subscription[]> {
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

  static getDataFromConsumptionManagementInputData(
    inputData: LookupTableInput[],
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
    )
    return consumptionManagementService.getEstimatesFromInputData(inputData)
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
    return consumptionManagementService.getEstimates(
      startDate,
      endDate,
      grouping,
    )
  }
}
