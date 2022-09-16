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
  athenaMockGetQueryResultsWithX86AndARMLambdas,
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
            kilowattHours: 0.05770100142797993,
            co2e: 0.000021872660910302922,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AmazonEC2',
            cost: 3,
            region: 'us-east-1',
          },
          {
            kilowattHours: 0.026714859604492512,
            co2e: 0.000010969335072481462,
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
            kilowattHours: 0.026714859604492512,
            co2e: 0.000010969335072481462,
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
            co2e: 0.0000023047273897920002,
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
            co2e: 0.00000265249433943,
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
            co2e: 4.306656863333334e-9,
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
            co2e: 1.2970051334377785e-18,
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
            co2e: 1.1020385572919622e-18,
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
            co2e: 0.00000104032833567,
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
            co2e: 0.0000016323042088800001,
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
            co2e: 0.000010876784219211461,
            cost: 13,
            region: 'us-west-2',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: true,
            kilowattHours: 0.03376132322432609,
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
            co2e: 0.000007296926622400001,
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
            co2e: 0.000004056674208111697,
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
            co2e: 4.323350444792595e-9,
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
            co2e: 0.0000032072878305600005,
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
            co2e: 0.000012079051145711998,
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
            kilowattHours: 0.6890324985198378,
            co2e: 0.0002611908601814164,
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
            co2e: 0.0000021890779867200004,
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
            co2e: 6.151729056e-9,
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
            co2e: 0.000003875991177,
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
            co2e: 0.000022245928045882443,
            cost: 4,
            region: 'us-west-1',
            serviceName: 'AmazonMSK',
            usesAverageCPUConstant: true,
            kilowattHours: 0.06905092093815457,
          },
          {
            accountId: '123456789',
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.00005058906244549772,
            cost: 4,
            kilowattHours: 0.07143329913230403,
            region: 'ap-south-1',
            serviceName: 'AmazonMSK',
            usesAverageCPUConstant: true,
          },
          {
            accountId: '123456789',
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.000009827074180887886,
            cost: 2,
            kilowattHours: 0.030503044014091717,
            region: 'us-west-1',
            serviceName: 'AmazonEKS',
            usesAverageCPUConstant: false,
          },
          {
            accountId: '123456789',
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.00001638006587014448,
            cost: 4,
            kilowattHours: 0.05084340069015286,
            region: 'us-west-1',
            serviceName: 'AmazonRoute53',
            usesAverageCPUConstant: false,
          },
          {
            accountId: '123456789',
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.00001638006587014448,
            cost: 4,
            kilowattHours: 0.05084340069015286,
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
            co2e: 0.00024507357814768403,
            cost: 10,
            region: 'us-west-1',
            serviceName: 'AmazonDocDB',
            usesAverageCPUConstant: true,
            kilowattHours: 0.7607035424102532,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.00003433380539549175,
            cost: 5,
            region: 'us-west-2',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.10657145330059178,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0005710134557465154,
            cost: 25,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 1.7724144799017756,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0000015503964708,
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
            co2e: 0.0000352634822436915,
            cost: 20,
            region: 'us-west-1',
            serviceName: 'ElasticMapReduce',
            usesAverageCPUConstant: true,
            kilowattHours: 0.10945715186127536,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000006384810794599999,
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
            co2e: 0.0000019206061581600003,
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
            co2e: 3.36842537841772e-8,
            cost: 10,
            region: 'us-west-1',
            serviceName: 'AmazonRedshift',
            usesAverageCPUConstant: true,
            kilowattHours: 0.00010455525793820347,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000980231861015034,
            cost: 15,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 3.0426203211844607,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0000372095152992,
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
            co2e: 0.000010969335072481462,
            cost: 5,
            region: 'us-east-2',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.026714859604492512,
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
            co2e: 0.0000352634822436915,
            cost: 10,
            region: 'us-west-1',
            serviceName: 'ElasticMapReduce',
            usesAverageCPUConstant: true,
            kilowattHours: 0.10945715186127536,
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
            co2e: 0.00003972805061187215,
            cost: 20,
            region: 'ca-central-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.33106708843226795,
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
            co2e: 0.000980231861015034,
            cost: 25,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 3.0426203211844607,
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
            co2e: 0.0006772029778100001,
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
            co2e: 0.00030781953536818184,
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
            co2e: 0.00024514479883738853,
            cost: 40,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.6467023123425776,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.00009050285872947217,
            cost: 7,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.28091908460355086,
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
            co2e: 5.2770326499238005e-9,
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
            co2e: 4.881708673018737e-9,
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
            co2e: 2.1868968330067223e-12,
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
            co2e: 4.0164368025232615e-8,
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
            co2e: 2.0136414117908633e-10,
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
            co2e: 3.789605322904069e-10,
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
            co2e: 0.00003434768205111858,
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
            co2e: 0.000014937679975347812,
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
            co2e: 5.4296762213410694e-21,
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
            co2e: 1.9361224383185108e-8,
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
            co2e: 2.0628142494769554e-9,
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
            co2e: 0.000015757250400000002,
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
            co2e: 1.8739312820855767,
            cost: 20,
            region: 'us-east-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: true,
            kilowattHours: 4943.5097095398905,
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
            co2e: 7.299937607233535e-9,
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
            co2e: 2.6046356737190398e-9,
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
            co2e: 0.000020543884613385032,
            cost: 6,
            region: 'ap-southeast-1',
            serviceName: 'AmazonDocDB',
            usesAverageCPUConstant: true,
            kilowattHours: 0.05035265836613979,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 1.3429178158928698e-23,
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
            co2e: 8.006204454537234e-11,
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
            co2e: 1.2479075634499893e-10,
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
            co2e: 0.000980231861015034,
            cost: 552,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 3.0426203211844607,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.02197391656424383,
            cost: 10516.725,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: false,
            kilowattHours: 57.968118111066396,
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
            co2e: 1.6530578359379434e-18,
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
            co2e: 0.0006472920557434965,
            cost: 600,
            region: 'us-east-2',
            serviceName: 'AmazonCloudWatch',
            usesAverageCPUConstant: false,
            kilowattHours: 1.576423391028661,
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
            co2e: 0.0006772029778100001,
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
            co2e: 0.02524620096762857,
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
            co2e: 0.013759101952724019,
            cost: 10,
            region: 'eu-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 49.38658274488162,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.00005646263616,
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
            co2e: 6.902213499415666e-17,
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
            co2e: 7.477397957700305e-17,
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
            co2e: 0.00013284196720080927,
            cost: 10,
            region: 'eu-west-1',
            serviceName: 'AmazonApiGateway',
            usesAverageCPUConstant: false,
            kilowattHours: 0.4768196956238667,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.00013284196720080927,
            cost: 10,
            region: 'eu-west-1',
            serviceName: 'AWSDirectConnect',
            usesAverageCPUConstant: false,
            kilowattHours: 0.4768196956238667,
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.00013284196720080927,
            cost: 10,
            region: 'eu-west-1',
            serviceName: 'AWSDirectoryService',
            usesAverageCPUConstant: false,
            kilowattHours: 0.4768196956238667,
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
            co2e: 0.000011733898965323593,
            cost: 5,
            kilowattHours: 0.02857688833467344,
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
            co2e: 0.01932281153902049,
            cost: 10,
            kilowattHours: 50.97439130876038,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
          },
          {
            accountId: '123456789',
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.054792520029449,
            cost: 10,
            kilowattHours: 133.44240742861564,
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

  it('returns estimates for both x86 and ARM Lambdas', async () => {
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(athenaMockGetQueryResultsWithX86AndARMLambdas)

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
            co2e: 0.0000000012668275386111113,
            cost: 8,
            kilowattHours: 0.000003341944444444445,
            region: 'us-east-1',
            serviceName: 'AWSLambda',
            usesAverageCPUConstant: true,
          },
        ],
        groupBy: grouping,
        periodStartDate: new Date('2022-01-01T00:00:00.000Z'),
        periodEndDate: new Date('2022-01-01T23:59:59.000Z'),
      },
      {
        timestamp: new Date('2022-01-02'),
        serviceEstimates: [
          {
            accountId: '123456789',
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.0000000009035109614999999,
            cost: 9,
            kilowattHours: 0.0000023834999999999997,
            region: 'us-east-1',
            serviceName: 'AWSLambda',
            usesAverageCPUConstant: true,
          },
        ],
        groupBy: grouping,
        periodStartDate: new Date('2022-01-02T00:00:00.000Z'),
        periodEndDate: new Date('2022-01-02T23:59:59.000Z'),
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
        kilowattHours: 0.014425250356994983,
        co2e: 0.000005468165227575731,
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
