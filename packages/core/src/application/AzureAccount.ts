/*
 * © 2021 ThoughtWorks, Inc.
 */

import { ServiceClientCredentials } from '@azure/ms-rest-js'
import { SubscriptionClient } from '@azure/arm-subscriptions'
import { ApplicationTokenCredentials } from '@azure/ms-rest-nodeauth'
import { ConsumptionManagementClient } from '@azure/arm-consumption'

import CloudProviderAccount from './CloudProviderAccount'
import AzureCredentialsProvider from './AzureCredentialsProvider'
import { EstimationResult } from './EstimationResult'
import configLoader from './ConfigLoader'
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
    const requestBuffer = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const estimationResults: any[] = []
    const rateLimit = parseInt(configLoader().AZURE?.RATE_LIMIT)
    const subscriptionRate = subscriptions.length / rateLimit
    for (let i = 0; i < rateLimit; i++) {
      for (let j = 0; j < Math.ceil(subscriptionRate); j++) {
        if (!subscriptions[j]) break
        const consumptionManagementService = new ConsumptionManagementService(
          new ComputeEstimator(),
          new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT),
          new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT),
          new NetworkingEstimator(),
          new ConsumptionManagementClient(
            // eslint-disable-next-line
            // @ts-ignore: @azure/arm-consumption is using an older version of @azure/ms-rest-js, causing a type error.
            this.credentials,
            subscriptions[j].subscriptionId,
          ),
        )
        requestBuffer.push(
          consumptionManagementService.getEstimates(startDate, endDate),
        )
      }
      await Promise.all(requestBuffer).then((data): void => {
        estimationResults.push(...data)
      })
      requestBuffer.splice(0, requestBuffer.length)
    }
    return estimationResults.flat()
  }
}
