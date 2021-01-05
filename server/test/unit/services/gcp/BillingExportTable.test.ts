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

  it('Returns estimation results for App Engine SSD Storage', async () => {
    // given
    const mockedQueryResults = [
      [
        {
          date: bigQueryDate,
          project_name: 'test-account',
          region: 'us-east1',
          service_description: 'App Engine',
          sku_description: 'Cloud Datastore Storage',
          usage_unit: 'byte-seconds',
          vcpus: null as string | null,
          total_line_item_usage_amount: 2.83e16,
          total_cost: 5,
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
            wattHours: 5.444798928995928,
            co2e: 0.00156728383627818,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountName: 'test-account',
            serviceName: 'App Engine',
            cost: 5,
            region: 'us-east1',
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })
})
