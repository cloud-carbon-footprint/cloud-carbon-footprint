/*
 * © 2021 Thoughtworks, Inc.
 */

import { LegacyUsageDetail } from '@azure/arm-consumption/esm/models'

interface AzureUsageDetailsResponseWithNextLink
  extends Array<Partial<LegacyUsageDetail>> {
  /**
   * @member {string} [nextLink] The link (url) to the next page of results.
   * **NOTE: This property will not be serialized. It can only be populated by
   * the server.**
   */
  nextLink?: string
}

export const mockConsumptionManagementResponseOne: AzureUsageDetailsResponseWithNextLink =
  [
    {
      date: new Date('2020-11-02'),
      quantity: 17,
      cost: 5,
      meterDetails: {
        meterName: 'D2 v2/DS2 v2',
        unitOfMeasure: '10 Hours',
        meterCategory: 'Virtual Machines',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
    },
    {
      date: new Date('2020-11-02'),
      quantity: 0.250004,
      cost: 10,
      meterDetails: {
        meterName: 'D4as v4 Spot',
        unitOfMeasure: '1 Hour',
        meterCategory: 'Virtual Machines',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'westeurope',
    },
    {
      date: new Date('2020-11-02'),
      quantity: 7,
      cost: 10,
      meterDetails: {
        meterName: 'F1',
        unitOfMeasure: '1 Hour',
        meterCategory: 'Azure App Service',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'CentralUS',
    },
    {
      date: new Date('2020-11-03'),
      quantity: 10,
      cost: 12,
      meterDetails: {
        meterName: 'vCPU Duration',
        unitOfMeasure: '1000 Hours',
        meterCategory: 'Container Instances',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'SouthCentralUS',
    },
    {
      date: new Date('2020-11-03'),
      quantity: 12,
      cost: 12,
      meterDetails: {
        meterName: '2 vCore',
        unitOfMeasure: '100 Hours',
        meterCategory: 'Azure Database for MySQL',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'Unknown',
    },
    {
      date: new Date('2020-11-03'),
      quantity: 12,
      cost: 12,
      meterDetails: {
        meterName: '1-2 vCPU VM Support',
        unitOfMeasure: '100 Hours',
        meterCategory: 'Virtual Machines Licenses',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'ukwest',
    },
    {
      date: new Date('2020-11-03'),
      quantity: 12,
      cost: 12,
      meterDetails: {
        meterName: 'VpnGw1',
        unitOfMeasure: '100 Hours',
        meterCategory: 'VPN Gateway',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'Unknown',
    },
  ]

export const mockConsumptionManagementResponseTwo: Partial<LegacyUsageDetail>[] =
  [
    {
      date: new Date('2020-11-02'),
      quantity: 0.031248,
      cost: 5,
      meterDetails: {
        meterName: 'S10 Disks',
        unitOfMeasure: '1 /Month',
        meterCategory: 'Storage',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
    },
    {
      date: new Date('2020-11-02'),
      quantity: 0.031248,
      cost: 5,
      meterDetails: {
        meterName: 'P4 Disks',
        unitOfMeasure: '1 /Month',
        meterCategory: 'Storage',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
    },
    {
      date: new Date('2020-11-02'),
      quantity: 0.031248,
      cost: 5,
      meterDetails: {
        meterName: 'E1 Disks',
        unitOfMeasure: '100 /Month',
        meterCategory: 'Storage',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'westeurope',
    },
    {
      date: new Date('2020-11-02'),
      quantity: 2,
      cost: 5,
      meterDetails: {
        meterName: 'Data Stored',
        unitOfMeasure: '10 GB/Month',
        meterCategory: 'Azure Database for MySQL',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'westeurope',
    },
    {
      date: new Date('2020-11-02'),
      quantity: 2,
      cost: 5,
      meterDetails: {
        meterName: 'Basic Registry Unit',
        unitOfMeasure: '30 /Day',
        meterCategory: 'Container Registry',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'westeurope',
    },
    {
      date: new Date('2020-11-02'),
      quantity: 2,
      cost: 5,
      meterDetails: {
        meterName: 'Server - Free',
        unitOfMeasure: '1 /Month',
        meterCategory: 'Storage',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'westeurope',
    },
    {
      date: new Date('2020-11-02'),
      quantity: 5,
      cost: 5,
      meterDetails: {
        meterName: 'S30 Disk',
        unitOfMeasure: '1 /Month',
        meterCategory: 'HDInsight',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
    },
    {
      date: new Date('2020-11-02'),
      quantity: 2,
      cost: 5,
      meterDetails: {
        meterName: 'Data Stored',
        unitOfMeasure: '1 TB/Month',
        meterCategory: 'Azure Synapse Analytics',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
    },
    {
      date: new Date('2020-11-02'),
      quantity: 10,
      cost: 5,
      meterDetails: {
        meterName: 'ZRS Snapshots',
        unitOfMeasure: '100 GB/Month',
        meterCategory: 'Storage',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'centralindia',
    },
  ]

export const mockConsumptionManagementResponseThree: Partial<LegacyUsageDetail>[] =
  [
    {
      date: new Date('2020-11-02'),
      quantity: 10,
      cost: 5,
      meterDetails: {
        meterName: 'Geo-Replication Data transfer',
        unitOfMeasure: '1 GB',
        meterCategory: 'Storage',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
    },
    {
      date: new Date('2020-11-02'),
      quantity: 10,
      cost: 5,
      meterDetails: {
        meterName: 'Geo-Replication Data transfer',
        unitOfMeasure: '1 TB',
        meterCategory: 'Bandwidth',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
    },
    {
      date: new Date('2020-11-02'),
      quantity: 5,
      cost: 5,
      meterDetails: {
        meterName: 'Data Transfer Out - ASIA To Any',
        unitOfMeasure: '1 TB',
        meterCategory: 'Bandwidth',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
    },
  ]

export const mockConsumptionManagementResponseFour: Partial<LegacyUsageDetail>[] =
  [
    {
      date: new Date('2020-11-03'),
      quantity: 12,
      cost: 12,
      meterDetails: {
        meterName: 'Standard All-purpose Compute DBU',
        unitOfMeasure: '10 Hours',
        meterCategory: 'Azure Databricks',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'Unassigned',
    },
    {
      date: new Date('2020-11-03'),
      quantity: 12,
      cost: 12,
      meterDetails: {
        meterName: 'Developer Units',
        unitOfMeasure: '100 Hours',
        meterCategory: 'API Management',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
    },
    {
      date: new Date('2020-11-03'),
      quantity: 12,
      cost: 12,
      meterDetails: {
        meterName: '6 vCPU VM License',
        unitOfMeasure: '100 Hours',
        meterCategory: 'Virtual Machines Licenses',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
    },
    {
      date: new Date('2020-11-03'),
      quantity: 12,
      cost: 12,
      meterDetails: {
        meterName: 'Standard Node',
        unitOfMeasure: '1 /Month',
        meterCategory: 'Advanced Data Security',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
    },
  ]
export const mockConsumptionManagementResponseFive: Partial<LegacyUsageDetail>[] =
  [
    {
      date: new Date('2021-11-03'),
      quantity: 5,
      cost: 20,
      meterDetails: {
        meterName: 'D8 v3 Spot',
        unitOfMeasure: '1 Hour',
        meterCategory: 'Virtual Machines',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'northeurope',
    },
    {
      date: new Date('2021-11-03'),
      quantity: 48,
      cost: 5,
      meterDetails: {
        meterName: 'C1 Cache Instance',
        unitOfMeasure: '100 Hours',
        meterCategory: 'Redis Cache',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'apsoutheast',
    },
    {
      date: new Date('2021-11-02'),
      quantity: 0.111375,
      cost: 10,
      meterDetails: {
        meterName: 'Execution Time',
        unitOfMeasure: '50000 GB Seconds',
        meterCategory: 'Functions',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'EastUS2',
    },
    {
      date: new Date('2021-11-02'),
      quantity: 14.44976379,
      cost: 7,
      meterDetails: {
        meterName: 'Memory Duration',
        unitOfMeasure: '1000 GB Hours',
        meterCategory: 'Container Instances',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'ukwest',
    },
  ]

export const mockConsumptionManagementResponseSix: Partial<LegacyUsageDetail>[] =
  [
    {
      date: new Date('2021-11-03'),
      quantity: 0.002654,
      cost: 20,
      meterDetails: {
        meterName: 'Hot LRS Data Stored',
        unitOfMeasure: '100 GB/Month',
        meterCategory: 'Storage',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'WestUS',
    },
    {
      date: new Date('2021-11-03'),
      quantity: 0.012219,
      cost: 15,
      meterDetails: {
        meterName: 'Cool ZRS Data Stored',
        unitOfMeasure: '1 GB/Month',
        meterCategory: 'Storage',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'SouthCentralUS',
    },
    {
      date: new Date('2021-11-03'),
      quantity: 0.000015,
      cost: 10,
      meterDetails: {
        meterName: 'RA-GRS Data Stored',
        unitOfMeasure: '100 GB/Month',
        meterCategory: 'Storage',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
    },
    {
      date: new Date('2021-11-03'),
      quantity: 0.027492,
      cost: 5,
      meterDetails: {
        meterName: 'Cool RA-GZRS Data Stored',
        unitOfMeasure: '1 GB/Month',
        meterCategory: 'Storage',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'uswest2',
    },
    {
      date: new Date('2021-11-04'),
      quantity: 0.2973480663,
      cost: 2,
      meterDetails: {
        meterName: 'P10 Disks',
        unitOfMeasure: '1 /Month',
        meterCategory: 'Storage',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
    },
    {
      date: new Date('2021-11-04'),
      quantity: 123456789,
      cost: 2,
      meterDetails: {
        meterName: 'S4 Disks',
        unitOfMeasure: '1 /Month',
        meterCategory: 'Storage',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'westindia',
    },
  ]

export const mockConsumptionManagementResponseSeven: Partial<LegacyUsageDetail>[] =
  [
    {
      date: new Date('2021-11-03'),
      quantity: 0.01344086022,
      cost: 20,
      meterDetails: {
        meterName: 'Data Stored',
        unitOfMeasure: '10 GB/Month',
        meterCategory: 'Azure Database for MySQL',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
    },
    {
      date: new Date('2021-11-04'),
      quantity: 12,
      cost: 30,
      meterDetails: {
        meterName: '2 vCore',
        unitOfMeasure: '100 Hours',
        meterCategory: 'Azure Database for MySQL',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
    },
    {
      date: new Date('2021-11-04'),
      quantity: 0.02150770413,
      cost: 35,
      meterDetails: {
        meterName: 'Data Stored',
        unitOfMeasure: '10 GB/Month',
        meterCategory: 'Azure Cosmos DB',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'CentralUS',
    },
    {
      date: new Date('2021-11-04'),
      quantity: 0.006989247310827,
      cost: 40,
      meterDetails: {
        meterName: 'Data Stored',
        unitOfMeasure: '10 GB/Month',
        meterCategory: 'SQL Database',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
    },
    {
      date: new Date('2021-11-03'),
      quantity: 2,
      cost: 45,
      meterDetails: {
        meterName: 'vCore',
        unitOfMeasure: '10 Hours',
        meterCategory: 'SQL Database',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'uksouth',
    },
  ]

export const mockConsumptionManagementResponseEight: Partial<LegacyUsageDetail>[] =
  [
    {
      date: new Date('2020-11-02'),
      quantity: 5,
      cost: 5,
      meterDetails: {
        meterName: 'D8 v3',
        unitOfMeasure: '1 Hour',
        meterCategory: 'Virtual Machines',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'northeurope',
    },
    {
      date: new Date('2020-11-02'),
      quantity: 5,
      cost: 1.579140496,
      meterDetails: {
        meterName: 'Developer Units',
        unitOfMeasure: '100 Hours',
        meterCategory: 'API Management',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'northeurope',
    },
    {
      date: new Date('2021-11-03'),
      quantity: 0.02150770413,
      cost: 35,
      meterDetails: {
        meterName: 'Data Stored',
        unitOfMeasure: '10 GB/Month',
        meterCategory: 'Azure Cosmos DB',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'northeurope',
    },
    {
      date: new Date('2021-11-03'),
      quantity: 25,
      cost: 0.4835702479,
      meterDetails: {
        meterName: 'Standard Node',
        unitOfMeasure: '1 /Month',
        meterCategory: 'Advanced Data Security',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'northeurope',
    },
    {
      date: new Date('2021-11-04'),
      quantity: 10,
      cost: 5,
      meterDetails: {
        meterName: 'Geo-Replication Data transfer',
        unitOfMeasure: '1 GB',
        meterCategory: 'Storage',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'northeurope',
    },
    {
      date: new Date('2021-11-04'),
      quantity: 20,
      cost: 0.006280996057,
      meterDetails: {
        meterName: 'Data Processed',
        unitOfMeasure: '100 GB',
        meterCategory: 'Load Balancer',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'northeurope',
    },
    {
      date: new Date('2021-11-05'),
      quantity: 14.44976379,
      cost: 7,
      meterDetails: {
        meterName: 'Memory Duration',
        unitOfMeasure: '1000 GB Hours',
        meterCategory: 'Container Instances',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'northeurope',
    },
    {
      date: new Date('2021-11-05'),
      quantity: 32,
      cost: 18,
      meterDetails: {
        meterName: 'Memory Duration',
        unitOfMeasure: '50000 GB Seconds',
        meterCategory: 'Azure Databricks',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'northeurope',
    },
    {
      date: new Date('2021-11-06'),
      quantity: 20,
      cost: 0.003168316832,
      meterDetails: {
        meterName: 'Private Zones',
        unitOfMeasure: '2',
        meterCategory: 'Azure DNS',
      },
      subscriptionId: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      resourceLocation: 'All Regions',
    },
  ]
