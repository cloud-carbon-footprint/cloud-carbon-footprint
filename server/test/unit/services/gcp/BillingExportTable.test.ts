/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { BigQuery, BigQueryDate } from '@google-cloud/bigquery'

import { EstimationResult } from '@application/EstimationResult'
import ComputeEstimator from '@domain/ComputeEstimator'
import { StorageEstimator } from '@domain/StorageEstimator'
import { CLOUD_CONSTANTS } from '@domain/FootprintEstimationConstants'
import BillingExportTable from '@services/gcp/BillingExportTable'

const mockJob = { getQueryResults: jest.fn() }

jest.mock('@google-cloud/bigquery', () => {
  return {
    BigQuery: jest.fn().mockImplementation(() => {
      return {
        createQueryJob: jest.fn().mockResolvedValue([mockJob, 'test-job-id']),
      }
    }),
  }
})

describe('GCP BillingExportTable Service', () => {
  const startDate = new Date('2020-10-01')
  const endDate = new Date('2020-11-03')
  const bigQueryDate: BigQueryDate = { value: '2020-11-02' }

  it('Returns estimation results for App Engine SSD Storage & GCS Storage accumulated, ignoring RAM', async () => {
    // given
    const mockedQueryResults = [
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

    mockJob.getQueryResults.mockResolvedValue(mockedQueryResults)

    // when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.SSDCOEFFICIENT, CLOUD_CONSTANTS.GCP.POWER_USAGE_EFFECTIVENESS),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.HDDCOEFFICIENT, CLOUD_CONSTANTS.GCP.POWER_USAGE_EFFECTIVENESS),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(startDate, endDate)

    // then
    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            wattHours: 5.517917175088915,
            co2e: 0.0015883309027967009,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountName: 'test-account',
            serviceName: 'App Engine',
            cost: 15,
            region: 'us-east1',
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })
})
