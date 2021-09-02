/*
 * © 2021 Thoughtworks, Inc.
 */

import { BigQuery } from '@google-cloud/bigquery'
import each from 'jest-each'
import {
  EstimationResult,
  LookupTableOutput,
} from '@cloud-carbon-footprint/common'
import {
  ComputeEstimator,
  StorageEstimator,
  NetworkingEstimator,
  MemoryEstimator,
  UnknownEstimator,
  EstimateClassification,
} from '@cloud-carbon-footprint/core'

import { GCP_CLOUD_CONSTANTS } from '../domain'
import BillingExportTable from '../lib/BillingExportTable'
import {
  mockQueryResultsAppEngineSSDStorage,
  mockQueryResultsCloudSQLSSDComputeEngineDataFlowHDD,
  mockQueryResultsUnknownUsages,
  mockQueryResultsUnknownAndCloudSQLCompute,
  mockQueryAppEngineComputeUnknownRegion,
  mockQueryNetworkingWithIngress,
  mockQueryComputeWithDifferentMachineTypes,
  mockQueryResultsComputeEngineRam,
  mockQueryCloudStorageWithReplicationFactors,
  mockQueryComputeEngineCloudFilestoreCloudSQLWithReplicationFactors,
  mockQueryMemoryStoreWithReplicationFactors,
  mockQueryReclassifiedUnknowns,
} from './fixtures/bigQuery.fixtures'
import { lookupTableInputData } from './fixtures/lookupTable.fixtures'
import { unknownsReclassification } from './fixtures/unknownsReclassification.fixtures'

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
  const accountId = 'test-account-id'
  const accountName = 'test-account-name'

  beforeEach(() => {
    GCP_CLOUD_CONSTANTS.CO2E_PER_COST = {
      [EstimateClassification.COMPUTE]: {
        cost: 0,
        co2e: 0,
      },
      [EstimateClassification.STORAGE]: {
        cost: 0,
        co2e: 0,
      },
      [EstimateClassification.NETWORKING]: {
        cost: 0,
        co2e: 0,
      },
      [EstimateClassification.MEMORY]: {
        cost: 0,
        co2e: 0,
      },
      total: {
        cost: 0,
        co2e: 0,
      },
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
      new UnknownEstimator(),
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
      new UnknownEstimator(),
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
            kilowattHours: 0.06085488888888889,
            co2e: 0.000029210346666666666,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
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
      new UnknownEstimator(),
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
      new UnknownEstimator(),
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
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimation results for Cloud Memorystore for Redis based on replication factors', async () => {
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
      new UnknownEstimator(),
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
      new UnknownEstimator(),
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
            kilowattHours: 13.321366426355555,
            co2e: 0.006394255884650667,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 10,
            region: 'us-east1',
          },
          {
            kilowattHours: 0.06983666666666666,
            co2e: 0.000005447259999999999,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
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
            kilowattHours: 7.024924825819445,
            co2e: 0.003371963916393334,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 10,
            region: 'us-east1',
          },
        ],
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
      new UnknownEstimator(),
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
      new UnknownEstimator(),
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
            kilowattHours: 124.9973178378226,
            co2e: 0.05999871256215485,
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
            co2e: 0.024489270433532592,
            cost: 20,
            kilowattHours: 313.96500555811014,
            region: 'us-west1',
            serviceName: 'Cloud SQL',
            usesAverageCPUConstant: true,
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
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(),
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
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.00041696345862266677,
            cost: 190,
            region: 'us-east1',
            serviceName: 'Cloud Dataflow',
            usesAverageCPUConstant: true,
            kilowattHours: 0.8686738721305557,
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
            co2e: 0.00002194544519066667,
            cost: 10,
            kilowattHours: 0.04571967748055556,
            region: 'us-east1',
            serviceName: 'App Engine',
            usesAverageCPUConstant: true,
          },
        ],
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
      new UnknownEstimator(),
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
            co2e: 9.82610692583593e-7,
            cost: 10,
            kilowattHours: 0.012597572981840936,
            region: 'us-west1',
            serviceName: 'Compute Engine',
            usesAverageCPUConstant: false,
          },
        ],
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
      new UnknownEstimator(),
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
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  describe('Unknowns usage classification', () => {
    each(unknownsReclassification).it(
      'returns correct reclassification for %s',
      (usageType, usageUnit, reclassification) => {
        const billingExportTableService = new BillingExportTable(
          new ComputeEstimator(),
          new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
          new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
          new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
          new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
          new UnknownEstimator(),
          new BigQuery(),
        )

        expect(
          billingExportTableService.getUnknownReclassification(
            usageType,
            usageUnit,
          ),
        ).toBe(reclassification.toLowerCase())
      },
    )
  })

  it('estimation for reclassified unknowns', async () => {
    mockJob.getQueryResults.mockResolvedValue(mockQueryReclassifiedUnknowns)

    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(),
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
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.0029190894869783337,
            cost: 456,
            region: 'us-east1',
            serviceName: 'Compute Engine',
            usesAverageCPUConstant: true,
            kilowattHours: 6.081436431204862,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.038528759987259076,
            cost: 6018.6968,
            region: 'us-east1',
            serviceName: 'App Engine',
            usesAverageCPUConstant: true,
            kilowattHours: 80.2682499734564,
          },
        ],
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
            co2e: 3.967223531849436e-11,
            cost: 0.012744,
            region: 'us-east1',
            serviceName: 'Stackdriver Monitoring',
            usesAverageCPUConstant: false,
            kilowattHours: 8.265049024686325e-8,
          },
        ],
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
            co2e: 8.499342561923987e-9,
            cost: 0.816998,
            region: 'us-east1',
            serviceName: 'Cloud Run',
            usesAverageCPUConstant: false,
            kilowattHours: 0.000017706963670674972,
          },
        ],
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
            co2e: 1.3236211240291596e-16,
            cost: 25,
            region: 'us-east1',
            serviceName: 'Cloud Run',
            usesAverageCPUConstant: false,
            kilowattHours: 2.7575440083940826e-13,
          },
        ],
      },
      {
        timestamp: new Date('2020-11-05'),
        serviceEstimates: [
          {
            accountId: 'test-account-id',
            accountName: 'test-account-name',
            cloudProvider: 'GCP',
            co2e: 8.484253236594484e-12,
            cost: 0.000004,
            kilowattHours: 1.1767341520935485e-8,
            region: 'asia-south1',
            serviceName: 'Cloud Storage',
            usesAverageCPUConstant: false,
          },
        ],
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
      new UnknownEstimator(),
    )

    const result =
      billingExportTableService.getEstimatesFromInputData(lookupTableInputData)

    const expectedResult: LookupTableOutput[] = [
      {
        co2e: 3.165769444444445e-10,
        kilowattHours: 8.769444444444446e-7,
        machineType: 'n1-standard-4',
        region: 'us-east4',
        serviceName: 'Compute Engine',
        usageType: 'N1 Predefined Instance Core running in Virginia',
        usageUnit: 'seconds',
      },
      {
        co2e: 3.7598510971292856e-23,
        kilowattHours: 1.7735146684572102e-19,
        machineType: '',
        region: 'europe-west1',
        serviceName: 'Compute Engine',
        usageType: 'Storage PD Capacity',
        usageUnit: 'byte-seconds',
      },
      {
        co2e: 2.1323561668395997e-16,
        kilowattHours: 1.0058283805847168e-12,
        machineType: '',
        region: 'europe-west1',
        serviceName: 'Compute Engine',
        usageType: 'Network Internet Egress from EMEA to Americas',
        usageUnit: 'bytes',
      },
      {
        co2e: 1.5277692000381648e-22,
        kilowattHours: 3.3651303965598345e-19,
        machineType: '',
        region: 'us-central1',
        serviceName: 'Compute Engine',
        usageType: 'SSD backed PD Capacity',
        usageUnit: 'byte-seconds',
      },
      {
        co2e: 3.165769444444445e-10,
        kilowattHours: 8.769444444444446e-7,
        machineType: '',
        region: 'us-east4',
        serviceName: 'App Engine',
        usageType: 'Backend Instances',
        usageUnit: 'seconds',
      },
      {
        co2e: 2.1323561668395997e-16,
        kilowattHours: 5.906803786259279e-13,
        machineType: '',
        region: 'us-east4',
        serviceName: 'Compute Engine',
        usageType: 'Network Inter Region Ingress from Netherlands to Americas',
        usageUnit: 'bytes',
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
      new UnknownEstimator(),
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
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(),
      new BigQuery(),
    )

    await expect(() =>
      billingExportTableService.getEstimates(startDate, endDate),
    ).rejects.toThrow(
      `BigQuery create Query Job failed. Reason: ${mockErrorDetails.reason}, Location: ${mockErrorDetails.location}, Message: ${mockErrorDetails.message}`,
    )
  })
})
