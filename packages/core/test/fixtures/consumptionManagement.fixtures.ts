/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

interface AzureUsageDetailsResponse {
  usageStart: Date
  usageQuantity: number
  pretaxCost: number
  meterDetails: {
    meterName: string
    unit: string
    serviceName: string
  }
  subscriptionName: string
  location: string
}

export const mockConsumptionManagementResponseOne: AzureUsageDetailsResponse[] = [
  {
    usageStart: new Date('2020-11-02'),
    usageQuantity: 17,
    pretaxCost: 5,
    meterDetails: {
      meterName: 'D2 v2/DS2 v2',
      unit: '10 Hours',
      serviceName: 'Virtual Machines',
    },
    subscriptionName: 'test-subscription',
    location: 'UK South',
  },
]
