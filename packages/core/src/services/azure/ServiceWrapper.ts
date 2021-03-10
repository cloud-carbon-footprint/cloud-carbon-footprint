/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { SubscriptionClient } from '@azure/arm-subscriptions'
import {
  ConsumptionManagementClient,
  ConsumptionManagementModels as Models,
} from '@azure/arm-consumption'

export default class ServiceWrapper {
  constructor(
    private readonly subscriptionClient: SubscriptionClient,
    private readonly consumptionManagementClient: ConsumptionManagementClient,
  ) {}

  public async getConsumptionManagementResults(
    options: Models.UsageDetailsListOptionalParams,
  ): Promise<Models.UsageDetailsListResponse> {
    return await this.consumptionManagementClient.usageDetails.list(options)
  }
}
