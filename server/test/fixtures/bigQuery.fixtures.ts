/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { BigQueryDate } from '@google-cloud/bigquery'

const bigQueryDate: BigQueryDate = { value: '2020-11-02' }

export const mockQueryResultsAppEngineSSDStorageRAM: any[][] = [
  [
    {
      timestamp: bigQueryDate,
      accountName: 'test-account',
      region: 'us-east1',
      serviceName: 'App Engine',
      usageType: 'Cloud Datastore Storage',
      usageUnit: 'byte-seconds',
      vcpus: null as string | null,
      usageAmount: 2.83e16,
      cost: 5,
    },
    {
      timestamp: bigQueryDate,
      accountName: 'test-account',
      region: 'us-east1',
      serviceName: 'App Engine',
      usageType: 'Flex Instance RAM',
      usageUnit: 'byte-seconds',
      vcpus: null as string | null,
      usageAmount: 3.91e18,
      cost: 10,
    },
    {
      timestamp: bigQueryDate,
      accountName: 'test-account',
      region: 'us-east1',
      serviceName: 'App Engine',
      usageType: 'GCS Storage',
      usageUnit: 'byte-seconds',
      vcpus: null as string | null,
      usageAmount: 380040914534400,
      cost: 10,
    },
  ],
]

export const mockQueryResultsCloudSQLSSD: any[][] = [
  [
    {
      timestamp: bigQueryDate,
      accountName: 'test-account',
      region: 'us-east1',
      serviceName: 'Cloud SQL',
      usageType: 'Storage PD SSD for DB in Americas',
      usageUnit: 'byte-seconds',
      vcpus: null as string | null,
      usageAmount: 4.26e18,
      cost: 7,
    },
  ],
]
