/*
 * © 2021 Thoughtworks, Inc.
 */

import { ServiceClientCredentials } from '@azure/ms-rest-js'
import { SubscriptionClient } from '@azure/arm-subscriptions'
import { Subscription } from '@azure/arm-subscriptions/esm/models'
import { ApplicationTokenCredentials } from '@azure/ms-rest-nodeauth'
import { ConsumptionManagementClient } from '@azure/arm-consumption'
import R from 'ramda'

import {
  ComputeEstimator,
  StorageEstimator,
  NetworkingEstimator,
  MemoryEstimator,
  UnknownEstimator,
  CloudProviderAccount,
  EmbodiedEmissionsEstimator,
} from '@cloud-carbon-footprint/core'
import { EstimationResult, Logger } from '@cloud-carbon-footprint/common'
import AzureCredentialsProvider from './AzureCredentialsProvider'

import ConsumptionManagementService from '../lib/ConsumptionManagement'
import { AZURE_CLOUD_CONSTANTS } from '../domain'

export default class AzureAccount extends CloudProviderAccount {
  private credentials: ApplicationTokenCredentials | ServiceClientCredentials
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

  public async getDataFromConsumptionManagement(
    startDate: Date,
    endDate: Date,
  ): Promise<EstimationResult[]> {
    const subscriptions = await this.subscriptionClient.subscriptions.list()

    if (subscriptions.length === 0) {
      this.logger.warn(
        'No subscription returned for these Azure credentials, be sure the registered application has ' +
          'enough permissions. Go to https://www.cloudcarbonfootprint.org/docs/azure/ for more information.',
      )
    }

    const estimationResults = []
    const subscriptionChunks = R.splitEvery(10, subscriptions)
    console.time()
    for (const subscriptions of subscriptionChunks) {
      const subscriptionEstimationResults = await Promise.all(
        subscriptions.map(async (subscription: Subscription) => {
          try {
            this.logger.info(`Getting data for ${subscription.displayName}...`)
            return await this.getDataForSubscription(
              startDate,
              endDate,
              subscription.subscriptionId,
            )
          } catch (e) {
            this.logger.warn(
              `Unable to get estimate data for Azure subscription ${subscription.subscriptionId}: ${e.message}`,
            )
            return []
          }
        }),
      )
      estimationResults.push(subscriptionEstimationResults)
    }
    console.timeEnd()
    return R.flatten(estimationResults)
  }
  private async getDataForSubscription(
    startDate: Date,
    endDate: Date,
    subscriptionId: string,
  ) {
    const consumptionManagementService = new ConsumptionManagementService(
      new ComputeEstimator(),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(),
      new EmbodiedEmissionsEstimator(
        AZURE_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new ConsumptionManagementClient(
        // eslint-disable-next-line
        // @ts-ignore: @azure/arm-consumption is using an older version of @azure/ms-rest-js, causing a type error.
        this.credentials,
        subscriptionId,
      ),
    )
    return consumptionManagementService.getEstimates(startDate, endDate)
  }
}
