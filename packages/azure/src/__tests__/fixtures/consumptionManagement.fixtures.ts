/*
 * © 2021 Thoughtworks, Inc.
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
  subscriptionGuid: string
  subscriptionName: string
  location: string
}

interface AzureUsageDetailsResponseWithNextLink
  extends Array<AzureUsageDetailsResponse> {
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
      usageStart: new Date('2020-11-02'),
      usageQuantity: 17,
      pretaxCost: 5,
      meterDetails: {
        meterName: 'D2 v2/DS2 v2',
        unit: '10 Hours',
        serviceName: 'Virtual Machines',
      },
      subscriptionGuid: 'test-subscription-id',
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
      subscriptionGuid: 'test-subscription-id',
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
      subscriptionGuid: 'test-subscription-id',
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
      subscriptionGuid: 'test-subscription-id',
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
      subscriptionGuid: 'test-subscription-id',
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
      subscriptionGuid: 'test-subscription-id',
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
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'Unknown',
    },
  ]

export const mockConsumptionManagementResponseTwo: AzureUsageDetailsResponse[] =
  [
    {
      usageStart: new Date('2020-11-02'),
      usageQuantity: 0.031248,
      pretaxCost: 5,
      meterDetails: {
        meterName: 'S10 Disks',
        unit: '1 /Month',
        serviceName: 'Storage',
      },
      subscriptionGuid: 'test-subscription-id',
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
      subscriptionGuid: 'test-subscription-id',
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
      subscriptionGuid: 'test-subscription-id',
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
      subscriptionGuid: 'test-subscription-id',
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
      subscriptionGuid: 'test-subscription-id',
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
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'EU West',
    },
    {
      usageStart: new Date('2020-11-02'),
      usageQuantity: 5,
      pretaxCost: 5,
      meterDetails: {
        meterName: 'S30 Disk',
        unit: '1 /Month',
        serviceName: 'HDInsight',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'UK South',
    },
    {
      usageStart: new Date('2020-11-02'),
      usageQuantity: 2,
      pretaxCost: 5,
      meterDetails: {
        meterName: 'Data Stored',
        unit: '1 TB/Month',
        serviceName: 'Azure Synapse Analytics',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'UK South',
    },
    {
      usageStart: new Date('2020-11-02'),
      usageQuantity: 10,
      pretaxCost: 5,
      meterDetails: {
        meterName: 'ZRS Snapshots',
        unit: '100 GB/Month',
        serviceName: 'Storage',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'IN Central',
    },
  ]

export const mockConsumptionManagementResponseThree: AzureUsageDetailsResponse[] =
  [
    {
      usageStart: new Date('2020-11-02'),
      usageQuantity: 10,
      pretaxCost: 5,
      meterDetails: {
        meterName: 'Geo-Replication Data transfer',
        unit: '1 GB',
        serviceName: 'Storage',
      },
      subscriptionGuid: 'test-subscription-id',
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
      subscriptionGuid: 'test-subscription-id',
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
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'UK South',
    },
  ]

export const mockConsumptionManagementResponseFour: AzureUsageDetailsResponse[] =
  [
    {
      usageStart: new Date('2020-11-03'),
      usageQuantity: 12,
      pretaxCost: 12,
      meterDetails: {
        meterName: 'Standard All-purpose Compute DBU',
        unit: '10 Hours',
        serviceName: 'Azure Databricks',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'Unknown',
    },
    {
      usageStart: new Date('2020-11-03'),
      usageQuantity: 12,
      pretaxCost: 12,
      meterDetails: {
        meterName: 'Developer Units',
        unit: '100 Hours',
        serviceName: 'API Management',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'UK South',
    },
    {
      usageStart: new Date('2020-11-03'),
      usageQuantity: 12,
      pretaxCost: 12,
      meterDetails: {
        meterName: '6 vCPU VM License',
        unit: '100 Hours',
        serviceName: 'Virtual Machines Licenses',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'UK South',
    },
    {
      usageStart: new Date('2020-11-03'),
      usageQuantity: 12,
      pretaxCost: 12,
      meterDetails: {
        meterName: 'Standard Node',
        unit: '1 /Month',
        serviceName: 'Advanced Data Security',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'UK South',
    },
  ]
export const mockConsumptionManagementResponseFive: AzureUsageDetailsResponse[] =
  [
    {
      usageStart: new Date('2021-11-03'),
      usageQuantity: 5,
      pretaxCost: 20,
      meterDetails: {
        meterName: 'D8 v3 Spot',
        unit: '1 Hour',
        serviceName: 'Virtual Machines',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'EU North',
    },
    {
      usageStart: new Date('2021-11-03'),
      usageQuantity: 48,
      pretaxCost: 5,
      meterDetails: {
        meterName: 'C1 Cache Instance',
        unit: '100 Hours',
        serviceName: 'Redis Cache',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'AP Southeast',
    },
    {
      usageStart: new Date('2021-11-02'),
      usageQuantity: 0.111375,
      pretaxCost: 10,
      meterDetails: {
        meterName: 'Execution Time',
        unit: '50000 GB Seconds',
        serviceName: 'Functions',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'US East 2',
    },
    {
      usageStart: new Date('2021-11-02'),
      usageQuantity: 14.44976379,
      pretaxCost: 7,
      meterDetails: {
        meterName: 'Memory Duration',
        unit: '1000 GB Hours',
        serviceName: 'Container Instances',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'UK West',
    },
  ]

export const mockConsumptionManagementResponseSix: AzureUsageDetailsResponse[] =
  [
    {
      usageStart: new Date('2021-11-03'),
      usageQuantity: 0.002654,
      pretaxCost: 20,
      meterDetails: {
        meterName: 'Hot LRS Data Stored',
        unit: '100 GB/Month',
        serviceName: 'Storage',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'US West',
    },
    {
      usageStart: new Date('2021-11-03'),
      usageQuantity: 0.012219,
      pretaxCost: 15,
      meterDetails: {
        meterName: 'Cool ZRS Data Stored',
        unit: '1 GB/Month',
        serviceName: 'Storage',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'US South Central',
    },
    {
      usageStart: new Date('2021-11-03'),
      usageQuantity: 0.000015,
      pretaxCost: 10,
      meterDetails: {
        meterName: 'RA-GRS Data Stored',
        unit: '100 GB/Month',
        serviceName: 'Storage',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'UK South',
    },
    {
      usageStart: new Date('2021-11-03'),
      usageQuantity: 0.027492,
      pretaxCost: 5,
      meterDetails: {
        meterName: 'Cool RA-GZRS Data Stored',
        unit: '1 GB/Month',
        serviceName: 'Storage',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'US West 2',
    },
    {
      usageStart: new Date('2021-11-04'),
      usageQuantity: 0.2973480663,
      pretaxCost: 2,
      meterDetails: {
        meterName: 'P10 Disks',
        unit: '1 /Month',
        serviceName: 'Storage',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'UK South',
    },
    {
      usageStart: new Date('2021-11-04'),
      usageQuantity: 123456789,
      pretaxCost: 2,
      meterDetails: {
        meterName: 'S4 Disks',
        unit: '1 /Month',
        serviceName: 'Storage',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'IN West',
    },
  ]

export const mockConsumptionManagementResponseSeven: AzureUsageDetailsResponse[] =
  [
    {
      usageStart: new Date('2021-11-03'),
      usageQuantity: 0.01344086022,
      pretaxCost: 20,
      meterDetails: {
        meterName: 'Data Stored',
        unit: '10 GB/Month',
        serviceName: 'Azure Database for MySQL',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'UK South',
    },
    {
      usageStart: new Date('2021-11-04'),
      usageQuantity: 12,
      pretaxCost: 30,
      meterDetails: {
        meterName: '2 vCore',
        unit: '100 Hours',
        serviceName: 'Azure Database for MySQL',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'UK South',
    },
    {
      usageStart: new Date('2021-11-04'),
      usageQuantity: 0.02150770413,
      pretaxCost: 35,
      meterDetails: {
        meterName: 'Data Stored',
        unit: '10 GB/Month',
        serviceName: 'Azure Cosmos DB',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'US Central',
    },
    {
      usageStart: new Date('2021-11-04'),
      usageQuantity: 0.006989247310827,
      pretaxCost: 40,
      meterDetails: {
        meterName: 'Data Stored',
        unit: '10 GB/Month',
        serviceName: 'SQL Database',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'UK South',
    },
    {
      usageStart: new Date('2021-11-03'),
      usageQuantity: 2,
      pretaxCost: 45,
      meterDetails: {
        meterName: 'vCore',
        unit: '10 Hours',
        serviceName: 'SQL Database',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'UK South',
    },
  ]

export const mockConsumptionManagementResponseEight: AzureUsageDetailsResponse[] =
  [
    {
      usageStart: new Date('2020-11-02'),
      usageQuantity: 5,
      pretaxCost: 5,
      meterDetails: {
        meterName: 'D8 v3',
        unit: '1 Hour',
        serviceName: 'Virtual Machines',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'EU North',
    },
    {
      usageStart: new Date('2020-11-02'),
      usageQuantity: 5,
      pretaxCost: 1.579140496,
      meterDetails: {
        meterName: 'Developer Units',
        unit: '100 Hours',
        serviceName: 'API Management',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'EU North',
    },
    {
      usageStart: new Date('2021-11-03'),
      usageQuantity: 0.02150770413,
      pretaxCost: 35,
      meterDetails: {
        meterName: 'Data Stored',
        unit: '10 GB/Month',
        serviceName: 'Azure Cosmos DB',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'EU North',
    },
    {
      usageStart: new Date('2021-11-03'),
      usageQuantity: 25,
      pretaxCost: 0.4835702479,
      meterDetails: {
        meterName: 'Standard Node',
        unit: '1 /Month',
        serviceName: 'Advanced Data Security',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'EU North',
    },
    {
      usageStart: new Date('2021-11-04'),
      usageQuantity: 10,
      pretaxCost: 5,
      meterDetails: {
        meterName: 'Geo-Replication Data transfer',
        unit: '1 GB',
        serviceName: 'Storage',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'EU North',
    },
    {
      usageStart: new Date('2021-11-04'),
      usageQuantity: 20,
      pretaxCost: 0.006280996057,
      meterDetails: {
        meterName: 'Data Processed',
        unit: '100 GB',
        serviceName: 'Load Balancer',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'EU North',
    },
    {
      usageStart: new Date('2021-11-05'),
      usageQuantity: 14.44976379,
      pretaxCost: 7,
      meterDetails: {
        meterName: 'Memory Duration',
        unit: '1000 GB Hours',
        serviceName: 'Container Instances',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'EU North',
    },
    {
      usageStart: new Date('2021-11-05'),
      usageQuantity: 32,
      pretaxCost: 18,
      meterDetails: {
        meterName: 'Memory Duration',
        unit: '50000 GB Seconds',
        serviceName: 'Azure Databricks',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'EU North',
    },
    {
      usageStart: new Date('2021-11-06'),
      usageQuantity: 20,
      pretaxCost: 0.003168316832,
      meterDetails: {
        meterName: 'Alerts Metrics Monitored',
        unit: '2',
        serviceName: 'Azure Monitor',
      },
      subscriptionGuid: 'test-subscription-id',
      subscriptionName: 'test-subscription',
      location: 'Unknown',
    },
  ]
