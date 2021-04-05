/*
 * © 2021 Thoughtworks, Inc. All rights reserved.
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

export const mockConsumptionManagementResponseTwo: AzureUsageDetailsResponse[] = [
  {
    usageStart: new Date('2020-11-02'),
    usageQuantity: 0.031248,
    pretaxCost: 5,
    meterDetails: {
      meterName: 'S10 Disks',
      unit: '1 /Month',
      serviceName: 'Storage',
    },
    subscriptionName: 'test-subscription',
    location: 'UK South',
  },
  {
    usageStart: new Date('2020-11-02'),
    usageQuantity: 0.031248,
    pretaxCost: 5,
    meterDetails: {
      meterName: 'P4 Disks',
      unit: '1 /Month',
      serviceName: 'Storage',
    },
    subscriptionName: 'test-subscription',
    location: 'UK South',
  },
  {
    usageStart: new Date('2020-11-02'),
    usageQuantity: 0.031248,
    pretaxCost: 5,
    meterDetails: {
      meterName: 'E1 Disks',
      unit: '100 /Month',
      serviceName: 'Storage',
    },
    subscriptionName: 'test-subscription',
    location: 'EU West',
  },
  {
    usageStart: new Date('2020-11-02'),
    usageQuantity: 2,
    pretaxCost: 5,
    meterDetails: {
      meterName: 'Data Stored',
      unit: '10 GB/Month',
      serviceName: 'Azure Database for MySQL',
    },
    subscriptionName: 'test-subscription',
    location: 'EU West',
  },
  {
    usageStart: new Date('2020-11-02'),
    usageQuantity: 2,
    pretaxCost: 5,
    meterDetails: {
      meterName: 'Basic Registry Unit',
      unit: '30 /Day',
      serviceName: 'Container Registry',
    },
    subscriptionName: 'test-subscription',
    location: 'EU West',
  },
  {
    usageStart: new Date('2020-11-02'),
    usageQuantity: 2,
    pretaxCost: 5,
    meterDetails: {
      meterName: 'Server - Free',
      unit: '1 /Month',
      serviceName: 'Storage',
    },
    subscriptionName: 'test-subscription',
    location: 'EU West',
  },
]

export const mockConsumptionManagementResponseThree: AzureUsageDetailsResponse[] = [
  {
    usageStart: new Date('2020-11-02'),
    usageQuantity: 10,
    pretaxCost: 5,
    meterDetails: {
      meterName: 'Geo-Replication Data transfer',
      unit: '1 GB',
      serviceName: 'Storage',
    },
    subscriptionName: 'test-subscription',
    location: 'UK South',
  },
  {
    usageStart: new Date('2020-11-02'),
    usageQuantity: 10,
    pretaxCost: 5,
    meterDetails: {
      meterName: 'Geo-Replication Data transfer',
      unit: '1 TB',
      serviceName: 'Bandwidth',
    },
    subscriptionName: 'test-subscription',
    location: 'UK South',
  },
  {
    usageStart: new Date('2020-11-02'),
    usageQuantity: 5,
    pretaxCost: 5,
    meterDetails: {
      meterName: 'Data Transfer Out - ASIA To Any',
      unit: '1 TB',
      serviceName: 'Bandwidth',
    },
    subscriptionName: 'test-subscription',
    location: 'UK South',
  },
]
