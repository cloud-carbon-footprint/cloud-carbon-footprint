/*
 * © 2021 Thoughtworks, Inc.
 */

import AWSMock from 'aws-sdk-mock'
import AWS, {
  CloudWatch,
  CloudWatchLogs,
  CostExplorer,
  Athena as AWSAthena,
} from 'aws-sdk'
import {
  GetQueryExecutionOutput,
  GetQueryResultsOutput,
} from 'aws-sdk/clients/athena'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import {
  ComputeEstimator,
  NetworkingEstimator,
  MemoryEstimator,
  StorageEstimator,
} from '@cloud-carbon-footprint/core'
import CostAndUsageReports from '../lib/CostAndUsageReports'
import { ServiceWrapper } from '../lib/ServiceWrapper'
import {
  athenaMockGetQueryResultsWithEC2EBSLambda,
  athenaMockGetQueryResultsWithNetworkingGlueECSDynamoDB,
  athenaMockGetQueryResultsWithS3CloudWatchRDS,
  athenaMockGetQueryResultsWithKenesisESAndEc2Spot,
  athenaMockGetQueryResultsWithECSEksKafkaAndUnknownServices,
  athenaMockGetQueryResultsWithDocDBComputeEbsOptimizedSpotUsage,
  athenaMockGetQueryResultsWithRedshiftStorageComputeSavingsPlan,
  athenaMockGetQueryResultsNetworking,
  athenaMockGetQueryResultsMemory,
  athenaMockGetQueryResultsS3WithReplicationFactors,
  athenaMockGetQueryResultsEC2EFSRDSWithReplicationFactors,
  athenaMockGetQueryResultsDatabasesWithReplicationFactors,
} from './fixtures/athena.fixtures'
import { AWS_CLOUD_CONSTANTS } from '../domain'

jest.mock('@cloud-carbon-footprint/common', () => ({
  ...(jest.requireActual('@cloud-carbon-footprint/common') as Record<
    string,
    unknown
  >),
  configLoader: jest.fn().mockImplementation(() => {
    return {
      AWS: {
        ATHENA_DB_NAME: 'test-db',
        ATHENA_DB_TABLE: 'test-table',
        ATHENA_QUERY_RESULT_LOCATION: 'test-location',
        ATHENA_REGION: 'test-region',
      },
    }
  }),
}))

describe('CostAndUsageReports Service', () => {
  const startDate = new Date('2020-10-01')
  const endDate = new Date('2020-11-03')
  const testAccountId = '123456789'
  const testAccountName = '123456789'
  const startQueryExecutionResponse = { QueryExecutionId: 'some-execution-id' }
  const getQueryExecutionResponse = {
    QueryExecution: { Status: { State: 'SUCCEEDED' } },
  }
  const getQueryExecutionFailedResponse = {
    QueryExecution: { Status: { State: 'FAILED', StateChangeReason: 'TEST' } },
  }
  const getServiceWrapper = () =>
    new ServiceWrapper(
      new CloudWatch(),
      new CloudWatchLogs(),
      new CostExplorer(),
      new AWSAthena(),
    )

  beforeAll(() => {
    AWSMock.setSDKInstance(AWS)
  })

  afterEach(() => {
    AWSMock.restore()
    jest.restoreAllMocks()
    startQueryExecutionSpy.mockClear()
    getQueryExecutionSpy.mockClear()
    getQueryResultsSpy.mockClear()
  })

  it('Gets Estimates for ec2, ebs Snapshot, ebs SDD Storage and lambda across multiple days with accumulation', async () => {
    // given
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(athenaMockGetQueryResultsWithEC2EBSLambda)

    // when
    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(startDate, endDate)

    expect(startQueryExecutionSpy).toHaveBeenCalledWith(
      {
        QueryString: expect.anything(),
        QueryExecutionContext: {
          Database: 'test-db',
        },
        ResultConfiguration: {
          EncryptionConfiguration: {
            EncryptionOption: 'SSE_S3',
          },
          OutputLocation: 'test-location',
        },
      },
      expect.anything(),
    )

    expect(getQueryExecutionSpy).toHaveBeenCalledWith(
      startQueryExecutionResponse,
      expect.anything(),
    )
    expect(getQueryResultsSpy).toHaveBeenCalledWith(
      startQueryExecutionResponse,
      expect.anything(),
    )

    // then

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            kilowattHours: 0.0021065600000000004,
            co2e: 8.758128528000001e-7,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AmazonEC2',
            cost: 3,
            region: 'us-east-1',
          },
          {
            kilowattHours: 0.0010532800000000002,
            co2e: 4.6364016336000006e-7,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AmazonEC2',
            cost: 3,
            region: 'us-east-2',
          },
        ],
      },
      {
        timestamp: new Date('2020-11-03'),
        serviceEstimates: [
          {
            kilowattHours: 0.0010532800000000002,
            co2e: 4.6364016336000006e-7,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AmazonEC2',
            cost: 4,
            region: 'us-east-2',
          },
        ],
      },
      {
        timestamp: new Date('2020-10-29'),
        serviceEstimates: [
          {
            kilowattHours: 0.006079968000000001,
            co2e: 0.0000025277770958400002,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AmazonEC2',
            cost: 5,
            region: 'us-east-1',
          },
        ],
      },
      {
        timestamp: new Date('2020-10-30'),
        serviceEstimates: [
          {
            kilowattHours: 0.00823329,
            co2e: 0.0000028887403626900003,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AmazonEC2',
            cost: 6,
            region: 'us-west-1',
          },
          {
            kilowattHours: 0.000014282083333333332,
            co2e: 5.011026040416666e-9,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AWSLambda',
            cost: 15,
            region: 'us-west-1',
          },
        ],
      },
    ]

    expect(result).toEqual(expectedResult)
  })

  it('Gets Estimates for CloudWatch, RDS and S3 all on the same day with accumulation', async () => {
    // given
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(athenaMockGetQueryResultsWithS3CloudWatchRDS)

    // when
    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(startDate, endDate)

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-30'),
        serviceEstimates: [
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 1.4125236853033129e-18,
            cost: 9,
            region: 'us-west-1',
            serviceName: 'AmazonS3',
            usesAverageCPUConstant: false,
            kilowattHours: 4.025878297397867e-15,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 1.1814261933977831e-18,
            cost: 10,
            region: 'us-east-2',
            serviceName: 'AmazonCloudWatch',
            usesAverageCPUConstant: false,
            kilowattHours: 2.6839188649319113e-15,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0000011410104946500003,
            cost: 11,
            region: 'us-east-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0027444300000000004,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0000017776863770400002,
            cost: 12,
            region: 'us-west-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: false,
            kilowattHours: 0.005066640000000001,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 3.6955487408000006e-7,
            cost: 13,
            region: 'us-west-2',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: true,
            kilowattHours: 0.0010532800000000002,
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Gets Estimates for Amazon Glue, ECS and DynamoDB Storage and Ignores Nat-Gateway', async () => {
    // given
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(athenaMockGetQueryResultsWithNetworkingGlueECSDynamoDB)

    // when
    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(startDate, endDate)

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-30'),
        serviceEstimates: [
          {
            kilowattHours: 0.0205662,
            co2e: 0.000008550500481000001,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AWSGlue',
            cost: 5,
            region: 'us-east-1',
          },
        ],
      },
      {
        timestamp: new Date('2020-10-31'),
        serviceEstimates: [
          {
            kilowattHours: 0.000013419594324659556,
            co2e: 4.708412284344377e-9,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AmazonDynamoDB',
            cost: 13,
            region: 'us-west-1',
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Gets Estimates for Kinesis, ES & EC2 Spot Instance', async () => {
    // given
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(athenaMockGetQueryResultsWithKenesisESAndEc2Spot)

    // when
    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(startDate, endDate)

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-30'),
        serviceEstimates: [
          {
            kilowattHours: 0.0078110700000000016,
            co2e: 0.0000034383314700900004,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AmazonKinesisAnalytics',
            cost: 912,
            region: 'us-east-2',
          },
          {
            kilowattHours: 0.037493135999999996,
            co2e: 0.000013154879190095999,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AmazonES',
            cost: 73,
            region: 'us-west-1',
          },
        ],
      },
      {
        timestamp: new Date('2020-10-31'),
        serviceEstimates: [
          {
            kilowattHours: 0.6803641503,
            co2e: 0.0002828647973079765,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AmazonEC2',
            cost: 10,
            region: 'us-east-1',
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Gets Estimates for ECS Compute + Storage, EKS Compute, Kafka and Unknown Services', async () => {
    // given
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(
      athenaMockGetQueryResultsWithECSEksKafkaAndUnknownServices,
    )

    // when
    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(startDate, endDate)

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-30'),
        serviceEstimates: [
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 6.594881633999999e-9,
            cost: 2,
            region: 'us-east-2',
            serviceName: 'AmazonECS',
            usesAverageCPUConstant: false,
            kilowattHours: 0.000014981999999999998,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000004509923436375,
            cost: 2,
            region: 'us-west-1',
            serviceName: 'AmazonECS',
            usesAverageCPUConstant: true,
            kilowattHours: 0.012853874999999999,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000020200596181916677,
            cost: 4,
            region: 'us-west-1',
            serviceName: 'AmazonMSK',
            usesAverageCPUConstant: true,
            kilowattHours: 0.057574356175,
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Gets Estimates for DocumentDB Compute, ElasticMapReduce, EC2 Credits', async () => {
    // given
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(
      athenaMockGetQueryResultsWithDocDBComputeEbsOptimizedSpotUsage,
    )

    // when
    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(startDate, endDate)

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-30'),
        serviceEstimates: [
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0002450141248832935,
            cost: 10,
            region: 'us-west-1',
            serviceName: 'AmazonDocDB',
            usesAverageCPUConstant: true,
            kilowattHours: 0.6983224834999999,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.00003536492535383826,
            cost: 5,
            region: 'us-west-2',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.10079468893333332,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0006218601175152745,
            cost: 25,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 1.7723831304000002,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.00000180396937455,
            cost: 20,
            region: 'us-west-1',
            serviceName: 'AmazonSimpleDB',
            usesAverageCPUConstant: true,
            kilowattHours: 0.00514155,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000034629593454714295,
            cost: 20,
            region: 'us-west-1',
            serviceName: 'ElasticMapReduce',
            usesAverageCPUConstant: true,
            kilowattHours: 0.0986988963,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0000074816879208749995,
            cost: 20,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.017995425,
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Gets Estimates for Redshift Storage and Compute, and Savings Plan Compute', async () => {
    // given
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(
      athenaMockGetQueryResultsWithRedshiftStorageComputeSavingsPlan,
    )

    // when
    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(startDate, endDate)

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-30'),
        serviceEstimates: [
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0000021064809132000003,
            cost: 10,
            region: 'us-east-1',
            serviceName: 'AmazonRedshift',
            usesAverageCPUConstant: false,
            kilowattHours: 0.005066640000000001,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 6.37176407766461e-8,
            cost: 10,
            region: 'us-west-1',
            serviceName: 'AmazonRedshift',
            usesAverageCPUConstant: true,
            kilowattHours: 0.0001816036572222222,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.00052033326270464,
            cost: 15,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 1.4830182400000003,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0000432952649892,
            cost: 15,
            region: 'us-west-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: true,
            kilowattHours: 0.1233972,
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Gets Estimates for Networking', async () => {
    // given
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(athenaMockGetQueryResultsNetworking)

    // when
    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(startDate, endDate)

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2021-01-01'),
        serviceEstimates: [
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0007427421499500001,
            cost: 22,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: false,
            kilowattHours: 1.7864900000000001,
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('estimation for Memory', async () => {
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(athenaMockGetQueryResultsMemory)

    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      getServiceWrapper(),
    )

    const result = await athenaService.getEstimates(startDate, endDate)

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2021-01-01'),
        serviceEstimates: [
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.00014604639719904827,
            cost: 40,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.35127995381666666,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.00008869316977920002,
            cost: 7,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.25278720000000005,
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('estimation for S3 with replication factors', async () => {
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(athenaMockGetQueryResultsS3WithReplicationFactors)

    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      getServiceWrapper(),
    )

    const result = await athenaService.getEstimates(startDate, endDate)

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2021-01-02'),
        serviceEstimates: [
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 5.787739723820913e-9,
            cost: 10,
            region: 'us-east-1',
            serviceName: 'AmazonS3',
            usesAverageCPUConstant: false,
            kilowattHours: 0.000013921034560789199,
          },
        ],
      },
      {
        timestamp: new Date('2021-01-03'),
        serviceEstimates: [
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 5.35415660302189e-9,
            cost: 5,
            region: 'us-east-1',
            serviceName: 'AmazonS3',
            usesAverageCPUConstant: false,
            kilowattHours: 0.000012878153246556,
          },
        ],
      },
      {
        timestamp: new Date('2021-01-04'),
        serviceEstimates: [
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 1.9880880300061107e-12,
            cost: 7,
            region: 'eu-north-1',
            serviceName: 'AmazonS3',
            usesAverageCPUConstant: false,
            kilowattHours: 2.4851100375076387e-7,
          },
        ],
      },
      {
        timestamp: new Date('2021-01-05'),
        serviceEstimates: [
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 4.405144400710844e-8,
            cost: 10,
            region: 'us-east-1',
            serviceName: 'AmazonS3',
            usesAverageCPUConstant: false,
            kilowattHours: 0.00010595529580428001,
          },
        ],
      },
      {
        timestamp: new Date('2021-01-06'),
        serviceEstimates: [
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 2.192987610097726e-10,
            cost: 5,
            region: 'us-west-1',
            serviceName: 'AmazonS3',
            usesAverageCPUConstant: false,
            kilowattHours: 6.250303140268443e-7,
          },
        ],
      },
      {
        timestamp: new Date('2021-01-07'),
        serviceEstimates: [
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 4.127128828214698e-10,
            cost: 7,
            region: 'us-west-1',
            serviceName: 'AmazonS3',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0000011762860016401646,
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('estimation for EC2, RDS and EFS with replication factors', async () => {
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(
      athenaMockGetQueryResultsEC2EFSRDSWithReplicationFactors,
    )

    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      getServiceWrapper(),
    )

    const result = await athenaService.getEstimates(startDate, endDate)

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2021-01-01'),
        serviceEstimates: [
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000034337982056187456,
            cost: 10,
            region: 'ap-south-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: false,
            kilowattHours: 0.048499974655632,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000016383336907398734,
            cost: 10,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: false,
            kilowattHours: 0.039406229407701006,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 6.158570301305735e-21,
            cost: 5,
            region: 'eu-west-1',
            serviceName: 'AmazonEFS',
            usesAverageCPUConstant: false,
            kilowattHours: 1.9489146523119416e-17,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 1.9355756655316373e-8,
            cost: 10,
            region: 'ap-south-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: false,
            kilowattHours: 0.000027338639343667196,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 2.339731883828851e-9,
            cost: 10,
            region: 'eu-west-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: false,
            kilowattHours: 0.000007404214822243199,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000017125243199999997,
            cost: 7,
            region: 'eu-central-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0506664,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 2.0402144538370646,
            cost: 20,
            region: 'us-east-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: true,
            kilowattHours: 4907.251756051195,
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('estimation for DocumentDB and DynamoDB with replication factors', async () => {
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(
      athenaMockGetQueryResultsDatabasesWithReplicationFactors,
    )

    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      getServiceWrapper(),
    )

    const result = await athenaService.getEstimates(startDate, endDate)

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2021-01-01'),
        serviceEstimates: [
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 7.297876060323839e-9,
            cost: 10,
            region: 'ap-south-1',
            serviceName: 'AmazonDocDB',
            usesAverageCPUConstant: false,
            kilowattHours: 0.000010307734548479999,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 2.8307616003763196e-9,
            cost: 10,
            region: 'eu-central-1',
            serviceName: 'AmazonDocDB',
            usesAverageCPUConstant: false,
            kilowattHours: 0.000008375034320639999,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000019197251644164005,
            cost: 6,
            region: 'ap-southeast-1',
            serviceName: 'AmazonDocDB',
            usesAverageCPUConstant: true,
            kilowattHours: 0.04699449606894493,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 1.4728843470358698e-23,
            cost: 5,
            region: 'us-east-1',
            serviceName: 'AmazonDynamoDB',
            usesAverageCPUConstant: false,
            kilowattHours: 3.5426738031674176e-20,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 8.719281928699677e-11,
            cost: 5,
            region: 'us-west-1',
            serviceName: 'AmazonECR',
            usesAverageCPUConstant: false,
            kilowattHours: 2.4851100375076387e-7,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 1.2494368619346096e-10,
            cost: 5,
            region: 'ap-southeast-1',
            serviceName: 'AmazonSimpleDB',
            usesAverageCPUConstant: false,
            kilowattHours: 3.05859696924017e-7,
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('throws an error when the query status fails', async () => {
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionFailedResponse)
    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      getServiceWrapper(),
    )
    await expect(() =>
      athenaService.getEstimates(startDate, endDate),
    ).rejects.toThrow(
      `Athena query failed. Reason TEST. Query ID: some-execution-id`,
    )
  })

  it('throws an error when the query start fail', async () => {
    mockStartQueryExecutionFailed('Start failed')
    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      getServiceWrapper(),
    )
    await expect(() =>
      athenaService.getEstimates(startDate, endDate),
    ).rejects.toThrow(`Athena start query failed. Reason Start failed.`)
  })

  const startQueryExecutionSpy = jest.fn()
  const getQueryExecutionSpy = jest.fn()
  const getQueryResultsSpy = jest.fn()

  function mockStartQueryExecution(response: { QueryExecutionId: string }) {
    startQueryExecutionSpy.mockResolvedValue(response)
    AWSMock.mock('Athena', 'startQueryExecution', startQueryExecutionSpy)
  }
  function mockStartQueryExecutionFailed(response: string) {
    startQueryExecutionSpy.mockRejectedValue(new Error(response))
    AWSMock.mock('Athena', 'startQueryExecution', startQueryExecutionSpy)
  }

  function mockGetQueryExecution(response: GetQueryExecutionOutput) {
    getQueryExecutionSpy.mockResolvedValue(response)
    AWSMock.mock('Athena', 'getQueryExecution', getQueryExecutionSpy)
  }

  function mockGetQueryResults(results: GetQueryResultsOutput) {
    getQueryResultsSpy.mockResolvedValue(results)
    AWSMock.mock('Athena', 'getQueryResults', getQueryResultsSpy)
  }
})
