/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { ServiceClientCredentials } from '@azure/ms-rest-js'
import {
  SubscriptionClient,
  SubscriptionModels,
} from '@azure/arm-subscriptions'
import { ApplicationTokenCredentials } from '@azure/ms-rest-nodeauth'
import { ConsumptionManagementClient } from '@azure/arm-consumption'

import CloudProviderAccount from './CloudProviderAccount'
import AzureCredentialsProvider from './AzureCredentialsProvider'
import { EstimationResult } from './EstimationResult'
import ConsumptionManagementService from '../services/azure/ConsumptionManagement'
import ComputeEstimator from '../domain/ComputeEstimator'
import { StorageEstimator } from '../domain/StorageEstimator'
import { CLOUD_CONSTANTS } from '../domain/FootprintEstimationConstants'
import NetworkingEstimator from '../domain/NetworkingEstimator'

export default class AzureAccount extends CloudProviderAccount {
  private credentials: ApplicationTokenCredentials | ServiceClientCredentials
  private subscriptionClient: SubscriptionClient

  constructor() {
    super()
  }

  public async initializeAccount(): Promise<void> {
    this.credentials = await AzureCredentialsProvider.create()
    this.subscriptionClient = new SubscriptionClient(this.credentials)
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
            new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT),
            new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT),
            new NetworkingEstimator(),
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
