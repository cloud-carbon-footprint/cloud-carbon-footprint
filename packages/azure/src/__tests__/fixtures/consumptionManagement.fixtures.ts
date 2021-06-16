/*
 * © 2021 ThoughtWorks, Inc.
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
    {
      usageStart: new Date('2020-11-02'),
      usageQuantity: 5,
      pretaxCost: 5,
      meterDetails: {
        meterName: 'S30 Disk',
        unit: '1 /Month',
        serviceName: 'HDInsight',
      },
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
      subscriptionName: 'test-subscription',
      location: 'US West 2',
    },
    {
      usageStart: new Date('2021-11-04'),
      usageQuantity: 0.2973480663,
      pretaxCost: 2,
      meterDetails: {
        meterName: 'P10 Disks',
        unit: '100 GB/Month',
        serviceName: 'Storage',
      },
      subscriptionName: 'test-subscription',
      location: 'UK South',
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
      subscriptionName: 'test-subscription',
      location: 'UK South',
    },
  ]
