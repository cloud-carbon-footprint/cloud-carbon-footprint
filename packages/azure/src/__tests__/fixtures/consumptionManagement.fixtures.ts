/*
 * © 2021 Thoughtworks, Inc.
 */

import { UsageDetailResult } from '../../lib/ConsumptionTypes'

interface IterableMockResponse {
  next(): Promise<IteratorResult<UsageDetailResult>>
  [Symbol.asyncIterator](): IterableMockResponse
}

const mockAsyncIterator = {
  // * = fancy generator function (https://javascript.info/generators)
  async *[Symbol.asyncIterator](mockResponse: UsageDetailResult[]) {
    for (const response of mockResponse) yield response
  },
}

export const mockIterableResponse = (
  mockResponse: UsageDetailResult[],
): IterableMockResponse => {
  return mockAsyncIterator[Symbol.asyncIterator](mockResponse)
}

export const mockConsumptionManagementResponseOne: UsageDetailResult[] = [
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-02'),
      quantity: 17,
      cost: 5,
      meterDetails: {
        meterName: 'D2 v2/DS2 v2',
        unitOfMeasure: '10 Hours',
        meterCategory: 'Virtual Machines',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-02'),
      quantity: 0.250004,
      cost: 10,
      meterDetails: {
        meterName: 'D4as v4 Spot',
        unitOfMeasure: '1 Hour',
        meterCategory: 'Virtual Machines',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'westeurope',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-02'),
      quantity: 7,
      cost: 10,
      meterDetails: {
        meterName: 'F1',
        unitOfMeasure: '1 Hour',
        meterCategory: 'Azure App Service',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'CentralUS',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-03'),
      quantity: 10,
      cost: 12,
      meterDetails: {
        meterName: 'vCPU Duration',
        unitOfMeasure: '1000 Hours',
        meterCategory: 'Container Instances',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'SouthCentralUS',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-03'),
      quantity: 12,
      cost: 12,
      meterDetails: {
        meterName: '2 vCore',
        unitOfMeasure: '100 Hours',
        meterCategory: 'Azure Database for MySQL',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'Unknown',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-03'),
      quantity: 12,
      cost: 12,
      meterDetails: {
        meterName: '1-2 vCPU VM Support',
        unitOfMeasure: '100 Hours',
        meterCategory: 'Virtual Machines Licenses',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'ukwest',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-03'),
      quantity: 12,
      cost: 12,
      meterDetails: {
        meterName: 'VpnGw1',
        unitOfMeasure: '100 Hours',
        meterCategory: 'VPN Gateway',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'Unknown',
      resourceGroup: 'test-resource-group',
    },
  },
]

export const mockConsumptionManagementResponseTwo: UsageDetailResult[] = [
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-02'),
      quantity: 0.031248,
      cost: 5,
      meterDetails: {
        meterName: 'S10 Disks',
        unitOfMeasure: '1 /Month',
        meterCategory: 'Storage',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-02'),
      quantity: 0.031248,
      cost: 5,
      meterDetails: {
        meterName: 'P4 Disks',
        unitOfMeasure: '1 /Month',
        meterCategory: 'Storage',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-02'),
      quantity: 0.031248,
      cost: 5,
      meterDetails: {
        meterName: 'E1 Disks',
        unitOfMeasure: '100 /Month',
        meterCategory: 'Storage',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'westeurope',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-02'),
      quantity: 2,
      cost: 5,
      meterDetails: {
        meterName: 'Data Stored',
        unitOfMeasure: '10 GB/Month',
        meterCategory: 'Azure Database for MySQL',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'westeurope',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-02'),
      quantity: 2,
      cost: 5,
      meterDetails: {
        meterName: 'Basic Registry Unit',
        unitOfMeasure: '30 /Day',
        meterCategory: 'Container Registry',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'westeurope',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-02'),
      quantity: 2,
      cost: 5,
      meterDetails: {
        meterName: 'Server - Free',
        unitOfMeasure: '1 /Month',
        meterCategory: 'Storage',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'westeurope',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-02'),
      quantity: 5,
      cost: 5,
      meterDetails: {
        meterName: 'S30 Disk',
        unitOfMeasure: '1 /Month',
        meterCategory: 'HDInsight',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-02'),
      quantity: 2,
      cost: 5,
      meterDetails: {
        meterName: 'Data Stored',
        unitOfMeasure: '1 TB/Month',
        meterCategory: 'Azure Synapse Analytics',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-02'),
      quantity: 10,
      cost: 5,
      meterDetails: {
        meterName: 'ZRS Snapshots',
        unitOfMeasure: '100 GB/Month',
        meterCategory: 'Storage',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'centralindia',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: '',
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-02'),
      quantity: 1,
      cost: 1,
      meterDetails: {
        meterName: 'P4 LRS Disk',
        unitOfMeasure: '1 /Month',
        meterCategory: 'Storage',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'Unknown',
    },
  },
]

export const mockConsumptionManagementResponseThree: UsageDetailResult[] = [
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-02'),
      quantity: 10,
      cost: 5,
      meterDetails: {
        meterName: 'Geo-Replication Data transfer',
        unitOfMeasure: '1 GB',
        meterCategory: 'Storage',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-02'),
      quantity: 10,
      cost: 5,
      meterDetails: {
        meterName: 'Geo-Replication Data transfer',
        unitOfMeasure: '1 TB',
        meterCategory: 'Bandwidth',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-02'),
      quantity: 5,
      cost: 5,
      meterDetails: {
        meterName: 'Data Transfer Out - ASIA To Any',
        unitOfMeasure: '1 TB',
        meterCategory: 'Bandwidth',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
      resourceGroup: 'test-resource-group',
    },
  },
]

export const mockConsumptionManagementResponseFour: UsageDetailResult[] = [
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-03'),
      quantity: 12,
      cost: 12,
      meterDetails: {
        meterName: 'Standard All-purpose Compute DBU',
        unitOfMeasure: '10 Hours',
        meterCategory: 'Azure Databricks',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'Unassigned',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-03'),
      quantity: 12,
      cost: 12,
      meterDetails: {
        meterName: 'Developer Units',
        unitOfMeasure: '100 Hours',
        meterCategory: 'API Management',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-03'),
      quantity: 12,
      cost: 12,
      meterDetails: {
        meterName: '6 vCPU VM License',
        unitOfMeasure: '100 Hours',
        meterCategory: 'Virtual Machines Licenses',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-03'),
      quantity: 12,
      cost: 12,
      meterDetails: {
        meterName: 'Standard Node',
        unitOfMeasure: '1 /Month',
        meterCategory: 'Advanced Data Security',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
      resourceGroup: 'test-resource-group',
    },
  },
]
export const mockConsumptionManagementResponseFive: UsageDetailResult[] = [
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-03'),
      quantity: 5,
      cost: 20,
      meterDetails: {
        meterName: 'D8 v3 Spot',
        unitOfMeasure: '1 Hour',
        meterCategory: 'Virtual Machines',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'northeurope',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-03'),
      quantity: 48,
      cost: 5,
      meterDetails: {
        meterName: 'C1 Cache Instance',
        unitOfMeasure: '100 Hours',
        meterCategory: 'Redis Cache',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'apsoutheast',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-02'),
      quantity: 0.111375,
      cost: 10,
      meterDetails: {
        meterName: 'Execution Time',
        unitOfMeasure: '50000 GB Seconds',
        meterCategory: 'Functions',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'EastUS2',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-02'),
      quantity: 14.44976379,
      cost: 7,
      meterDetails: {
        meterName: 'Memory Duration',
        unitOfMeasure: '1000 GB Hours',
        meterCategory: 'Container Instances',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'ukwest',
      resourceGroup: 'test-resource-group',
    },
  },
]

export const mockConsumptionManagementResponseSix: UsageDetailResult[] = [
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-03'),
      quantity: 0.002654,
      cost: 20,
      meterDetails: {
        meterName: 'Hot LRS Data Stored',
        unitOfMeasure: '100 GB/Month',
        meterCategory: 'Storage',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'WestUS',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-03'),
      quantity: 0.012219,
      cost: 15,
      meterDetails: {
        meterName: 'Cool ZRS Data Stored',
        unitOfMeasure: '1 GB/Month',
        meterCategory: 'Storage',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'SouthCentralUS',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-03'),
      quantity: 0.000015,
      cost: 10,
      meterDetails: {
        meterName: 'RA-GRS Data Stored',
        unitOfMeasure: '100 GB/Month',
        meterCategory: 'Storage',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-03'),
      quantity: 0.027492,
      cost: 5,
      meterDetails: {
        meterName: 'Cool RA-GZRS Data Stored',
        unitOfMeasure: '1 GB/Month',
        meterCategory: 'Storage',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'uswest2',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-04'),
      quantity: 0.2973480663,
      cost: 2,
      meterDetails: {
        meterName: 'P10 Disks',
        unitOfMeasure: '1 /Month',
        meterCategory: 'Storage',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-04'),
      quantity: 123456789,
      cost: 2,
      meterDetails: {
        meterName: 'S4 Disks',
        unitOfMeasure: '1 /Month',
        meterCategory: 'Storage',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'westindia',
      resourceGroup: 'test-resource-group',
    },
  },
]

export const mockConsumptionManagementResponseSeven: UsageDetailResult[] = [
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-03'),
      quantity: 0.01344086022,
      cost: 20,
      meterDetails: {
        meterName: 'Data Stored',
        unitOfMeasure: '10 GB/Month',
        meterCategory: 'Azure Database for MySQL',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-04'),
      quantity: 12,
      cost: 30,
      meterDetails: {
        meterName: '2 vCore',
        unitOfMeasure: '100 Hours',
        meterCategory: 'Azure Database for MySQL',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-04'),
      quantity: 0.02150770413,
      cost: 35,
      meterDetails: {
        meterName: 'Data Stored',
        unitOfMeasure: '10 GB/Month',
        meterCategory: 'Azure Cosmos DB',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'CentralUS',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-04'),
      quantity: 0.006989247310827,
      cost: 40,
      meterDetails: {
        meterName: 'Data Stored',
        unitOfMeasure: '10 GB/Month',
        meterCategory: 'SQL Database',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-03'),
      quantity: 2,
      cost: 45,
      meterDetails: {
        meterName: 'vCore',
        unitOfMeasure: '10 Hours',
        meterCategory: 'SQL Database',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
      resourceGroup: 'test-resource-group',
    },
  },
]

export const mockConsumptionManagementResponseEight: UsageDetailResult[] = [
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-02'),
      quantity: 5,
      cost: 5,
      meterDetails: {
        meterName: 'D8 v3',
        unitOfMeasure: '1 Hour',
        meterCategory: 'Virtual Machines',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'northeurope',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-02'),
      quantity: 5,
      cost: 1.579140496,
      meterDetails: {
        meterName: 'Developer Units',
        unitOfMeasure: '100 Hours',
        meterCategory: 'API Management',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'northeurope',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-03'),
      quantity: 0.02150770413,
      cost: 35,
      meterDetails: {
        meterName: 'Data Stored',
        unitOfMeasure: '10 GB/Month',
        meterCategory: 'Azure Cosmos DB',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'northeurope',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-03'),
      quantity: 25,
      cost: 0.4835702479,
      meterDetails: {
        meterName: 'Standard Node',
        unitOfMeasure: '1 /Month',
        meterCategory: 'Advanced Data Security',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'northeurope',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-04'),
      quantity: 10,
      cost: 5,
      meterDetails: {
        meterName: 'Geo-Replication Data transfer',
        unitOfMeasure: '1 GB',
        meterCategory: 'Storage',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'northeurope',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-04'),
      quantity: 20,
      cost: 0.006280996057,
      meterDetails: {
        meterName: 'Data Processed',
        unitOfMeasure: '100 GB',
        meterCategory: 'Load Balancer',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'northeurope',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-05'),
      quantity: 14.44976379,
      cost: 7,
      meterDetails: {
        meterName: 'Memory Duration',
        unitOfMeasure: '1000 GB Hours',
        meterCategory: 'Container Instances',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'northeurope',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-05'),
      quantity: 32,
      cost: 18,
      meterDetails: {
        meterName: 'Memory Duration',
        unitOfMeasure: '50000 GB Seconds',
        meterCategory: 'Azure Databricks',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'northeurope',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-06'),
      quantity: 20,
      cost: 0.003168316832,
      meterDetails: {
        meterName: 'Private Zones',
        unitOfMeasure: '2',
        meterCategory: 'Azure DNS',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'All Regions',
      resourceGroup: 'test-resource-group',
    },
  },
]

export const mockConsumptionManagementResponseNine: UsageDetailResult[] = [
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-02'),
      quantity: 5,
      cost: 10,
      meterDetails: {
        meterName: 'D8 v3',
        unitOfMeasure: '1 Hour',
        meterCategory: 'Virtual Machines',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'northeurope',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-02'),
      quantity: 0.250004,
      cost: 15,
      meterDetails: {
        meterName: 'DS11-1 v2',
        unitOfMeasure: '1 Hour',
        meterCategory: 'Virtual Machines',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'westeurope',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-02'),
      quantity: 17,
      cost: 5,
      meterDetails: {
        meterName: 'D2 v2',
        unitOfMeasure: '10 Hour',
        meterCategory: 'Virtual Machines',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'modern',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'modern',
      date: new Date('2020-11-02'),
      quantity: 17,
      costInUSD: 5,
      meterName: 'D2 v2',
      unitOfMeasure: '10 Hour',
      meterCategory: 'Virtual Machines',
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'EASTUS',
      resourceGroup: 'test-resource-group',
    },
  },
]

export const mockConsumptionManagementResponseTen: UsageDetailResult[] = [
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-01'),
      quantity: 5,
      cost: 10,
      meterDetails: {
        meterName: 'D8 v3',
        unitOfMeasure: '1 Hour',
        meterCategory: 'Virtual Machines',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'northeurope',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-07'),
      quantity: 0.250004,
      cost: 15,
      meterDetails: {
        meterName: 'DS11-1 v2',
        unitOfMeasure: '1 Hour',
        meterCategory: 'Virtual Machines',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'westeurope',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-08'),
      quantity: 17,
      cost: 5,
      meterDetails: {
        meterName: 'D2 v2',
        unitOfMeasure: '10 Hour',
        meterCategory: 'Virtual Machines',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
      resourceGroup: 'test-resource-group',
    },
  },
]

export const mockConsumptionManagementResponseEleven: UsageDetailResult[] = [
  {
    id: 'test-subscription-id',
    kind: 'legacy',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'legacy',
      date: new Date('2020-11-02'),
      quantity: 1,
      cost: 10,
      meterDetails: {
        meterName: 'NC24',
        unitOfMeasure: '10 Hours',
        meterCategory: 'Virtual Machines',
      },
      subscriptionName: 'test-subscription',
      resourceLocation: 'northeurope',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'modern',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'modern',
      date: new Date('2020-11-03'),
      quantity: 1,
      costInUSD: 10,
      meterName: 'NC24',
      unitOfMeasure: '10 Hours',
      meterCategory: 'Virtual Machines',
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'EASTUS',
      resourceGroup: 'test-resource-group',
    },
  },
  {
    id: 'test-subscription-id',
    kind: 'modern',
    name: 'name',
    type: 'type',
    tags: {},
    properties: {
      kind: 'modern',
      date: new Date('2020-11-03'),
      quantity: 1,
      costInUSD: 10,
      meterName: 'ND96asr A100 v4',
      unitOfMeasure: '10 Hours',
      meterCategory: 'Virtual Machines',
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'WESTEUROPE',
      resourceGroup: 'test-resource-group',
    },
  },
]
