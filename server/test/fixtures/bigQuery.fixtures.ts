/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { BigQueryDate } from '@google-cloud/bigquery'

const bigQueryDateOne: BigQueryDate = { value: '2020-11-02' }
const bigQueryDateTwo: BigQueryDate = { value: '2020-10-28' }

export const mockQueryResultsAppEngineSSDStorageRAM: any[][] = [
  [
    {
      timestamp: bigQueryDateOne,
      accountName: 'test-account',
      region: 'us-east1',
      serviceName: 'App Engine',
      usageType: 'Cloud Datastore Storage',
      usageUnit: 'byte-seconds',
      vCpus: null as string | null,
      usageAmount: 2.83e16,
      cost: 5,
    },
    {
      timestamp: bigQueryDateOne,
      accountName: 'test-account',
      region: 'us-east1',
      serviceName: 'App Engine',
      usageType: 'Flex Instance RAM',
      usageUnit: 'byte-seconds',
      vCpus: null as string | null,
      usageAmount: 3.91e18,
      cost: 10,
    },
    {
      timestamp: bigQueryDateOne,
      accountName: 'test-account',
      region: 'us-east1',
      serviceName: 'App Engine',
      usageType: 'GCS Storage',
      usageUnit: 'byte-seconds',
      vCpus: null as string | null,
      usageAmount: 380040914534400,
      cost: 10,
    },
  ],
]

export const mockQueryResultsCloudSQLSSDComputeEngineDataFlowHDD: any[][] = [
  [
    {
      timestamp: bigQueryDateOne,
      accountName: 'test-account',
      region: 'us-east1',
      serviceName: 'Cloud SQL',
      usageType: 'Storage PD SSD for DB in Americas',
      usageUnit: 'byte-seconds',
      vCpus: null as string | null,
      usageAmount: 4.26e18,
      cost: 7,
    },
    {
      timestamp: bigQueryDateOne,
      accountName: 'test-account',
      region: 'us-east1',
      serviceName: 'Compute Engine',
      usageType: 'Compute optimized Core running in Americas',
      usageUnit: 'seconds',
      vCpus: '16',
      usageAmount: 80000,
      cost: 7,
    },
    {
      timestamp: bigQueryDateTwo,
      accountName: 'test-account',
      region: 'us-west1',
      serviceName: 'Cloud Dataflow',
      usageType: 'Local Disk Time PD Standard Belgium',
      usageUnit: 'byte-seconds',
      vCpus: null,
      usageAmount: 7.8e17,
      cost: 12,
    },
    {
      timestamp: bigQueryDateTwo,
      accountName: 'test-account',
      region: 'us-west1',
      serviceName: 'Cloud Functions',
      usageType: 'Memory Time',
      usageUnit: 'byte-seconds',
      vCpus: null,
      usageAmount: 120,
      cost: 10,
    },
  ],
]

export const mockQueryResultsComputeEngineRamAndUnknownUsages: any[][] = [
  [
    {
      timestamp: bigQueryDateTwo,
      accountName: 'test-account',
      region: 'us-west1',
      serviceName: 'Compute engine',
      usageType: 'Commitment v1: Ram in EMEA for 1 Year',
      usageUnit: 'byte-seconds',
      vCpus: null,
      usageAmount: 120,
      cost: 10,
    },
    {
      timestamp: bigQueryDateTwo,
      accountName: 'test-account',
      region: 'us-west1',
      serviceName: 'Bitnami Elasticsearch Certified by Bitnami',
      usageType: 'Licensing Fee for Bitnami Elasticsearch',
      usageUnit: 'seconds',
      vCpus: '1',
      usageAmount: 25438523,
      cost: 10,
    },
    {
      timestamp: bigQueryDateTwo,
      accountName: 'test-account',
      region: 'us-west1',
      serviceName: 'Cloud DNS',
      usageType: 'ManagedZone',
      usageUnit: 'seconds',
      vCpus: null,
      usageAmount: 1010797200,
      cost: 10,
    },
    {
      timestamp: bigQueryDateTwo,
      accountName: 'test-account',
      region: 'us-west1',
      serviceName: 'Cloud Key Management Service (KMS)',
      usageType: 'Active software symmetric key versions',
      usageUnit: 'seconds',
      vCpus: null,
      usageAmount: 41330372438,
      cost: 10,
    },
    {
      timestamp: bigQueryDateTwo,
      accountName: 'test-account',
      region: 'us-west1',
      serviceName: 'Cloud Machine Learning Engine',
      usageType: 'Online Prediction Node-Hours (US) for mls1-c1-m2.',
      usageUnit: 'seconds',
      vCpus: null,
      usageAmount: 14551,
      cost: 10,
    },
  ],
]

export const mockQueryResultsNetworkingAndCloudSQLCompute: any[][] = [
  [
    {
      timestamp: bigQueryDateTwo,
      accountName: 'test-account',
      region: 'us-west1',
      serviceName: 'Cloud SQL',
      usageType: 'Cloud SQL for PostgreSQL: Zonal - IP address reservation in Americas',
      usageUnit: 'seconds',
      vCpus: null,
      usageAmount: 14551,
      cost: 10,
    },
    {
      timestamp: bigQueryDateTwo,
      accountName: 'test-account',
      region: 'us-west1',
      serviceName: 'Cloud SQL',
      usageType: 'IP address idling in seconds for DB in Americas',
      usageUnit: 'seconds',
      vCpus: null,
      usageAmount: 18198540,
      cost: 10,
    },
    {
      timestamp: bigQueryDateTwo,
      accountName: 'test-account',
      region: 'us-east1',
      serviceName: 'Cloud SQL',
      usageType: 'Cloud SQL for MySQL: Zonal - 4 vCPU + 15GB RAM in Los Angeles',
      usageUnit: 'seconds',
      vCpus: null,
      usageAmount: 50000,
      cost: 10,
    },
    {
      timestamp: bigQueryDateTwo,
      accountName: 'test-account',
      region: 'us-east1',
      serviceName: 'Cloud SQL',
      usageType: 'Cloud SQL: vCPU in Americas',
      usageUnit: 'seconds',
      vCpus: null,
      usageAmount: 94360227,
      cost: 13,
    },
    {
      timestamp: bigQueryDateTwo,
      accountName: 'test-account',
      region: 'us-east1',
      serviceName: 'Cloud SQL',
      usageType: 'DB generic Small instance with 1 VCPU running in Americas (with 30% promotional discount)',
      usageUnit: 'seconds',
      vCpus: null,
      usageAmount: 26316000,
      cost: 13,
    },
    {
      timestamp: bigQueryDateTwo,
      accountName: 'test-account',
      region: 'us-east1',
      serviceName: 'Cloud SQL',
      usageType: 'Cloud SQL: Small instance in Northern Virginia',
      usageUnit: 'seconds',
      vCpus: null,
      usageAmount: 1112952,
      cost: 13,
    },
  ],
]
export const mockQueryAppEngineComputeUnknownRegion: any[][] = [
  [
    {
      timestamp: bigQueryDateTwo,
      accountName: 'test-account',
      region: 'us-east1',
      serviceName: 'App Engine',
      usageType: 'Backend Instances',
      usageUnit: 'seconds',
      vCpus: null,
      usageAmount: 14551,
      cost: 10,
    },
    {
      timestamp: bigQueryDateTwo,
      accountName: 'test-account',
      region: 'us-east1',
      serviceName: 'Cloud Dataflow',
      usageType: 'vCPU Time Batch Iowa',
      usageUnit: 'seconds',
      vCpus: null,
      usageAmount: 1141961,
      cost: 190,
    },
    {
      timestamp: bigQueryDateTwo,
      accountName: 'test-account',
      region: null,
      serviceName: 'App Engine',
      usageType: 'Cloud Datastore Storage',
      usageUnit: 'byte-seconds',
      vCpus: null as string | null,
      usageAmount: 2.83e16,
      cost: 5,
    },
  ],
]
