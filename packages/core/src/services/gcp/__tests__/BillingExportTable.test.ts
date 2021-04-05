/*
 * © 2021 Thoughtworks, Inc. All rights reserved.
 */

import { BigQuery } from '@google-cloud/bigquery'

import { EstimationResult } from '../../../application/EstimationResult'
import ComputeEstimator from '../../../domain/ComputeEstimator'
import { StorageEstimator } from '../../../domain/StorageEstimator'
import NetworkingEstimator from '../../../domain/NetworkingEstimator'
import { CLOUD_CONSTANTS } from '../../../domain/FootprintEstimationConstants'
import BillingExportTable from '../BillingExportTable'
import {
  mockQueryResultsAppEngineSSDStorageRAM,
  mockQueryResultsCloudSQLSSDComputeEngineDataFlowHDD,
  mockQueryResultsComputeEngineRamAndUnknownUsages,
  mockQueryResultsUnknownAndCloudSQLCompute,
  mockQueryAppEngineComputeUnknownRegion,
  mockQueryNetworkingIgnoreIngress,
  mockQueryComputeWithDifferentMachineTypes,
} from '../../../../test/fixtures/bigQuery.fixtures'

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
    mockJob.getQueryResults.mockResolvedValue(
      mockQueryResultsAppEngineSSDStorageRAM,
    )

    // when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.HDDCOEFFICIENT),
      new NetworkingEstimator(),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
    )

    // then
    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            kilowattHours: 0.005190060141275502,
            co2e: 0.000002595030070637751,
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
    mockJob.getQueryResults.mockResolvedValue(
      mockQueryResultsCloudSQLSSDComputeEngineDataFlowHDD,
    )
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.HDDCOEFFICIENT),
      new NetworkingEstimator(),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
    )

    // then
    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            kilowattHours: 1.4232136891223488,
            co2e: 0.0007116068445611744,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountName: 'test-account',
            serviceName: 'Cloud SQL',
            cost: 7,
            region: 'us-east1',
          },
          {
            kilowattHours: 0.0773848888888889,
            co2e: 0.00003869244444444445,
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
            kilowattHours: 0.1402554516971577,
            co2e: 0.00001640988784856745,
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

  it('Returns estimation results for Compute with different machine types', async () => {
    //given
    mockJob.getQueryResults.mockResolvedValue(
      mockQueryComputeWithDifferentMachineTypes,
    )
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.HDDCOEFFICIENT),
      new NetworkingEstimator(),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
    )

    // then
    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            kilowattHours: 16.939846240355557,
            co2e: 0.008469923120177778,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountName: 'test-account',
            serviceName: 'Compute Engine',
            cost: 10,
            region: 'us-east1',
          },
          {
            kilowattHours: 0.089936,
            co2e: 0.000010522512,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountName: 'test-account',
            serviceName: 'Compute Engine',
            cost: 7,
            region: 'us-west1',
          },
        ],
      },
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            kilowattHours: 8.933103601444445,
            co2e: 0.004466551800722223,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountName: 'test-account',
            serviceName: 'Compute Engine',
            cost: 10,
            region: 'us-east1',
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimation results Compute Engine Ram and Unknown Usage Types', async () => {
    //given
    mockJob.getQueryResults.mockResolvedValue(
      mockQueryResultsComputeEngineRamAndUnknownUsages,
    )
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.HDDCOEFFICIENT),
      new NetworkingEstimator(),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
    )

    // then
    const expectedResult: EstimationResult[] = []
    expect(result).toEqual(expectedResult)
  })

  it('Returns null estimates for networking and CLoud SQL Compute usage accumulated', async () => {
    //given
    mockJob.getQueryResults.mockResolvedValue(
      mockQueryResultsUnknownAndCloudSQLCompute,
    )
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.HDDCOEFFICIENT),
      new NetworkingEstimator(),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
    )

    // then
    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            kilowattHours: 116.77982077962223,
            co2e: 0.05838991038981112,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountName: 'test-account',
            serviceName: 'Cloud SQL',
            cost: 36,
            region: 'us-east1',
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })
  it('estimation for unknown App Engine Compute and Cloud DataFlow Compute', async () => {
    mockJob.getQueryResults.mockResolvedValue(
      mockQueryAppEngineComputeUnknownRegion,
    )
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.HDDCOEFFICIENT),
      new NetworkingEstimator(),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            accountName: 'test-account',
            cloudProvider: 'GCP',
            co2e: 0.0005523157818777779,
            cost: 190,
            region: 'us-east1',
            serviceName: 'Cloud Dataflow',
            usesAverageCPUConstant: true,
            kilowattHours: 1.1046315637555557,
          },
          {
            accountName: 'test-account',
            cloudProvider: 'GCP',
            co2e: 0.000002100469896289623,
            cost: 5,
            region: 'unknown',
            serviceName: 'App Engine',
            usesAverageCPUConstant: false,
            kilowattHours: 0.005111991817506756,
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('estimation for Networking', async () => {
    mockJob.getQueryResults.mockResolvedValue(mockQueryNetworkingIgnoreIngress)
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.HDDCOEFFICIENT),
      new NetworkingEstimator(),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            accountName: 'test-account',
            cloudProvider: 'GCP',
            co2e: 1.9688080284730532e-8,
            cost: 10,
            region: 'us-west1',
            serviceName: 'App Engine',
            usesAverageCPUConstant: false,
            kilowattHours: 0.00016827419046778233,
          },
          {
            accountName: 'test-account',
            cloudProvider: 'GCP',
            co2e: 0.0000013329019970018418,
            cost: 10,
            region: 'us-east1',
            serviceName: 'Cloud Storage',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0026658039940036836,
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
      new StorageEstimator(CLOUD_CONSTANTS.GCP.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.HDDCOEFFICIENT),
      new NetworkingEstimator(),
      new BigQuery(),
    )

    await expect(() =>
      billingExportTableService.getEstimates(startDate, endDate),
    ).rejects.toThrow(
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
      new StorageEstimator(CLOUD_CONSTANTS.GCP.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.HDDCOEFFICIENT),
      new NetworkingEstimator(),
      new BigQuery(),
    )

    await expect(() =>
      billingExportTableService.getEstimates(startDate, endDate),
    ).rejects.toThrow(
      `BigQuery create Query Job failed. Reason: ${mockErrorDetails.reason}, Location: ${mockErrorDetails.location}, Message: ${mockErrorDetails.message}`,
    )
  })
})
