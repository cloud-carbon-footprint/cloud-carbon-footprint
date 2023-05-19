/*
 * © 2021 Thoughtworks, Inc.
 */

import { BigQuery } from '@google-cloud/bigquery'
import {
  EstimationResult,
  GroupBy,
  Logger,
  LookupTableOutput,
  setConfig,
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
  mockQueryResultsWithNoTags,
  mockQueryResultsWithTags,
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
    jest.clearAllMocks()
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
            co2e: 0.0000022524861013135677,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'App Engine',
            cost: 15,
            tags: {},
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
            co2e: 0.0006176747410790994,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud SQL',
            cost: 7,
            tags: {},
            region: 'us-east1',
          },
          {
            kilowattHours: 0.05865088888888889,
            co2e: 0.00002545448577777778,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 7,
            tags: {},
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
            co2e: 0.000008415327101829462,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud Dataflow',
            cost: 12,
            tags: {},
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
            kilowattHours: 1.7757217089335124e-13,
            co2e: 1.4702975749969482e-16,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud Storage',
            cost: 10,
            tags: {},
            region: 'nam4',
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 1.9505313224223818e-8,
            cost: 120,
            kilowattHours: 0.000042774809702245215,
            tags: {},
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
            co2e: 5.222649420999611e-13,
            cost: 220,
            kilowattHours: 1.8619071019606457e-10,
            tags: {},
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
            co2e: 1.2345637205712892e-7,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 150,
            tags: {},
            region: 'us-east1',
          },
          {
            kilowattHours: 8.234108336182544e-11,
            co2e: 3.8206262679887003e-14,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 150,
            tags: {},
            region: 'asia-northeast1',
          },
          {
            kilowattHours: 4.4601420154322116e-11,
            co2e: 7.475198017864387e-14,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 150,
            tags: {},
            region: 'asia',
          },
          {
            kilowattHours: 4.4601420154322116e-11,
            co2e: 2.9882951503395816e-14,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 150,
            tags: {},
            region: 'asia-south1',
          },
          {
            kilowattHours: 0.034632,
            co2e: 0.000015792192000000003,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud Filestore',
            cost: 70,
            tags: {},
            region: 'us-central1',
          },
          {
            kilowattHours: 0.00023740234375,
            co2e: 7.335732421875e-8,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud SQL',
            cost: 80,
            tags: {},
            region: 'us-east4',
          },
          {
            kilowattHours: 6.587286728972686e-10,
            co2e: 4.4134821084116997e-13,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud SQL',
            cost: 80,
            tags: {},
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
            co2e: 7.711031250000001e-9,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud Memorystore for Redis',
            cost: 170,
            tags: {},
            region: 'us-central1',
          },
          {
            kilowattHours: 0.00003412500000000001,
            co2e: 1.5561000000000006e-8,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud Memorystore for Redis',
            cost: 170,
            tags: {},
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
            kilowattHours: 18.09392953361943,
            co2e: 0.007852765417590833,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 10,
            tags: {},
            region: 'us-east1',
          },
          {
            kilowattHours: 0.2544911532499013,
            co2e: 0.000015269469194994078,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 7,
            tags: {},
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
            kilowattHours: 13.255962888254281,
            co2e: 0.005753087893502358,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 10,
            tags: {},
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
            kilowattHours: 0.10269717440919651,
            co2e: 0.00004682991153059361,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 0.758656,
            tags: {},
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
            kilowattHours: 0.36465495281182403,
            co2e: 0.00016628265848219178,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 1.570404,
            tags: {},
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
            kilowattHours: 0.33423618476684713,
            co2e: 0.00015241170025368233,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 0.959995,
            tags: {},
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
            kilowattHours: 0.0867815253369615,
            co2e: 0.0000581436219757642,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 0.681886,
            tags: {},
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
            co2e: 0.00004594104035277778,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 0.681886,
            tags: {},
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
            co2e: 0.03876692061289526,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud SQL',
            cost: 49,
            tags: {},
            region: 'us-east1',
          },
          {
            accountId: 'test-account-id',
            accountName: 'test-account-name',
            cloudProvider: 'GCP',
            co2e: 0.0008011604824231668,
            cost: 20,
            kilowattHours: 13.352674707052781,
            tags: {},
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
            co2e: 0.00036335037541596114,
            cost: 190,
            tags: {},
            region: 'us-east1',
            serviceName: 'Cloud Dataflow',
            usesAverageCPUConstant: true,
            kilowattHours: 0.8372128465805556,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.000001621253169531934,
            cost: 5,
            tags: {},
            region: 'Unknown',
            serviceName: 'App Engine',
            usesAverageCPUConstant: false,
            kilowattHours: 0.005111991817506756,
          },
          {
            accountId: 'test-account-id',
            accountName: 'test-account-name',
            cloudProvider: 'GCP',
            co2e: 0.000004629852781905555,
            cost: 10,
            kilowattHours: 0.010667863552777778,
            tags: {},
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
            co2e: 7.711031250000001e-9,
            cost: 170,
            kilowattHours: 0.00001691015625,
            tags: {},
            region: 'us-central1',
            serviceName: 'Cloud Memorystore for Redis',
            usesAverageCPUConstant: false,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 2.0518022989814515,
            cost: 150,
            kilowattHours: 3062.391491017092,
            tags: {},
            region: 'asia-south1',
            serviceName: 'Kubernetes Engine',
            usesAverageCPUConstant: true,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.12287556385109111,
            cost: 350,
            kilowattHours: 269.46395581379625,
            tags: {},
            region: 'us-central1',
            serviceName: 'Kubernetes Engine',
            usesAverageCPUConstant: true,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.1940043051375456,
            cost: 50,
            tags: {},
            region: 'asia-south1',
            serviceName: 'Cloud Spanner',
            usesAverageCPUConstant: false,
            kilowattHours: 289.5586643843964,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 3.579355393554688e-7,
            cost: 150,
            tags: {},
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
            tags: {},
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
            co2e: 1.009645142806694e-8,
            cost: 10,
            tags: {},
            region: 'us-west1',
            serviceName: 'App Engine',
            usesAverageCPUConstant: false,
            kilowattHours: 0.00016827419046778233,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.0000011569589333975986,
            cost: 10,
            tags: {},
            region: 'us-east1',
            serviceName: 'Cloud Storage',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0026658039940036836,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.000001532716343557835,
            cost: 10,
            kilowattHours: 0.0026609658742323523,
            tags: {},
            region: 'europe-central2',
            serviceName: 'Cloud Pub/Sub',
            usesAverageCPUConstant: false,
          },
          {
            accountId: 'test-account-id',
            accountName: 'test-account-name',
            cloudProvider: 'GCP',
            co2e: 1.0150071300938072e-8,
            cost: 10,
            kilowattHours: 0.00016916785501563453,
            tags: {},
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
            co2e: 7.99521803855896e-19,
            cost: 10,
            tags: {},
            region: 'us-west1',
            serviceName: 'Compute engine',
            usesAverageCPUConstant: false,
            kilowattHours: 1.3325363397598266e-14,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 3.132373094558716e-18,
            cost: 8,
            tags: {},
            region: 'europe-west1',
            serviceName: 'Compute engine',
            usesAverageCPUConstant: false,
            kilowattHours: 2.847611904144287e-14,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 1.9505411386489868e-17,
            cost: 5,
            tags: {},
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
            co2e: 0.00001120185,
            cost: 10,
            tags: {},
            region: 'us-west1',
            serviceName: 'Compute engine',
            usesAverageCPUConstant: true,
            kilowattHours: 0.1866975,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.0000269082,
            cost: 8,
            tags: {},
            region: 'europe-west1',
            serviceName: 'Compute engine',
            usesAverageCPUConstant: true,
            kilowattHours: 0.24462,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.00001625085,
            cost: 8,
            tags: {},
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
            co2e: 0.002938397429256139,
            cost: 456,
            tags: {},
            region: 'us-east1',
            serviceName: 'Compute Engine',
            usesAverageCPUConstant: true,
            kilowattHours: 6.770500989069445,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.13882067440551446,
            cost: 6018.6968,
            tags: {},
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
            co2e: 0.000002220784429792247,
            cost: 789,
            tags: {},
            region: 'us-east1',
            serviceName: 'App Engine',
            usesAverageCPUConstant: false,
            kilowattHours: 0.005117014815189509,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 7.256324929842608e-18,
            cost: 0.012744,
            tags: {},
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
            co2e: 0.0000011569589333975986,
            cost: 123,
            tags: {},
            region: 'us-east1',
            serviceName: 'Cloud Storage',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0026658039940036836,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.0000032587149769791065,
            cost: 0.816998,
            tags: {},
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
            co2e: 4.787096398572127e-17,
            cost: 10,
            tags: {},
            region: 'us-east1',
            serviceName: 'Compute Engine',
            usesAverageCPUConstant: false,
            kilowattHours: 1.103017603357633e-13,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 3.7832780434126373e-13,
            cost: 25,
            tags: {},
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
            tags: {},
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
            tags: {},
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
            tags: {},
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
        co2e: 8.140604999999999e-7,
        kilowattHours: 0.0026345,
        machineType: '',
        region: 'us-east4',
        serviceName: 'Compute Engine',
        usageType: 'N1 Predefined Instance Core running in Virginia',
      },
      {
        co2e: 0.0000044006191137747345,
        kilowattHours: 0.014241485805096227,
        machineType: 'n1-standard-4',
        region: 'us-east4',
        serviceName: 'Compute Engine',
        usageType: 'N1 Predefined Instance Core running in Virginia',
      },
      {
        co2e: 0.000008302671113774734,
        kilowattHours: 0.02686948580509623,
        machineType: 'n1-standard-8',
        region: 'us-east4',
        serviceName: 'Compute Engine',
        usageType: 'N1 Predefined Instance Core running in Virginia',
      },
      {
        co2e: 7.023118087090553e-20,
        kilowattHours: 6.384652806445957e-16,
        machineType: '',
        region: 'europe-west1',
        serviceName: 'Compute Engine',
        usageType: 'Storage PD Capacity',
      },
      {
        co2e: 3.983080387115479e-13,
        kilowattHours: 3.6209821701049808e-9,
        machineType: '',
        region: 'europe-west1',
        serviceName: 'Compute Engine',
        usageType: 'Network Internet Egress from EMEA to Americas',
      },
      {
        co2e: 5.524198058992625e-19,
        kilowattHours: 1.2114469427615405e-15,
        machineType: '',
        region: 'us-central1',
        serviceName: 'Compute Engine',
        usageType: 'SSD backed PD Capacity',
      },
      {
        co2e: 0.000004173405500000001,
        kilowattHours: 0.01350616666666667,
        machineType: '',
        region: 'us-east4',
        serviceName: 'App Engine',
        usageType: 'Backend Instances',
      },
      {
        co2e: 1.1188834905624389e-12,
        kilowattHours: 3.6209821701049804e-9,
        machineType: '',
        region: 'us-east4',
        serviceName: 'Compute Engine',
        usageType: 'Network Inter Region Ingress from Netherlands to Americas',
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('returns estimates for instances with tags', async () => {
    // given
    setConfig({
      GCP: {
        RESOURCE_TAG_NAMES: ['tag:environment, label:project', 'project:team'],
      },
    })

    mockJob.getQueryResults.mockResolvedValue(mockQueryResultsWithTags)

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
            kilowattHours: 0.00512128634808404,
            co2e: 0.000002222638275068473,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'App Engine',
            cost: 5,
            region: 'us-east1',
            tags: {
              environment: 'dev',
              project: 'ccf',
            },
          },
          {
            accountId: 'test-account-id',
            accountName: 'test-account-name',
            cloudProvider: 'GCP',
            co2e: 0.00002545448577777778,
            cost: 7,
            kilowattHours: 0.05865088888888889,
            region: 'us-east1',
            serviceName: 'Compute Engine',
            tags: {
              environment: 'prod',
              team: 'thoughtworks',
            },
            usesAverageCPUConstant: true,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-02T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-02T00:00:00.000Z'),
      },
    ]

    expect(result).toEqual(expectedResult)
  })

  it('logs warning and ignores tags with incorrect prefix', async () => {
    // given
    const badTagName = 'beetlejuice:environment'

    setConfig({
      GCP: {
        RESOURCE_TAG_NAMES: [badTagName],
      },
    })

    mockJob.getQueryResults.mockResolvedValueOnce(mockQueryResultsWithNoTags)
    const loggerSpy = jest.spyOn(Logger.prototype, 'warn')

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

    // Not testing the actual result here since it's redundant, just that the logger is called
    await billingExportTableService.getEstimates(startDate, endDate, grouping)

    //then
    const badPrefix = badTagName.split(':')[0]

    expect(loggerSpy).toHaveBeenCalledWith(
      `Unknown tag prefix: ${badPrefix}. Ignoring tag: ${badTagName}`,
    )
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
