/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { BigQuery } from '@google-cloud/bigquery'

import { EstimationResult } from '@application/EstimationResult'
import ComputeEstimator from '@domain/ComputeEstimator'
import { StorageEstimator } from '@domain/StorageEstimator'
import { CLOUD_CONSTANTS } from '@domain/FootprintEstimationConstants'
import BillingExportTable from '@services/gcp/BillingExportTable'
import {
  mockQueryResultsAppEngineSSDStorageRAM,
  mockQueryResultsCloudSQLSSDComputeEngineDataFlowHDD,
  mockQueryResultsComputeEngineRam,
} from '../../../fixtures/bigQuery.fixtures'

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
  it('Returns estimation results for App Engine SSD Storage & GCS Storage accumulated, ignoring RAM', async () => {
    // given
    mockJob.getQueryResults.mockResolvedValue(mockQueryResultsAppEngineSSDStorageRAM)

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

  it('Returns estimation results for Cloud SQL SSD Storage, Compute Engine and Cloud Dataflow HDD', async () => {
    //given
    mockJob.getQueryResults.mockResolvedValue(mockQueryResultsCloudSQLSSDComputeEngineDataFlowHDD)
    //when
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
            wattHours: 1467.9506421089175,
            co2e: 0.4225491783689708,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountName: 'test-account',
            serviceName: 'Cloud SQL',
            cost: 7,
            region: 'us-east1',
          },
          {
            wattHours: 651.2,
            co2e: 0.18744773636160003,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountName: 'test-account',
            serviceName: 'Compute Engine',
            cost: 7,
            region: 'us-east1',
          },
        ],
      },
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            wattHours: 150.06866306066513,
            co2e: 0.021387594176702666,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountName: 'test-account',
            serviceName: 'Cloud Dataflow',
            cost: 12,
            region: 'us-west1',
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimation results Compute Engine Ram', async () => {
    //given
    mockJob.getQueryResults.mockResolvedValue(mockQueryResultsComputeEngineRam)
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.SSDCOEFFICIENT, CLOUD_CONSTANTS.GCP.POWER_USAGE_EFFECTIVENESS),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.HDDCOEFFICIENT, CLOUD_CONSTANTS.GCP.POWER_USAGE_EFFECTIVENESS),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(startDate, endDate)

    // then
    const expectedResult: EstimationResult[] = []
    expect(result).toEqual(expectedResult)
  })
})
