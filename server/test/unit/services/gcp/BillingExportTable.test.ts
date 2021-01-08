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
  mockQueryResultsComputeEngineRamAndUnknownUsages,
  mockQueryResultsNetworkingAndCloudSQLCompute,
  mockQueryAppEngineComputeUnknownRegion,
} from '../../../fixtures/bigQuery.fixtures'

const mockJob = { getQueryResults: jest.fn() }
const mockCreateQueryJob = jest.fn().mockResolvedValue([mockJob, 'test-job-id'])

jest.mock('@google-cloud/bigquery', () => {
  return {
    BigQuery: jest.fn().mockImplementation(() => {
      return {
        createQueryJob: mockCreateQueryJob,
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

  it('Returns estimation results Compute Engine Ram and Unkown Usage Types', async () => {
    //given
    mockJob.getQueryResults.mockResolvedValue(mockQueryResultsComputeEngineRamAndUnknownUsages)
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

  it('Returns null estimates for networking and CLoud SQL Compute usage', async () => {
    //given
    mockJob.getQueryResults.mockResolvedValue(mockQueryResultsNetworkingAndCloudSQLCompute)
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
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            wattHours: 13490.015000000001,
            co2e: 3.8830970135657705,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountName: 'test-account',
            serviceName: 'Cloud SQL',
            cost: 23,
            region: 'us-east1',
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })
  it('estimation is zero when virtual cpu in unknown. Region is unknown.', async () => {
    mockJob.getQueryResults.mockResolvedValue(mockQueryAppEngineComputeUnknownRegion)
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.SSDCOEFFICIENT, CLOUD_CONSTANTS.GCP.POWER_USAGE_EFFECTIVENESS),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.HDDCOEFFICIENT, CLOUD_CONSTANTS.GCP.POWER_USAGE_EFFECTIVENESS),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(startDate, endDate)

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            accountName: 'test-account',
            cloudProvider: 'GCP',
            co2e: 0,
            cost: 10,
            region: 'us-east1',
            serviceName: 'App Engine',
            usesAverageCPUConstant: true,
            wattHours: 0,
          },
          {
            accountName: 'test-account',
            cloudProvider: 'GCP',
            co2e: 0,
            cost: 190,
            region: 'us-east1',
            serviceName: 'Cloud Dataflow',
            usesAverageCPUConstant: true,
            wattHours: 0,
          },
          {
            accountName: 'test-account',
            cloudProvider: 'GCP',
            co2e: 0.002186739436950524,
            cost: 5,
            region: 'unknown',
            serviceName: 'App Engine',
            usesAverageCPUConstant: false,
            wattHours: 5.444798928995928,
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('throws an error when get query results fails', async () => {
    const mockErrorDetails = {
      message: 'Not found: Job',
      domain: 'global',
      reason: 'notFound',
    }
    const apiError: any = new Error('Test message')
    apiError.errors = [mockErrorDetails]

    mockJob.getQueryResults.mockRejectedValue(apiError)

    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.SSDCOEFFICIENT, CLOUD_CONSTANTS.GCP.POWER_USAGE_EFFECTIVENESS),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.HDDCOEFFICIENT, CLOUD_CONSTANTS.GCP.POWER_USAGE_EFFECTIVENESS),
      new BigQuery(),
    )

    await expect(() => billingExportTableService.getEstimates(startDate, endDate)).rejects.toThrow(
      `BigQuery get Query Results failed. Reason: ${mockErrorDetails.reason}, Domain: ${mockErrorDetails.domain}, Message: ${mockErrorDetails.message}`,
    )
  })

  it('throws an error when create query job fails', async () => {
    const mockErrorDetails = {
      reason: 'Invalid Query',
      location: 'query',
      message: 'Test message',
    }
    const apiError: any = new Error('Test message')
    apiError.errors = [mockErrorDetails]

    mockCreateQueryJob.mockRejectedValue(apiError)

    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.SSDCOEFFICIENT, CLOUD_CONSTANTS.GCP.POWER_USAGE_EFFECTIVENESS),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.HDDCOEFFICIENT, CLOUD_CONSTANTS.GCP.POWER_USAGE_EFFECTIVENESS),
      new BigQuery(),
    )

    await expect(() => billingExportTableService.getEstimates(startDate, endDate)).rejects.toThrow(
      `BigQuery create Query Job failed. Reason: ${mockErrorDetails.reason}, Location: ${mockErrorDetails.location}, Message: ${mockErrorDetails.message}`,
    )
  })
})
