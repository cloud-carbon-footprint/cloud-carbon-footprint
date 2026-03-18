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
import BillingExportTable, { buildTagQuery } from '../lib/BillingExportTable'
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
  mockQueryResultsForProjectFilter,
  mockQueryResultsForProjectFilterArray,
  mockQueryResultsForProjectFilterEmpty,
  mockQueryResultsForProjectFilterError,
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
            kilowattHours: 0.005180640794376637,
            co2e: 0.000002984049097560943,
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
            kilowattHours: 1.4206307241693137,
            co2e: 0.0008182832971215247,
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
            kilowattHours: 0.058544444444444455,
            co2e: 0.000033721600000000006,
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
            kilowattHours: 0.14089588754965615,
            co2e: 0.000011130775116422836,
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
            co2e: 1.756188770135244e-16,
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
            co2e: 1.7665996407027273e-8,
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
            co2e: 7.09386605847006e-13,
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
            kilowattHours: 0.0002839454223632813,
            co2e: 1.6355256328125002e-7,
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
            co2e: 3.7300510762906926e-14,
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
            co2e: 1.3929023514194795e-13,
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
            co2e: 3.028436428478472e-14,
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
            co2e: 0.000014303016000000002,
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
            kilowattHours: 0.0002330859375,
            co2e: 7.528675781249999e-8,
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
            co2e: 4.4727676889724536e-13,
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
            co2e: 6.983894531250001e-9,
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
            kilowattHours: 0.0000338203125,
            co2e: 1.2581156250000001e-8,
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
            kilowattHours: 13.819853956512677,
            co2e: 0.007960235878951302,
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
            kilowattHours: 4.9383708554632895,
            co2e: 0.0003901312975815998,
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
            kilowattHours: 8.346969043116246,
            co2e: 0.004807854168834958,
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
            kilowattHours: 1.0981384033610844,
            co2e: 0.0004535311605881279,
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
            kilowattHours: 0.2535995174499983,
            co2e: 0.00010473660070684932,
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
            kilowattHours: 6.4556663449050875,
            co2e: 0.002666190200445801,
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
            kilowattHours: 0.07312680495575823,
            co2e: 0.000049653100564959836,
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
            co2e: 0.000046558158805277776,
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
            kilowattHours: 89.16258807652778,
            co2e: 0.051357650732080005,
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
            co2e: 0.0010529468530334721,
            cost: 20,
            kilowattHours: 13.328441177638888,
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
            co2e: 0.0004813594007200001,
            cost: 190,
            tags: {},
            region: 'us-east1',
            serviceName: 'Cloud Dataflow',
            usesAverageCPUConstant: true,
            kilowattHours: 0.8356934040277779,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.0000015850660082307972,
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
            co2e: 0.000006133537520000001,
            cost: 10,
            kilowattHours: 0.01064850263888889,
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
            co2e: 6.983894531250001e-9,
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
            co2e: 1.9881218437120933,
            cost: 150,
            kilowattHours: 2928.014497366853,
            tags: {},
            region: 'asia-south1',
            serviceName: 'Kubernetes Engine',
            usesAverageCPUConstant: true,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.1047697778207236,
            cost: 350,
            kilowattHours: 253.67984944485133,
            tags: {},
            region: 'us-central1',
            serviceName: 'Kubernetes Engine',
            usesAverageCPUConstant: true,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.19661033311700518,
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
            co2e: 3.4459145126546226e-7,
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
            co2e: 1.3354362695571037e-8,
            cost: 10,
            tags: {},
            region: 'us-west1',
            serviceName: 'App Engine',
            usesAverageCPUConstant: false,
            kilowattHours: 0.000169042565766722,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.000001532716343557835,
            cost: 10,
            tags: {},
            region: 'us-east1',
            serviceName: 'Cloud Storage',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0026609658742323523,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.0000017110010571314025,
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
            co2e: 1.3354362695571038e-8,
            cost: 10,
            kilowattHours: 0.00016904256576672202,
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
            co2e: 1.0575105746587117e-18,
            cost: 10,
            tags: {},
            region: 'us-west1',
            serviceName: 'Compute engine',
            usesAverageCPUConstant: false,
            kilowattHours: 1.3386209805806478e-14,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 2.9601980414655468e-18,
            cost: 8,
            tags: {},
            region: 'europe-west1',
            serviceName: 'Compute engine',
            usesAverageCPUConstant: false,
            kilowattHours: 2.8739786810345115e-14,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 1.766608531276385e-17,
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
            co2e: 0.000012383249999999999,
            cost: 10,
            tags: {},
            region: 'us-west1',
            serviceName: 'Compute engine',
            usesAverageCPUConstant: true,
            kilowattHours: 0.15675,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.00002559756,
            cost: 8,
            tags: {},
            region: 'europe-west1',
            serviceName: 'Compute engine',
            usesAverageCPUConstant: true,
            kilowattHours: 0.24852000000000002,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.000034754020524999994,
            cost: 8,
            tags: {},
            region: 'europe-west1',
            serviceName: 'Notebooks',
            usesAverageCPUConstant: true,
            kilowattHours: 0.337417675,
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
            co2e: 0.0038927308772000006,
            cost: 456,
            tags: {},
            region: 'us-east1',
            serviceName: 'Compute Engine',
            usesAverageCPUConstant: true,
            kilowattHours: 6.758213328472223,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.18390688756792,
            cost: 6018.6968,
            tags: {},
            region: 'us-east1',
            serviceName: 'App Engine',
            usesAverageCPUConstant: false,
            kilowattHours: 319.2827909165278,
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
            co2e: 0.000002942051349277743,
            cost: 789,
            tags: {},
            region: 'us-east1',
            serviceName: 'App Engine',
            usesAverageCPUConstant: false,
            kilowattHours: 0.005107728036940526,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 9.613035945428663e-18,
            cost: 0.012744,
            tags: {},
            region: 'us-east1',
            serviceName: 'Stackdriver Monitoring',
            usesAverageCPUConstant: false,
            kilowattHours: 1.6689298516369207e-14,
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
            co2e: 0.000001532716343557835,
            cost: 123,
            tags: {},
            region: 'us-east1',
            serviceName: 'Cloud Storage',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0026609658742323523,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.000004317081237745286,
            cost: 0.816998,
            tags: {},
            region: 'us-east1',
            serviceName: 'Cloud Run',
            usesAverageCPUConstant: false,
            kilowattHours: 0.007494932704418899,
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
            co2e: 6.341850757598878e-17,
            cost: 10,
            tags: {},
            region: 'us-east1',
            serviceName: 'Compute Engine',
            usesAverageCPUConstant: false,
            kilowattHours: 1.1010157565275828e-13,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 5.012012027370107e-13,
            cost: 25,
            tags: {},
            region: 'us-east1',
            serviceName: 'Cloud Run',
            usesAverageCPUConstant: false,
            kilowattHours: 8.701409769739769e-10,
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
      await billingExportTableService.getEstimatesFromInputData(
        lookupTableInputData,
      )

    const expectedResult: LookupTableOutput[] = [
      {
        co2e: 8.354718e-7,
        kilowattHours: 0.0025866,
        machineType: '',
        region: 'us-east4',
        serviceName: 'Compute Engine',
        usageType: 'N1 Predefined Instance Core running in Virginia',
      },
      {
        co2e: 0.000022279448991171992,
        kilowattHours: 0.06897662226369038,
        machineType: 'n1-standard-4',
        region: 'us-east4',
        serviceName: 'Compute Engine',
        usageType: 'N1 Predefined Instance Core running in Virginia',
      },
      {
        co2e: 0.000027316698591171992,
        kilowattHours: 0.08457182226369038,
        machineType: 'n1-standard-8',
        region: 'us-east4',
        serviceName: 'Compute Engine',
        usageType: 'N1 Predefined Instance Core running in Virginia',
      },
      {
        co2e: 6.637083060923034e-20,
        kilowattHours: 6.443769962061198e-16,
        machineType: '',
        region: 'europe-west1',
        serviceName: 'Compute Engine',
        usageType: 'Storage PD Capacity',
      },
      {
        co2e: 3.764145076274872e-13,
        kilowattHours: 3.654509782791138e-9,
        machineType: '',
        region: 'europe-west1',
        serviceName: 'Compute Engine',
        usageType: 'Network Internet Egress from EMEA to Americas',
      },
      {
        co2e: 5.003275873605162e-19,
        kilowattHours: 1.2114469427615405e-15,
        machineType: '',
        region: 'us-central1',
        serviceName: 'Compute Engine',
        usageType: 'SSD backed PD Capacity',
      },
      {
        co2e: 0.0000053157402,
        kilowattHours: 0.0164574,
        machineType: '',
        region: 'us-east4',
        serviceName: 'App Engine',
        usageType: 'Backend Instances',
      },
      {
        co2e: 1.1804066598415373e-12,
        kilowattHours: 3.6545097827911376e-9,
        machineType: '',
        region: 'us-east4',
        serviceName: 'Compute Engine',
        usageType: 'Network Inter Region Ingress from Netherlands to Americas',
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('returns estimates for filtered projects that are an array of ids', async () => {
    const testAccountId = 'test-account-id'
    const testAccountIdTwo = 'test-account-id-two'

    setConfig({
      GCP: {
        projects: [testAccountId, testAccountIdTwo],
      },
    })

    mockJob.getQueryResults.mockResolvedValue(
      mockQueryResultsForProjectFilterArray,
    )

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

    await billingExportTableService.getEstimates(startDate, endDate, grouping)

    const expectedWhereFilter = `AND project.id IN ('${testAccountId}', '${testAccountIdTwo}')`

    expect(mockCreateQueryJob).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.stringContaining(expectedWhereFilter),
      }),
    )
  })

  it('returns estimates for filtered projects when list of projects is provided', async () => {
    const testAccountId = 'test-account-id'
    const testAccountIdTwo = 'test-account-id-two'

    setConfig({
      GCP: {
        projects: [{ id: testAccountId }, { id: testAccountIdTwo }],
      },
    })

    mockJob.getQueryResults.mockResolvedValue(mockQueryResultsForProjectFilter)

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

    await billingExportTableService.getEstimates(startDate, endDate, grouping)

    const expectedWhereFilter = `AND project.id IN ('${testAccountId}', '${testAccountIdTwo}')`

    expect(mockCreateQueryJob).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.stringContaining(expectedWhereFilter),
      }),
    )
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
            kilowattHours: 0.005111991817506756,
            co2e: 0.0000029445072868838915,
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
            co2e: 0.000033721600000000006,
            cost: 7,
            kilowattHours: 0.058544444444444455,
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

  it('ignores empty project filters', async () => {
    setConfig({
      GCP: {
        projects: [],
      },
    })

    mockJob.getQueryResults.mockResolvedValue(
      mockQueryResultsForProjectFilterEmpty,
    )

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

    await billingExportTableService.getEstimates(startDate, endDate, grouping)

    const expectedWhereFilter = `AND project.id IN`

    expect(mockCreateQueryJob).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.not.stringContaining(expectedWhereFilter),
      }),
    )
  })

  it('logs warning and ignores incorrectly formatted projects', async () => {
    setConfig({
      GCP: {
        projects: undefined,
      },
    })

    mockJob.getQueryResults.mockResolvedValue(
      mockQueryResultsForProjectFilterError,
    )

    const loggerSpy = jest.spyOn(Logger.prototype, 'warn')

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

    await billingExportTableService.getEstimates(startDate, endDate, grouping)

    const expectedWhereFilter = `AND project.id IN`

    expect(mockCreateQueryJob).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.not.stringContaining(expectedWhereFilter),
      }),
    )

    expect(loggerSpy).toHaveBeenCalledWith(
      'Configured list of Google Projects is invalid. Projects must be a list of of IDs or objects containing project IDs. Ignoring project filter...',
    )
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

describe('Creating Tag queries', () => {
  it('returns query parts for a single tag', () => {
    const [propertySelections, propertyJoins] = buildTagQuery('tags', [
      'environment',
    ])
    expect(propertySelections).toEqual(
      ', STRING_AGG(DISTINCT CONCAT(tags.key, ": ", tags.value), ", ") AS tags',
    )
    expect(propertyJoins).toEqual(`
LEFT JOIN
 UNNEST(tags) AS tags
ON tags.key = "environment"`)
  })

  it('returns query parts for multiple tags', () => {
    const [propertySelections, propertyJoins] = buildTagQuery('tags', [
      'environment',
      'project',
    ])
    expect(propertySelections).toEqual(
      ', STRING_AGG(DISTINCT CONCAT(tags.key, ": ", tags.value), ", ") AS tags',
    )
    expect(propertyJoins).toEqual(`
LEFT JOIN
 UNNEST(tags) AS tags
ON tags.key = "environment" OR tags.key = "project"`)
  })

  it('returns query parts for a single label', () => {
    const [propertySelections, propertyJoins] = buildTagQuery('labels', [
      'environment',
    ])
    expect(propertySelections).toEqual(
      ', STRING_AGG(DISTINCT CONCAT(labels.key, ": ", labels.value), ", ") AS labels',
    )
    expect(propertyJoins).toEqual(`
LEFT JOIN
 UNNEST(labels) AS labels
ON labels.key = "environment"`)
  })

  it('returns query parts for project labels', () => {
    const [propertySelections, propertyJoins] = buildTagQuery('projectLabels', [
      'environment',
    ])
    expect(propertySelections).toEqual(
      ', STRING_AGG(DISTINCT CONCAT(projectLabels.key, ": ", projectLabels.value), ", ") AS projectLabels',
    )
    expect(propertyJoins).toEqual(`
LEFT JOIN
 UNNEST(project.labels) AS projectLabels
ON projectLabels.key = "environment"`)
  })
})
