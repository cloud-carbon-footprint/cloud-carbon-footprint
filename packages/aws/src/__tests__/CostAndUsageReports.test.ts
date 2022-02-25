/*
 * © 2021 Thoughtworks, Inc.
 */

import AWSMock from 'aws-sdk-mock'
import AWS, {
  CloudWatch,
  CloudWatchLogs,
  CostExplorer,
  Athena as AWSAthena,
  S3,
} from 'aws-sdk'
import {
  GetQueryExecutionOutput,
  GetQueryResultsOutput,
} from 'aws-sdk/clients/athena'
import {
  EstimationResult,
  GroupBy,
  LookupTableInput,
  LookupTableOutput,
} from '@cloud-carbon-footprint/common'
import {
  ComputeEstimator,
  NetworkingEstimator,
  MemoryEstimator,
  StorageEstimator,
  UnknownEstimator,
  EmbodiedEmissionsEstimator,
} from '@cloud-carbon-footprint/core'
import CostAndUsageReports from '../lib/CostAndUsageReports'
import { ServiceWrapper } from '../lib/ServiceWrapper'
import {
  athenaMockGetQueryResultsWithEC2EBSLambda,
  athenaMockGetQueryResultsWithNetworkingGlueECSDynamoDB,
  athenaMockGetQueryResultsWithS3CloudWatchRDS,
  athenaMockGetQueryResultsWithKinesisESAndEc2Spot,
  athenaMockGetQueryResultsWithECSEksKafkaAndUnknownServices,
  athenaMockGetQueryResultsWithDocDBComputeEbsOptimizedSpotUsage,
  athenaMockGetQueryResultsWithRedshiftStorageComputeSavingsPlan,
  athenaMockGetQueryResultsNetworking,
  athenaMockGetQueryResultsMemory,
  athenaMockGetQueryResultsS3WithReplicationFactors,
  athenaMockGetQueryResultsEC2EFSRDSWithReplicationFactors,
  athenaMockGetQueryResultsDatabasesWithReplicationFactors,
  athenaMockGetQueryResultsWithReclassifiedUnknowns,
  athenaMockGetQueryH1ApiFsxBackupDirectConnectDirectoryService,
  athenaMockGetQueryResultsWithEC2ElasticMapWithEmbodiedEmissions,
  athenaMockGetQueryResultsWithNoUsageAmount,
  athenaMockGetQueryResultsWithUnknownInstanceType,
  athenaMockGetQueryResultsWithGPUInstances,
} from './fixtures/athena.fixtures'
import { AWS_CLOUD_CONSTANTS } from '../domain'
import {} from '../lib/CostAndUsageTypes'

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
  const grouping = GroupBy.day
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
      new S3(),
      new AWSAthena(),
    )

  beforeAll(() => {
    AWSMock.setSDKInstance(AWS)
  })

  beforeEach(() => {
    AWS_CLOUD_CONSTANTS.KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT = {
      total: {},
    }
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
      new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

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
            kilowattHours: 0.05279417567351667,
            co2e: 0.000021949442507142924,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AmazonEC2',
            cost: 3,
            region: 'us-east-1',
          },
          {
            kilowattHours: 0.024990035163717835,
            co2e: 0.000011000288608611463,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AmazonEC2',
            cost: 3,
            region: 'us-east-2',
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
            kilowattHours: 0.024990035163717835,
            co2e: 0.000011000288608611463,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AmazonEC2',
            cost: 4,
            region: 'us-east-2',
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-11-03T23:59:59.000Z'),
        periodStartDate: new Date('2020-11-03T00:00:00.000Z'),
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
        groupBy: grouping,
        periodEndDate: new Date('2020-10-29T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-29T00:00:00.000Z'),
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
            kilowattHours: 0.00001336777777777778,
            co2e: 4.6902318788888896e-9,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AWSLambda',
            cost: 15,
            region: 'us-west-1',
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-30T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-30T00:00:00.000Z'),
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
      new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

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
            co2e: 0.000010906811629391462,
            cost: 13,
            region: 'us-west-2',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: true,
            kilowattHours: 0.03108584775563959,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-30T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-30T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Gets Estimates for Amazon Glue, ECS and DynamoDB Storage and excluded usage types', async () => {
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
      new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-30'),
        serviceEstimates: [
          {
            kilowattHours: 0.019249600000000002,
            co2e: 0.000008003117448000001,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AWSGlue',
            cost: 5,
            region: 'us-east-1',
          },
          {
            accountId: '123456789',
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.0000044492759507991384,
            cost: 10,
            kilowattHours: 0.010701677552402589,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: false,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-30T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-30T00:00:00.000Z'),
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
        groupBy: grouping,
        periodEndDate: new Date('2020-10-31T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-31T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Gets Estimates for Kinesis, ES & EC2 Spot Instance', async () => {
    // given
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(athenaMockGetQueryResultsWithKinesisESAndEc2Spot)

    // when
    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

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
        groupBy: grouping,
        periodEndDate: new Date('2020-10-30T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-30T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2020-10-31'),
        serviceEstimates: [
          {
            kilowattHours: 0.6887534624752125,
            co2e: 0.000286352695791382,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AmazonEC2',
            cost: 10,
            region: 'us-east-1',
          },
          {
            accountId: '123456789',
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.0000024009352344000006,
            cost: 14,
            kilowattHours: 0.005774880000000001,
            region: 'us-east-1',
            serviceName: 'AmazonES',
            usesAverageCPUConstant: true,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-31T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-31T00:00:00.000Z'),
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
      new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

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
            co2e: 0.000004221208691000001,
            cost: 2,
            region: 'us-west-1',
            serviceName: 'AmazonECS',
            usesAverageCPUConstant: true,
            kilowattHours: 0.012031000000000002,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000023928805021908376,
            cost: 4,
            region: 'us-west-1',
            serviceName: 'AmazonMSK',
            usesAverageCPUConstant: true,
            kilowattHours: 0.0682002417535958,
          },
          {
            accountId: '123456789',
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.000050586132329497715,
            cost: 4,
            kilowattHours: 0.0714493394484431,
            region: 'ap-south-1',
            serviceName: 'AmazonMSK',
            usesAverageCPUConstant: true,
          },
          {
            accountId: '123456789',
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.000010643760080225716,
            cost: 2,
            kilowattHours: 0.030336116240407784,
            region: 'us-west-1',
            serviceName: 'AmazonEKS',
            usesAverageCPUConstant: false,
          },
          {
            accountId: '123456789',
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.000017741352333543527,
            cost: 4,
            kilowattHours: 0.05056518773401297,
            region: 'us-west-1',
            serviceName: 'AmazonRoute53',
            usesAverageCPUConstant: false,
          },
          {
            accountId: '123456789',
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.000017741352333543527,
            cost: 4,
            kilowattHours: 0.05056518773401297,
            region: 'us-west-1',
            serviceName: '8icvdraalzbfrdevgamoddblf', // change because of embodied e
            usesAverageCPUConstant: false,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-30T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-30T00:00:00.000Z'),
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
      new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-30'),
        serviceEstimates: [
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000265199016670552,
            cost: 10,
            region: 'us-west-1',
            serviceName: 'AmazonDocDB',
            usesAverageCPUConstant: true,
            kilowattHours: 0.7558520800845692,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000037249414381429895,
            cost: 5,
            region: 'us-west-2',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.10616573053553939,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0006214440599476097,
            cost: 25,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 1.7711973116066184,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0000016884834764,
            cost: 20,
            region: 'us-west-1',
            serviceName: 'AmazonSimpleDB',
            usesAverageCPUConstant: true,
            kilowattHours: 0.0048124000000000005,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0000381484142025931,
            cost: 20,
            region: 'us-west-1',
            serviceName: 'ElasticMapReduce',
            usesAverageCPUConstant: true,
            kilowattHours: 0.1087279982745107,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0000070027277669999995,
            cost: 20,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.016843399999999998,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-30T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-30T00:00:00.000Z'),
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
      new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

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
            co2e: 3.6373933057209234e-8,
            cost: 10,
            region: 'us-west-1',
            serviceName: 'AmazonRedshift',
            usesAverageCPUConstant: true,
            kilowattHours: 0.00010367049360632625,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.001022510454548474,
            cost: 15,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 2.9142892899138806,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0000405236034336,
            cost: 15,
            region: 'us-west-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: true,
            kilowattHours: 0.1154976,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-30T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-30T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Gets Estimates for EC2 and ElasticMapReduce with Embodied Emissions', async () => {
    // given
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(
      athenaMockGetQueryResultsWithEC2ElasticMapWithEmbodiedEmissions,
    )

    // when
    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-30'),
        serviceEstimates: [
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000011000288608611463,
            cost: 5,
            region: 'us-east-2',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.024990035163717835,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-30T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-30T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0000381484142025931,
            cost: 10,
            region: 'us-west-1',
            serviceName: 'ElasticMapReduce',
            usesAverageCPUConstant: true,
            kilowattHours: 0.1087279982745107,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-28T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-28T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2020-10-29'),
        serviceEstimates: [
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000042239578611872153,
            cost: 20,
            region: 'ca-central-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.3249198354759396,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-29T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-29T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2020-10-31'),
        serviceEstimates: [
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.001022510454548474,
            cost: 25,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 2.9142892899138806,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-31T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-31T00:00:00.000Z'),
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
      new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

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
          {
            accountId: '123456789',
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.00033761006815909096,
            cost: 10,
            kilowattHours: 0.8120409090909092,
            region: 'us-east-1',
            serviceName: 'AmazonCloudWatch',
            usesAverageCPUConstant: false,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2021-01-01T23:59:59.000Z'),
        periodStartDate: new Date('2021-01-01T00:00:00.000Z'),
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
      new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      getServiceWrapper(),
    )

    const result = await athenaService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2021-01-01'),
        serviceEstimates: [
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000258145639248314,
            cost: 40,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.6209080810773508,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.00009770943717267216,
            cost: 7,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.27848474801323647,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2021-01-01T23:59:59.000Z'),
        periodStartDate: new Date('2021-01-01T00:00:00.000Z'),
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
      new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      getServiceWrapper(),
    )

    const result = await athenaService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

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
        groupBy: grouping,
        periodEndDate: new Date('2021-01-02T23:59:59.000Z'),
        periodStartDate: new Date('2021-01-02T00:00:00.000Z'),
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
        groupBy: grouping,
        periodEndDate: new Date('2021-01-03T23:59:59.000Z'),
        periodStartDate: new Date('2021-01-03T00:00:00.000Z'),
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
        groupBy: grouping,
        periodEndDate: new Date('2021-01-04T23:59:59.000Z'),
        periodStartDate: new Date('2021-01-04T00:00:00.000Z'),
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
        groupBy: grouping,
        periodEndDate: new Date('2021-01-05T23:59:59.000Z'),
        periodStartDate: new Date('2021-01-05T00:00:00.000Z'),
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
        groupBy: grouping,
        periodEndDate: new Date('2021-01-06T23:59:59.000Z'),
        periodStartDate: new Date('2021-01-06T00:00:00.000Z'),
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
        groupBy: grouping,
        periodEndDate: new Date('2021-01-07T23:59:59.000Z'),
        periodStartDate: new Date('2021-01-07T00:00:00.000Z'),
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
      new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      getServiceWrapper(),
    )

    const result = await athenaService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

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
            co2e: 2.0547473139226726,
            cost: 20,
            region: 'us-east-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: true,
            kilowattHours: 4942.207102554803,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2021-01-01T23:59:59.000Z'),
        periodStartDate: new Date('2021-01-01T00:00:00.000Z'),
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
      new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      getServiceWrapper(),
    )

    const result = await athenaService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

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
            co2e: 0.000020567484788990013,
            cost: 6,
            region: 'ap-southeast-1',
            serviceName: 'AmazonDocDB',
            usesAverageCPUConstant: true,
            kilowattHours: 0.05034879997304777,
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
        groupBy: grouping,
        periodEndDate: new Date('2021-01-01T23:59:59.000Z'),
        periodStartDate: new Date('2021-01-01T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('estimation for reclassified unknowns', async () => {
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(athenaMockGetQueryResultsWithReclassifiedUnknowns)

    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      getServiceWrapper(),
    )

    const result = await athenaService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2021-01-01'),
        serviceEstimates: [
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.001022510454548474,
            cost: 552,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 2.9142892899138806,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.02308402740334127,
            cost: 10516.725,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: false,
            kilowattHours: 55.5231504211405,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2021-01-01T23:59:59.000Z'),
        periodStartDate: new Date('2021-01-01T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2021-01-02'),
        serviceEstimates: [
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 1.7721392900966748e-18,
            cost: 500,
            region: 'us-east-2',
            serviceName: 'AmazonS3',
            usesAverageCPUConstant: false,
            kilowattHours: 4.025878297397867e-15,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0006754805005297028,
            cost: 600,
            region: 'us-east-2',
            serviceName: 'AmazonCloudWatch',
            usesAverageCPUConstant: false,
            kilowattHours: 1.5345307801677532,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2021-01-02T23:59:59.000Z'),
        periodStartDate: new Date('2021-01-02T00:00:00.000Z'),
      },
      {
        timestamp: new Date('2021-01-03'),
        serviceEstimates: [
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0007427421499500001,
            cost: 786,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: false,
            kilowattHours: 1.7864900000000001,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.027064863483754618,
            cost: 27051.45224,
            region: 'us-east-2',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: false,
            kilowattHours: 61.48492228020051,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2021-01-03T23:59:59.000Z'),
        periodStartDate: new Date('2021-01-03T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('estimation for H1 instances, Api Gateway, Fsx, Kinesis, Backup, DirectConnect and DirectoryService', async () => {
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(
      athenaMockGetQueryH1ApiFsxBackupDirectConnectDirectoryService,
    )

    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      getServiceWrapper(),
    )

    const result = await athenaService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2021-01-01'),
        serviceEstimates: [
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.01557463889088402,
            cost: 10,
            region: 'eu-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 49.286831933177275,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0000640423296,
            cost: 1000,
            region: 'eu-west-1',
            serviceName: 'AmazonFSx',
            usesAverageCPUConstant: false,
            kilowattHours: 0.2026656,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 7.828784873709081e-17,
            cost: 10,
            region: 'eu-west-1',
            serviceName: 'AmazonKinesis',
            usesAverageCPUConstant: false,
            kilowattHours: 2.4774635676294563e-13,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 8.48118361318484e-17,
            cost: 20,
            region: 'eu-west-1',
            serviceName: 'AWSBackup',
            usesAverageCPUConstant: false,
            kilowattHours: 2.6839188649319115e-13,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0001503719348123479,
            cost: 10,
            region: 'eu-west-1',
            serviceName: 'AmazonApiGateway',
            usesAverageCPUConstant: false,
            kilowattHours: 0.4758605532036326,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0001503719348123479,
            cost: 10,
            region: 'eu-west-1',
            serviceName: 'AWSDirectConnect',
            usesAverageCPUConstant: false,
            kilowattHours: 0.4758605532036326,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0001503719348123479,
            cost: 10,
            region: 'eu-west-1',
            serviceName: 'AWSDirectoryService',
            usesAverageCPUConstant: false,
            kilowattHours: 0.4758605532036326,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2021-01-01T23:59:59.000Z'),
        periodStartDate: new Date('2021-01-01T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('returns estimates for instance types with additional prefix', async () => {
    // Example Instance Type: ml.m5.xlarge or db.t2.micro
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(athenaMockGetQueryResultsWithUnknownInstanceType)

    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      getServiceWrapper(),
    )

    const result = await athenaService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-30'),
        serviceEstimates: [
          {
            accountId: '123456789',
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.000012303282883723591,
            cost: 5,
            kilowattHours: 0.027950127749623667,
            region: 'us-east-2',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-30T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-30T00:00:00.000Z'),
      },
    ]

    expect(result).toEqual(expectedResult)
  })

  it('returns estimates for GPU instances', async () => {
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(athenaMockGetQueryResultsWithGPUInstances)

    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      getServiceWrapper(),
    )

    const result = await athenaService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2022-01-01'),
        serviceEstimates: [
          {
            accountId: '123456789',
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.021190411684420526,
            cost: 10,
            kilowattHours: 50.96850713622332,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
          },
          {
            accountId: '123456789',
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.058734806910342365,
            cost: 10,
            kilowattHours: 133.43148914062064,
            region: 'us-east-2',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2022-01-01T23:59:59.000Z'),
        periodStartDate: new Date('2022-01-01T00:00:00.000Z'),
      },
    ]

    expect(result).toEqual(expectedResult)
  })

  it(' successfully return lookup table data from getEstimatesFromInputData function', () => {
    // given
    const inputData: LookupTableInput[] = [
      {
        serviceName: 'AmazonEC2',
        region: 'us-east-1',
        usageType: 'USE2-BoxUsage:t2.micro',
        usageUnit: 'Hrs',
        vCpus: '2',
      },
    ]

    // when
    const costAndUsageReportsService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
    )
    const result =
      costAndUsageReportsService.getEstimatesFromInputData(inputData)

    // then
    const expectedResult: LookupTableOutput[] = [
      {
        serviceName: 'AmazonEC2',
        region: 'us-east-1',
        usageType: 'USE2-BoxUsage:t2.micro',
        usageUnit: 'Hrs',
        vCpus: '2',
        kilowattHours: 0.013198543918379168,
        co2e: 0.000005487360626785731,
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
      new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      getServiceWrapper(),
    )
    await expect(() =>
      athenaService.getEstimates(startDate, endDate, grouping),
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
      new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      getServiceWrapper(),
    )
    await expect(() =>
      athenaService.getEstimates(startDate, endDate, grouping),
    ).rejects.toThrow(`Athena start query failed. Reason Start failed.`)
  })

  it('returns 0 kilowattHours when no usage amount', async () => {
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(athenaMockGetQueryResultsWithNoUsageAmount)

    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      getServiceWrapper(),
    )

    const result = await athenaService.getEstimates(
      startDate,
      endDate,
      grouping,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-30'),
        serviceEstimates: [
          {
            accountId: '123456789',
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0,
            cost: 5,
            kilowattHours: 0,
            region: 'us-east-2',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-30T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-30T00:00:00.000Z'),
      },
    ]

    expect(result).toEqual(expectedResult)
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
