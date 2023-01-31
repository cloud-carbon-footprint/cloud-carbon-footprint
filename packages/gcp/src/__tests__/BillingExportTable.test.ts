/*
 * © 2021 Thoughtworks, Inc.
 */

import { BigQuery } from '@google-cloud/bigquery'
import {
  EstimationResult,
  GroupBy,
  LookupTableOutput,
} from '@cloud-carbon-footprint/common'
import {
  ComputeEstimator,
  EmbodiedEmissionsEstimator,
  MemoryEstimator,
  NetworkingEstimator,
  StorageEstimator,
  UnknownEstimator,
} from '@cloud-carbon-footprint/core'

import { GCP_CLOUD_CONSTANTS } from '../domain'
import BillingExportTable from '../lib/BillingExportTable'
import {
  mockQueryAppEngineComputeUnknownRegion,
  mockQueryCloudSpannerKubernetesEngineAndRequestsUsageTypesWithReplicationFactors,
  mockQueryCloudStorageWithReplicationFactors,
  mockQueryComputeEngineCloudFilestoreCloudSQLWithReplicationFactors,
  mockQueryComputeWithDifferentMachineTypes,
  mockQueryComputeWithDifferentMachineTypesForEmbodiedEmissions,
  mockQueryMemoryStoreWithReplicationFactors,
  mockQueryNetworkingWithIngress,
  mockQueryReclassifiedUnknowns,
  mockQueryResultsAppEngineSSDStorage,
  mockQueryResultsCloudSQLSSDComputeEngineDataFlowHDD,
  mockQueryResultsComputeEngineRam,
  mockQueryResultsGPUMachineTypes,
  mockQueryResultsUnknownAndCloudSQLCompute,
  mockQueryResultsUnknownUsages,
} from './fixtures/bigQuery.fixtures'
import { lookupTableInputData } from './fixtures/lookupTable.fixtures'

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
  const grouping = GroupBy.day
  const accountId = 'test-account-id'
  const accountName = 'test-account-name'

  beforeEach(() => {
    GCP_CLOUD_CONSTANTS.KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT = {
      total: {},
    }
  })

  it('Returns estimation results for App Engine SSD Storage & GCS Storage accumulated', async () => {
    // given
    mockJob.getQueryResults.mockResolvedValue(
      mockQueryResultsAppEngineSSDStorage,
    )

    // when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(GCP_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        GCP_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    // then
    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            kilowattHours: 0.005190060141275502,
            co2e: 0.0000024912288678122412,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'App Engine',
            cost: 15,
            region: 'us-east1',
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-02T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-02T00:00:00.000Z'),
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
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(GCP_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        GCP_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    // then
    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            kilowattHours: 1.4232136891223488,
            co2e: 0.0006831425707787274,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud SQL',
            cost: 7,
            region: 'us-east1',
          },
          {
            kilowattHours: 0.05865088888888889,
            co2e: 0.00002815242666666667,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 7,
            region: 'us-east1',
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-02T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-02T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            kilowattHours: 0.1402554516971577,
            co2e: 0.0000109399252323783,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud Dataflow',
            cost: 12,
            region: 'us-west1',
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-28T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-28T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimation results for Cloud Storage based on replication factors', async () => {
    //given
    mockJob.getQueryResults.mockResolvedValue(
      mockQueryCloudStorageWithReplicationFactors,
    )
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(GCP_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        GCP_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    // then
    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            kilowattHours: 3.551443417867025e-13,
            co2e: 1.6585240761439007e-16,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud Storage',
            cost: 10,
            region: 'nam4',
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 1.9419763604819328e-8,
            cost: 120,
            kilowattHours: 0.000042774809702245215,
            region: 'us-central1',
            serviceName: 'Cloud Storage',
            usesAverageCPUConstant: false,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-28T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-28T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 2.0858679274940342e-13,
            cost: 220,
            kilowattHours: 5.585721305881937e-10,
            region: 'us',
            serviceName: 'Cloud Storage',
            usesAverageCPUConstant: false,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-02T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-02T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimation results for ComputeEngine, CloudFileStore and CloudSQL based on replication factors', async () => {
    //given
    mockJob.getQueryResults.mockResolvedValue(
      mockQueryComputeEngineCloudFilestoreCloudSQLWithReplicationFactors,
    )
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(GCP_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        GCP_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    // then
    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            kilowattHours: 0.00028446168676757815,
            co2e: 1.3654160964843751e-7,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 150,
            region: 'us-east1',
          },
          {
            kilowattHours: 8.234108336182544e-11,
            co2e: 4.5616960182451294e-14,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 150,
            region: 'asia-northeast1',
          },
          {
            kilowattHours: 1.3380426046296634e-10,
            co2e: 7.380048322129852e-14,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 150,
            region: 'asia',
          },
          {
            kilowattHours: 4.4601420154322116e-11,
            co2e: 3.2157623931266244e-14,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 150,
            region: 'asia-south1',
          },
          {
            kilowattHours: 0.034632,
            co2e: 0.000015722928,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud Filestore',
            cost: 70,
            region: 'us-central1',
          },
          {
            kilowattHours: 0.00023740234375,
            co2e: 8.570224609375e-8,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud SQL',
            cost: 80,
            region: 'us-east4',
          },
          {
            kilowattHours: 6.587286728972686e-10,
            co2e: 4.749433731589306e-13,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud SQL',
            cost: 80,
            region: 'asia-south1',
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-28T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-28T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimation results for Cloud Memory store for Redis based on replication factors', async () => {
    //given
    mockJob.getQueryResults.mockResolvedValue(
      mockQueryMemoryStoreWithReplicationFactors,
    )
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(GCP_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        GCP_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    // then
    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            kilowattHours: 0.00001691015625,
            co2e: 7.6772109375e-9,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud Memorystore for Redis',
            cost: 170,
            region: 'us-central1',
          },
          {
            kilowattHours: 0.00003412500000000001,
            co2e: 1.5492750000000005e-8,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud Memorystore for Redis',
            cost: 170,
            region: 'us-central2',
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-28T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-28T00:00:00.000Z'),
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
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(GCP_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        GCP_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    // then
    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            kilowattHours: 17.590322771549975,
            co2e: 0.008443354930343988,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 10,
            region: 'us-east1',
          },
          {
            kilowattHours: 0.211878579423001,
            co2e: 0.000016526529194994077,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 7,
            region: 'us-west1',
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-02T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-02T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            kilowattHours: 12.634439456249067,
            co2e: 0.006064530938999552,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 10,
            region: 'us-east1',
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-28T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-28T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimation results for Compute with Embodied Emissions', async () => {
    //given
    mockJob.getQueryResults.mockResolvedValue(
      mockQueryComputeWithDifferentMachineTypesForEmbodiedEmissions,
    )
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(GCP_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        GCP_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    // then
    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            kilowattHours: 0.10281277077223262,
            co2e: 0.00004667699793059361,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 0.758656,
            region: 'us-central1',
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-02T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-02T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            kilowattHours: 0.36541815348500395,
            co2e: 0.00016589984168219178,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 1.570404,
            region: 'us-central1',
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-28T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-28T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2020-11-03'),
        serviceEstimates: [
          {
            kilowattHours: 0.33462656235264876,
            co2e: 0.00015192045930810253,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 0.959995,
            region: 'us-central1',
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-03T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-03T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2020-11-04'),
        serviceEstimates: [
          {
            kilowattHours: 0.08549324069338539,
            co2e: 0.00006164062653993087,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 0.681886,
            region: 'asia-south1',
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-04T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-04T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2020-11-05'),
        serviceEstimates: [
          {
            kilowattHours: 0.06856871694444444,
            co2e: 0.00004943804491694444,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 0.681886,
            region: 'asia-south1',
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-05T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-05T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimation results Unknown Usage Types', async () => {
    //given
    mockJob.getQueryResults.mockResolvedValue(mockQueryResultsUnknownUsages)
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(GCP_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        GCP_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    // then
    const expectedResult: EstimationResult[] = []
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimates for networking and CLoud SQL Compute usage accumulated', async () => {
    //given
    mockJob.getQueryResults.mockResolvedValue(
      mockQueryResultsUnknownAndCloudSQLCompute,
    )
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(GCP_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        GCP_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    // then
    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            kilowattHours: 89.32470187303058,
            co2e: 0.042875856899054675,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud SQL',
            cost: 49,
            region: 'us-east1',
          },
          {
            accountId: 'test-account-id',
            accountName: 'test-account-name',
            cloudProvider: 'GCP',
            co2e: 0.0010415086271501168,
            cost: 20,
            kilowattHours: 13.352674707052781,
            region: 'us-west1',
            serviceName: 'Cloud SQL',
            usesAverageCPUConstant: false,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-28T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-28T00:00:00.000Z'),
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
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(GCP_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        GCP_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.0004018621663586667,
            cost: 190,
            region: 'us-east1',
            serviceName: 'Cloud Dataflow',
            usesAverageCPUConstant: true,
            kilowattHours: 0.8372128465805556,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.0000021042472983585367,
            cost: 5,
            region: 'Unknown',
            serviceName: 'App Engine',
            usesAverageCPUConstant: false,
            kilowattHours: 0.005111991817506756,
          },
          {
            accountId: 'test-account-id',
            accountName: 'test-account-name',
            cloudProvider: 'GCP',
            co2e: 0.000005120574505333334,
            cost: 10,
            kilowattHours: 0.010667863552777778,
            region: 'us-east1',
            serviceName: 'App Engine',
            usesAverageCPUConstant: false,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-28T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-28T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('returns estimations for Kubernetes Engine Compute, unknown CloudSpanner and requests usageTypes', async () => {
    mockJob.getQueryResults.mockResolvedValue(
      mockQueryCloudSpannerKubernetesEngineAndRequestsUsageTypesWithReplicationFactors,
    )
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(GCP_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        GCP_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 7.6772109375e-9,
            cost: 170,
            kilowattHours: 0.00001691015625,
            region: 'us-central1',
            serviceName: 'Cloud Memorystore for Redis',
            usesAverageCPUConstant: false,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 2.19789390425157,
            cost: 150,
            kilowattHours: 3048.3965384903886,
            region: 'asia-south1',
            serviceName: 'Kubernetes Engine',
            usesAverageCPUConstant: true,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.12238588237226934,
            cost: 350,
            kilowattHours: 269.5724281327519,
            region: 'us-central1',
            serviceName: 'Kubernetes Engine',
            usesAverageCPUConstant: true,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.2087717970211498,
            cost: 50,
            region: 'asia-south1',
            serviceName: 'Cloud Spanner',
            usesAverageCPUConstant: false,
            kilowattHours: 289.5586643843964,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 4.238710334472657e-7,
            cost: 150,
            region: 'asia-east1',
            serviceName: 'Cloud Spanner',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0007849463582356771,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0,
            region: 'europe',
            serviceName: 'App Engine',
            usesAverageCPUConstant: false,
            cost: 10,
            kilowattHours: 0,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-28T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-28T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('estimation for Networking', async () => {
    mockJob.getQueryResults.mockResolvedValue(mockQueryNetworkingWithIngress)
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(GCP_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        GCP_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 1.3125386856487022e-8,
            cost: 10,
            region: 'us-west1',
            serviceName: 'App Engine',
            usesAverageCPUConstant: false,
            kilowattHours: 0.00016827419046778233,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.0000012795859171217682,
            cost: 10,
            region: 'us-east1',
            serviceName: 'Cloud Storage',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0026658039940036836,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.0000016551207737725232,
            cost: 10,
            kilowattHours: 0.0026609658742323523,
            region: 'europe-central2',
            serviceName: 'Cloud Pub/Sub',
            usesAverageCPUConstant: false,
          },
          {
            accountId: 'test-account-id',
            accountName: 'test-account-name',
            cloudProvider: 'GCP',
            co2e: 1.3195092691219494e-8,
            cost: 10,
            kilowattHours: 0.00016916785501563453,
            region: 'us-west1',
            serviceName: 'Compute Engine',
            usesAverageCPUConstant: false,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-02T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-02T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('estimation for Memory', async () => {
    mockJob.getQueryResults.mockResolvedValue(mockQueryResultsComputeEngineRam)
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(GCP_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        GCP_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 1.0393783450126647e-18,
            cost: 10,
            region: 'us-west1',
            serviceName: 'Compute engine',
            usesAverageCPUConstant: false,
            kilowattHours: 1.3325363397598266e-14,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 6.0369372367858886e-18,
            cost: 8,
            region: 'europe-west1',
            serviceName: 'Compute engine',
            usesAverageCPUConstant: false,
            kilowattHours: 2.847611904144287e-14,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 1.9419861336549123e-17,
            cost: 5,
            region: 'us-central1',
            serviceName: 'Compute engine',
            usesAverageCPUConstant: false,
            kilowattHours: 4.277502497037252e-14,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-28T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-28T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('estimation for GPU Machine Types', async () => {
    mockJob.getQueryResults.mockResolvedValue(mockQueryResultsGPUMachineTypes)
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(GCP_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        GCP_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.000014562404999999998,
            cost: 10,
            region: 'us-west1',
            serviceName: 'Compute engine',
            usesAverageCPUConstant: true,
            kilowattHours: 0.1866975,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.00005185944,
            cost: 8,
            region: 'europe-west1',
            serviceName: 'Compute engine',
            usesAverageCPUConstant: true,
            kilowattHours: 0.24462,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.00003131982,
            cost: 8,
            region: 'europe-west1',
            serviceName: 'Notebooks',
            usesAverageCPUConstant: true,
            kilowattHours: 0.147735,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-28T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-28T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('estimation for reclassified unknowns', async () => {
    mockJob.getQueryResults.mockResolvedValue(mockQueryReclassifiedUnknowns)

    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(GCP_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        GCP_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.003249840474753334,
            cost: 456,
            region: 'us-east1',
            serviceName: 'Compute Engine',
            usesAverageCPUConstant: true,
            kilowattHours: 6.770500989069445,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.15353438643927866,
            cost: 6018.6968,
            region: 'us-east1',
            serviceName: 'App Engine',
            usesAverageCPUConstant: false,
            kilowattHours: 319.86330508183056,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-28T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-28T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.0000024561671112909644,
            cost: 789,
            region: 'us-east1',
            serviceName: 'App Engine',
            usesAverageCPUConstant: false,
            kilowattHours: 0.005117014815189509,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 8.025428493835144e-18,
            cost: 0.012744,
            region: 'us-east1',
            serviceName: 'Stackdriver Monitoring',
            usesAverageCPUConstant: false,
            kilowattHours: 1.6719642695489882e-14,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-02T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-02T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2020-11-03'),
        serviceEstimates: [
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.0000012795859171217682,
            cost: 123,
            region: 'us-east1',
            serviceName: 'Cloud Storage',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0026658039940036836,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.000003604108730299473,
            cost: 0.816998,
            region: 'us-east1',
            serviceName: 'Cloud Run',
            usesAverageCPUConstant: false,
            kilowattHours: 0.007508559854790569,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-03T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-03T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2020-11-04'),
        serviceEstimates: [
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 5.2944844961166387e-17,
            cost: 10,
            region: 'us-east1',
            serviceName: 'Compute Engine',
            usesAverageCPUConstant: false,
            kilowattHours: 1.103017603357633e-13,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 4.1842706470923184e-13,
            cost: 25,
            region: 'us-east1',
            serviceName: 'Cloud Run',
            usesAverageCPUConstant: false,
            kilowattHours: 8.717230514775663e-10,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-04T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-04T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2020-11-05'),
        serviceEstimates: [
          {
            accountId: 'test-account-id',
            accountName: 'test-account-name',
            cloudProvider: 'GCP',
            co2e: 0,
            cost: 0.000004,
            kilowattHours: 0,
            region: 'asia-south1',
            serviceName: 'Cloud Storage',
            usesAverageCPUConstant: false,
          },
          {
            accountId: 'test-account-id',
            accountName: 'test-account-name',
            cloudProvider: 'GCP',
            co2e: 0,
            cost: 200,
            kilowattHours: 0,
            region: 'us-east1',
            serviceName: 'Secret Manager',
            usesAverageCPUConstant: false,
          },
          {
            accountId: 'test-account-id',
            accountName: 'test-account-name',
            cloudProvider: 'GCP',
            co2e: 0,
            cost: 200,
            kilowattHours: 0,
            region: 'us-east1',
            serviceName: 'Cloud Key Management Service (KMS)',
            usesAverageCPUConstant: false,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-05T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-05T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('estimation for lookup table input data', async () => {
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(GCP_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        GCP_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
    )

    const result =
      billingExportTableService.getEstimatesFromInputData(lookupTableInputData)

    const expectedResult: LookupTableOutput[] = [
      {
        co2e: 9.510545e-7,
        kilowattHours: 0.0026345,
        machineType: '',
        region: 'us-east4',
        serviceName: 'Compute Engine',
        usageType: 'N1 Predefined Instance Core running in Virginia',
      },
      {
        co2e: 0.000005057275113774734,
        kilowattHours: 0.014009072337326133,
        machineType: 'n1-standard-4',
        region: 'us-east4',
        serviceName: 'Compute Engine',
        usageType: 'N1 Predefined Instance Core running in Virginia',
      },
      {
        co2e: 0.000009615983113774734,
        kilowattHours: 0.026637072337326137,
        machineType: 'n1-standard-8',
        region: 'us-east4',
        serviceName: 'Compute Engine',
        usageType: 'N1 Predefined Instance Core running in Virginia',
      },
      {
        co2e: 1.3535463949665428e-19,
        kilowattHours: 6.384652806445957e-16,
        machineType: '',
        region: 'europe-west1',
        serviceName: 'Compute Engine',
        usageType: 'Storage PD Capacity',
      },
      {
        co2e: 7.67648220062256e-13,
        kilowattHours: 3.6209821701049808e-9,
        machineType: '',
        region: 'europe-west1',
        serviceName: 'Compute Engine',
        usageType: 'Network Internet Egress from EMEA to Americas',
      },
      {
        co2e: 5.499969120137394e-19,
        kilowattHours: 1.2114469427615405e-15,
        machineType: '',
        region: 'us-central1',
        serviceName: 'Compute Engine',
        usageType: 'SSD backed PD Capacity',
      },
      {
        co2e: 0.0000048757261666666675,
        kilowattHours: 0.01350616666666667,
        machineType: '',
        region: 'us-east4',
        serviceName: 'App Engine',
        usageType: 'Backend Instances',
      },
      {
        co2e: 1.307174563407898e-12,
        kilowattHours: 3.6209821701049804e-9,
        machineType: '',
        region: 'us-east4',
        serviceName: 'Compute Engine',
        usageType: 'Network Inter Region Ingress from Netherlands to Americas',
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
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(GCP_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        GCP_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new BigQuery(),
    )

    await expect(() =>
      billingExportTableService.getEstimates(startDate, endDate, grouping),
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
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(GCP_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        GCP_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      new BigQuery(),
    )

    await expect(() =>
      billingExportTableService.getEstimates(startDate, endDate, grouping),
    ).rejects.toThrow(
      `BigQuery create Query Job failed. Reason: ${mockErrorDetails.reason}, Location: ${mockErrorDetails.location}, Message: ${mockErrorDetails.message}`,
    )
  })
})
