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
  {
    usageStart: new Date('2020-11-02'),
    usageQuantity: 0.250004,
    pretaxCost: 10,
    meterDetails: {
      meterName: 'D4as v4 Spot',
      unit: '1 Hour',
      serviceName: 'Virtual Machines',
    },
    subscriptionName: 'test-subscription',
    location: 'EU West',
  },
  {
    usageStart: new Date('2020-11-02'),
    usageQuantity: 7,
    pretaxCost: 10,
    meterDetails: {
      meterName: 'F1',
      unit: '1 Hour',
      serviceName: 'Azure App Service',
    },
    subscriptionName: 'test-subscription',
    location: 'US Central',
  },
  {
    usageStart: new Date('2020-11-03'),
    usageQuantity: 10,
    pretaxCost: 12,
    meterDetails: {
      meterName: 'vCPU Duration',
      unit: '1000 Hours',
      serviceName: 'Container Instances',
    },
    subscriptionName: 'test-subscription',
    location: 'US South Central',
  },
  {
    usageStart: new Date('2020-11-03'),
    usageQuantity: 12,
    pretaxCost: 12,
    meterDetails: {
      meterName: '2 vCore',
      unit: '100 Hours',
      serviceName: 'Azure Database for MySQL',
    },
    subscriptionName: 'test-subscription',
    location: 'Unknown',
  },
  {
    usageStart: new Date('2020-11-03'),
    usageQuantity: 12,
    pretaxCost: 12,
    meterDetails: {
      meterName: '1-2 vCPU VM Support',
      unit: '100 Hours',
      serviceName: 'Virtual Machines Licenses',
    },
    subscriptionName: 'test-subscription',
    location: 'UK West',
  },
  {
    usageStart: new Date('2020-11-03'),
    usageQuantity: 12,
    pretaxCost: 12,
    meterDetails: {
      meterName: 'VpnGw1',
      unit: '100 Hours',
      serviceName: 'VPN Gateway',
    },
    subscriptionName: 'test-subscription',
    location: 'Unknown',
  },
]
