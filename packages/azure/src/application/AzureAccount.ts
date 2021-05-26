/*
 * © 2021 ThoughtWorks, Inc.
 */

import { ServiceClientCredentials } from '@azure/ms-rest-js'
import {
  SubscriptionClient,
  SubscriptionModels,
} from '@azure/arm-subscriptions'
import { ApplicationTokenCredentials } from '@azure/ms-rest-nodeauth'
import { ConsumptionManagementClient } from '@azure/arm-consumption'

import {
  ConsumptionManagementService,
  ComputeEstimator,
  StorageEstimator,
  NetworkingEstimator,
  MemoryEstimator,
  CLOUD_CONSTANTS,
} from '@cloud-carbon-footprint/core'

import CloudProviderAccount from '@cloud-carbon-footprint/app/CloudProviderAccount'
import AzureCredentialsProvider from './AzureCredentialsProvider'
import { EstimationResult } from '@cloud-carbon-footprint/common'

export default class AzureAccount extends CloudProviderAccount {
  private credentials: ApplicationTokenCredentials | ServiceClientCredentials
  private subscriptionClient: SubscriptionClient

  constructor() {
    super()
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

    const estimationResults = await Promise.all(
      subscriptions.map(
        async (subscription: SubscriptionModels.Subscription) => {
          const consumptionManagementService = new ConsumptionManagementService(
            new ComputeEstimator(),
            new StorageEstimator(CLOUD_CONSTANTS.AZURE.SSDCOEFFICIENT),
            new StorageEstimator(CLOUD_CONSTANTS.AZURE.HDDCOEFFICIENT),
            new NetworkingEstimator(),
            new MemoryEstimator(CLOUD_CONSTANTS.AZURE.MEMORY_COEFFICIENT),
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
