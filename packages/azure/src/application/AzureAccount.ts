/*
 * © 2021 Thoughtworks, Inc.
 */

import { ServiceClientCredentials } from '@azure/ms-rest-js'
import {
  SubscriptionClient,
  SubscriptionModels,
} from '@azure/arm-subscriptions'
import { ApplicationTokenCredentials } from '@azure/ms-rest-nodeauth'
import { ConsumptionManagementClient } from '@azure/arm-consumption'

import {
  ComputeEstimator,
  StorageEstimator,
  NetworkingEstimator,
  MemoryEstimator,
  UnknownEstimator,
  CloudProviderAccount,
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

    const estimationResults = await Promise.all(
      subscriptions.map(
        async (subscription: SubscriptionModels.Subscription) => {
          const consumptionManagementService = new ConsumptionManagementService(
            new ComputeEstimator(),
            new StorageEstimator(AZURE_CLOUD_CONSTANTS.SSDCOEFFICIENT),
            new StorageEstimator(AZURE_CLOUD_CONSTANTS.HDDCOEFFICIENT),
            new NetworkingEstimator(
              AZURE_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT,
            ),
            new MemoryEstimator(AZURE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
            new UnknownEstimator(),
            new ConsumptionManagementClient(
              // eslint-disable-next-line
              // @ts-ignore: @azure/arm-consumption is using an older version of @azure/ms-rest-js, causing a type error.
              this.credentials,
              subscription.subscriptionId,
            ),
          )
          return consumptionManagementService.getEstimates(startDate, endDate)
        },
      ),
    )
    return estimationResults.flat()
  }
}
