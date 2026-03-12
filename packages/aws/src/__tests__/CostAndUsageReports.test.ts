/*
 * © 2021 Thoughtworks, Inc.
 */

import { mockClient } from 'aws-sdk-client-mock'
import {
  AccountDetailsOrIdList,
  configLoader,
  EstimationResult,
  GroupBy,
  Logger,
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
import CostAndUsageReports, {
  tagNameToAthenaColumn,
} from '../lib/CostAndUsageReports'
import { ServiceWrapper } from '../lib'
import {
  testAccountId,
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
  athenaMockGetQueryResultsWithTaggedResources,
} from './fixtures/athena.fixtures'
import { AWS_CLOUD_CONSTANTS } from '../domain'
import {} from '../lib/CostAndUsageTypes'
import { CloudWatchClient } from '@aws-sdk/client-cloudwatch'
import { GlueClient } from '@aws-sdk/client-glue'
import {
  AthenaClient,
  GetQueryExecutionCommand,
  GetQueryExecutionCommandOutput,
  GetQueryResultsCommand,
  GetQueryResultsCommandOutput,
  QueryExecutionState,
  StartQueryExecutionCommand,
} from '@aws-sdk/client-athena'
import { S3Client } from '@aws-sdk/client-s3'
import { CostExplorerClient } from '@aws-sdk/client-cost-explorer'
import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs'

const testAccountName = 'the-test-account'
const defaultMockConfig = {
  AWS: {
    ATHENA_DB_NAME: 'test-db',
    ATHENA_DB_TABLE: 'test-table',
    ATHENA_QUERY_RESULT_LOCATION: 'test-location',
    ATHENA_REGION: 'test-region',
    RESOURCE_TAG_NAMES: ['user:Environment', 'aws:CreatedBy'],
    accounts: [
      {
        id: testAccountId,
        name: testAccountName,
      },
    ],
  },
}

jest.mock('@cloud-carbon-footprint/common', () => ({
  ...(jest.requireActual('@cloud-carbon-footprint/common') as Record<
    string,
    unknown
  >),
  configLoader: jest.fn().mockImplementation(() => defaultMockConfig),
}))

describe('CostAndUsageReports Service', () => {
  const startDate = new Date('2020-10-01')
  const endDate = new Date('2020-11-03')
  const grouping = GroupBy.day
  const startQueryExecutionResponse = { QueryExecutionId: 'some-execution-id' }
  const getQueryExecutionResponse = {
    $metadata: {},
    QueryExecution: { Status: { State: QueryExecutionState.SUCCEEDED } },
  }
  const getQueryExecutionFailedResponse = {
    $metadata: {},
    QueryExecution: {
      Status: { State: QueryExecutionState.FAILED, StateChangeReason: 'TEST' },
    },
  }
  const getServiceWrapper = () => {
    const serviceWrapper = new ServiceWrapper(
      new CloudWatchClient(),
      new CloudWatchLogsClient(),
      new CostExplorerClient(),
      new S3Client(),
      new AthenaClient(),
      new GlueClient(),
    )
    // Ensures that tests pass product_vcpu column check by default
    serviceWrapper.getAthenaTableDescription = jest.fn().mockResolvedValue({
      Table: {
        StorageDescriptor: {
          Columns: [
            {
              Name: 'product_vcpu',
              Type: 'string',
            },
          ],
        },
      },
    })
    return serviceWrapper
  }
  const athenaClientMock = mockClient(AthenaClient)

  beforeEach(() => {
    AWS_CLOUD_CONSTANTS.KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT = {
      total: {},
    }
  })

  afterEach(() => {
    athenaClientMock.reset()
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
            kilowattHours: 0.059824212281930814,
            co2e: 0.000021843482807849633,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AmazonEC2',
            cost: 3,
            region: 'us-east-1',
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            kilowattHours: 0.02906788077266247,
            co2e: 0.000010933253120286804,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AmazonEC2',
            cost: 3,
            region: 'us-east-2',
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            kilowattHours: 0.02906788077266247,
            co2e: 0.000010933253120286804,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AmazonEC2',
            cost: 4,
            region: 'us-east-2',
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 0.0000022199653186305124,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AmazonEC2',
            cost: 5,
            region: 'us-east-1',
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 0.000002458873753734411,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AmazonEC2',
            cost: 6,
            region: 'us-west-1',
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            kilowattHours: 0.00001336777777777778,
            co2e: 3.992289585758778e-9,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AWSLambda',
            cost: 15,
            region: 'us-west-1',
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 2.4046587648924287e-18,
            cost: 9,
            region: 'us-west-1',
            serviceName: 'AmazonS3',
            usesAverageCPUConstant: false,
            kilowattHours: 8.051756594795733e-15,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 1.0094978899256603e-18,
            cost: 10,
            region: 'us-east-2',
            serviceName: 'AmazonCloudWatch',
            usesAverageCPUConstant: false,
            kilowattHours: 2.6839188649319113e-15,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000001002067678548495,
            cost: 11,
            region: 'us-east-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0027444300000000004,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000001513153079221176,
            cost: 12,
            region: 'us-west-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: false,
            kilowattHours: 0.005066640000000001,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000010852174599689635,
            cost: 13,
            region: 'us-west-2',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: true,
            kilowattHours: 0.036337408732018,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 0.000007028564031506401,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AWSGlue',
            cost: 5,
            region: 'us-east-1',
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0,
            cost: 10,
            kilowattHours: 0,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: false,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 4.0077646081540475e-9,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AmazonDynamoDB',
            cost: 13,
            region: 'us-west-1',
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 0.0000029379646255669026,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AmazonKinesisAnalytics',
            cost: 912,
            region: 'us-east-2',
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            kilowattHours: 0.037493135999999996,
            co2e: 0.000011197332786236701,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AmazonES',
            cost: 73,
            region: 'us-west-1',
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            kilowattHours: 0.6891532389716569,
            co2e: 0.00025162900359655904,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountId: testAccountId,
            accountName: testAccountName,
            serviceName: 'AmazonEC2',
            cost: 10,
            region: 'us-east-1',
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0000021085692094519205,
            cost: 14,
            kilowattHours: 0.005774880000000001,
            region: 'us-east-1',
            serviceName: 'AmazonES',
            usesAverageCPUConstant: true,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 5.6351544692651995e-9,
            cost: 2,
            region: 'us-east-2',
            serviceName: 'AmazonECS',
            usesAverageCPUConstant: false,
            kilowattHours: 0.000014981999999999998,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0000035930606271829,
            cost: 2,
            region: 'us-west-1',
            serviceName: 'AmazonECS',
            usesAverageCPUConstant: true,
            kilowattHours: 0.012031000000000002,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000020866689482390682,
            cost: 4,
            region: 'us-west-1',
            serviceName: 'AmazonMSK',
            usesAverageCPUConstant: true,
            kilowattHours: 0.06986999864777486,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.00005415823674509772,
            cost: 4,
            kilowattHours: 0.056899662483555415,
            region: 'ap-south-1',
            serviceName: 'AmazonMSK',
            usesAverageCPUConstant: true,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000008290569205185581,
            cost: 2,
            kilowattHours: 0.027760132226266054,
            region: 'us-west-1',
            serviceName: 'AmazonEKS',
            usesAverageCPUConstant: false,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0,
            cost: 4,
            kilowattHours: 0,
            region: 'us-west-1',
            serviceName: 'AmazonRoute53',
            usesAverageCPUConstant: false,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0,
            cost: 4,
            kilowattHours: 0,
            region: 'us-west-1',
            serviceName: '8icvdraalzbfrdevgamoddblf', // change because of embodied e
            usesAverageCPUConstant: false,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 0.0002285793356609448,
            cost: 10,
            region: 'us-west-1',
            serviceName: 'AmazonDocDB',
            usesAverageCPUConstant: true,
            kilowattHours: 0.7653747800779428,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.00003194425440230792,
            cost: 5,
            region: 'us-west-2',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.10696210406432512,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0005296819531558785,
            cost: 25,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 1.7735864321929755,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0000014372242508731602,
            cost: 20,
            region: 'us-west-1',
            serviceName: 'AmazonSimpleDB',
            usesAverageCPUConstant: true,
            kilowattHours: 0.0048124000000000005,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000032899073277705624,
            cost: 20,
            region: 'us-west-1',
            serviceName: 'ElasticMapReduce',
            usesAverageCPUConstant: true,
            kilowattHours: 0.11015921846952131,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000006149993527568099,
            cost: 20,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.016843399999999998,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 0.0000018499710988587602,
            cost: 10,
            region: 'us-east-1',
            serviceName: 'AmazonRedshift',
            usesAverageCPUConstant: false,
            kilowattHours: 0.005066640000000001,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 3.147986841932977e-8,
            cost: 10,
            region: 'us-west-1',
            serviceName: 'AmazonRedshift',
            usesAverageCPUConstant: true,
            kilowattHours: 0.0001054071545822757,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0009455815167283017,
            cost: 15,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 3.166184044235751,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.00003449338202095584,
            cost: 15,
            region: 'us-west-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: true,
            kilowattHours: 0.1154976,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 0.000010933253120286804,
            cost: 5,
            region: 'us-east-2',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.02906788077266247,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 0.000032899073277705624,
            cost: 10,
            region: 'us-west-1',
            serviceName: 'ElasticMapReduce',
            usesAverageCPUConstant: true,
            kilowattHours: 0.11015921846952131,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 0.00003857525925987215,
            cost: 20,
            region: 'ca-central-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.3342453796020462,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 0.0009455815167283017,
            cost: 25,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 3.166184044235751,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 0.000652297157169285,
            cost: 22,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: false,
            kilowattHours: 1.7864900000000001,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0002964987078042205,
            cost: 10,
            kilowattHours: 0.8120409090909092,
            region: 'us-east-1',
            serviceName: 'AmazonCloudWatch',
            usesAverageCPUConstant: false,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 0.0002402042939625116,
            cost: 40,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.6578636199846581,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.00008459655004423367,
            cost: 7,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.28326298918595083,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 5.082956674181305e-9,
            cost: 10,
            region: 'us-east-1',
            serviceName: 'AmazonS3',
            usesAverageCPUConstant: false,
            kilowattHours: 0.000013921034560789199,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 4.7021717179043134e-9,
            cost: 5,
            region: 'us-east-1',
            serviceName: 'AmazonS3',
            usesAverageCPUConstant: false,
            kilowattHours: 0.000012878153246556,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 3.9761760600122215e-12,
            cost: 7,
            region: 'eu-north-1',
            serviceName: 'AmazonS3',
            usesAverageCPUConstant: false,
            kilowattHours: 4.970220075015277e-7,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 7.73744473690449e-8,
            cost: 10,
            region: 'us-east-1',
            serviceName: 'AmazonS3',
            usesAverageCPUConstant: false,
            kilowattHours: 0.00021191059160856002,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 1.866654319778587e-10,
            cost: 5,
            region: 'us-west-1',
            serviceName: 'AmazonS3',
            usesAverageCPUConstant: false,
            kilowattHours: 6.250303140268443e-7,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 3.512980565871229e-10,
            cost: 7,
            region: 'us-west-1',
            serviceName: 'AmazonS3',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0000011762860016401646,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 0.000046163245876723656,
            cost: 10,
            region: 'ap-south-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: false,
            kilowattHours: 0.048499974655632,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000014388309712007368,
            cost: 10,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: false,
            kilowattHours: 0.039406229407701006,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 5.944189689551422e-21,
            cost: 5,
            region: 'eu-west-1',
            serviceName: 'AmazonEFS',
            usesAverageCPUConstant: false,
            kilowattHours: 1.9489146523119416e-17,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 2.602146370008931e-8,
            cost: 10,
            region: 'ap-south-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: false,
            kilowattHours: 0.000027338639343667196,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 2.258285520784176e-9,
            cost: 10,
            region: 'eu-west-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: false,
            kilowattHours: 0.000007404214822243199,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0000186452352,
            cost: 7,
            region: 'eu-central-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0506664,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 1.8052186097881493,
            cost: 20,
            region: 'us-east-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: true,
            kilowattHours: 4944.073354842896,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 9.811107897934233e-9,
            cost: 10,
            region: 'ap-south-1',
            serviceName: 'AmazonDocDB',
            usesAverageCPUConstant: false,
            kilowattHours: 0.000010307734548479999,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 3.0820126299955197e-9,
            cost: 10,
            region: 'eu-central-1',
            serviceName: 'AmazonDocDB',
            usesAverageCPUConstant: false,
            kilowattHours: 0.000008375034320639999,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000024628131003582685,
            cost: 6,
            region: 'ap-southeast-1',
            serviceName: 'AmazonDocDB',
            usesAverageCPUConstant: true,
            kilowattHours: 0.049801085886766606,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 1.2935286794687938e-23,
            cost: 5,
            region: 'us-east-1',
            serviceName: 'AmazonDynamoDB',
            usesAverageCPUConstant: false,
            kilowattHours: 3.5426738031674176e-20,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 7.42178624385813e-11,
            cost: 5,
            region: 'us-west-1',
            serviceName: 'AmazonECR',
            usesAverageCPUConstant: false,
            kilowattHours: 2.4851100375076387e-7,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 1.5125679591983412e-10,
            cost: 5,
            region: 'ap-southeast-1',
            serviceName: 'AmazonSimpleDB',
            usesAverageCPUConstant: false,
            kilowattHours: 3.05859696924017e-7,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 0.0009455815167283017,
            cost: 552,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 3.166184044235751,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.022025333458708024,
            cost: 10516.725,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: false,
            kilowattHours: 60.32225886343338,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 3.0284936697769806e-18,
            cost: 500,
            region: 'us-east-2',
            serviceName: 'AmazonS3',
            usesAverageCPUConstant: false,
            kilowattHours: 8.051756594795733e-15,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0,
            cost: 600,
            region: 'us-east-2',
            serviceName: 'AmazonCloudWatch',
            usesAverageCPUConstant: false,
            kilowattHours: 0,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 0.000652297157169285,
            cost: 786,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: false,
            kilowattHours: 1.7864900000000001,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.023126220436503496,
            cost: 27051.45224,
            region: 'us-east-2',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: false,
            kilowattHours: 61.48492228020051,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            co2e: 0.015040657438484019,
            cost: 10,
            region: 'eu-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 49.31363094584925,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000061813008,
            cost: 1000,
            region: 'eu-west-1',
            serviceName: 'AmazonFSx',
            usesAverageCPUConstant: false,
            kilowattHours: 0.2026656,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 7.556263881269841e-17,
            cost: 10,
            region: 'eu-west-1',
            serviceName: 'AmazonKinesis',
            usesAverageCPUConstant: false,
            kilowattHours: 2.4774635676294563e-13,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 8.18595253804233e-17,
            cost: 20,
            region: 'eu-west-1',
            serviceName: 'AWSBackup',
            usesAverageCPUConstant: false,
            kilowattHours: 2.6839188649319115e-13,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0,
            cost: 10,
            region: 'eu-west-1',
            serviceName: 'AmazonApiGateway',
            usesAverageCPUConstant: false,
            kilowattHours: 0,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0,
            cost: 10,
            region: 'eu-west-1',
            serviceName: 'AWSDirectConnect',
            usesAverageCPUConstant: false,
            kilowattHours: 0,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0,
            cost: 10,
            region: 'eu-west-1',
            serviceName: 'AWSDirectoryService',
            usesAverageCPUConstant: false,
            kilowattHours: 0,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000011070178890246152,
            cost: 5,
            kilowattHours: 0.02943192081747751,
            region: 'us-east-2',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.018613096833583767,
            cost: 10,
            kilowattHours: 50.97693742301476,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0501970707025413,
            cost: 10,
            kilowattHours: 133.457302256266,
            region: 'us-east-2',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.000000001220236811025417,
            cost: 8,
            kilowattHours: 0.000003341944444444445,
            region: 'us-east-1',
            serviceName: 'AWSLambda',
            usesAverageCPUConstant: true,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
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
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0000000008702821029577499,
            cost: 9,
            kilowattHours: 0.0000023834999999999997,
            region: 'us-east-1',
            serviceName: 'AWSLambda',
            usesAverageCPUConstant: true,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
        ],
        groupBy: grouping,
        periodStartDate: new Date('2022-01-02T00:00:00.000Z'),
        periodEndDate: new Date('2022-01-02T23:59:59.000Z'),
      },
    ]

    expect(result).toEqual(expectedResult)
  })

  it('returns estimates for instances with tags', async () => {
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(athenaMockGetQueryResultsWithTaggedResources)

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
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.037226193667167534,
            cost: 20,
            kilowattHours: 101.95387484602952,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            tags: {
              'user:Environment': 'prod',
              'aws:CreatedBy': 'user-1',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.007755457013993236,
            cost: 4.2,
            kilowattHours: 21.240390592922818,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            tags: {
              'user:Environment': 'test',
              'aws:CreatedBy': 'user-1',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0007755457013993237,
            cost: 0.42,
            kilowattHours: 2.1240390592922815,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            tags: {
              'user:Environment': 'prod',
              'aws:CreatedBy': 'user-2',
            },
          },
          {
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0.0015510914027986474,
            cost: 0.82,
            kilowattHours: 4.248078118584563,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            tags: {
              'user:Environment': 'staging',
              'aws:CreatedBy': 'user-3',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2022-01-01T23:59:59.000Z'),
        periodStartDate: new Date('2022-01-01T00:00:00.000Z'),
      },
    ]

    expect(result).toEqual(expectedResult)
  })

  it('queries estimates for filtered accounts when list of accounts is provided', async () => {
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(athenaMockGetQueryResultsWithTaggedResources)

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
    await athenaService.getEstimates(startDate, endDate, grouping)

    const expectedWhereFilter = `AND line_item_usage_account_id IN ('${testAccountId}')`

    expect(startQueryExecutionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        QueryString: expect.stringContaining(expectedWhereFilter),
      }),
      expect.anything(),
    )
  })

  it('successfully return lookup table data from getEstimatesFromInputData function', async () => {
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
      await costAndUsageReportsService.getEstimatesFromInputData(inputData)

    // then
    const expectedResult: LookupTableOutput[] = [
      {
        serviceName: 'AmazonEC2',
        region: 'us-east-1',
        usageType: 'USE2-BoxUsage:t2.micro',
        vCpus: '2',
        kilowattHours: 0.014956053070482703,
        co2e: 0.000005460870701962408,
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('logs warning and ignores incorrectly formatted accounts', async () => {
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(athenaMockGetQueryResultsWithTaggedResources)

    // Override config mock to return invalid account list
    ;(configLoader as jest.Mock).mockReturnValue({
      ...configLoader(),
      AWS: {
        ...defaultMockConfig.AWS,
        accounts: 'invalid-accounts-list' as unknown as AccountDetailsOrIdList, // Let's just pretend this is possible
      },
    })

    const loggerSpy = jest.spyOn(Logger.prototype, 'warn')

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
    await athenaService.getEstimates(startDate, endDate, grouping)

    const expectedWhereFilter = `AND line_item_usage_account_id IN`

    expect(startQueryExecutionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        QueryString: expect.not.stringContaining(expectedWhereFilter),
      }),
      expect.anything(),
    )

    expect(loggerSpy).toHaveBeenCalledWith(
      'Configured list of AWS accounts is invalid. AWS Accounts must be a list of objects containing account details or a list of account IDs. Ignoring account filter...',
    )

    // Reset the config mock
    ;(configLoader as jest.Mock).mockReturnValue({
      ...configLoader(),
      AWS: {
        ...defaultMockConfig.AWS,
      },
    })
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
            accountId: testAccountId,
            accountName: testAccountName,
            cloudProvider: 'AWS',
            co2e: 0,
            cost: 5,
            kilowattHours: 0,
            region: 'us-east-2',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            tags: {
              'user:Environment': '',
              'aws:CreatedBy': '',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-10-30T23:59:59.000Z'),
        periodStartDate: new Date('2020-10-30T00:00:00.000Z'),
      },
    ]

    expect(result).toEqual(expectedResult)
  })

  describe('optional athena columns', () => {
    let athenaService
    beforeEach(() => {
      mockStartQueryExecution(startQueryExecutionResponse)
      mockGetQueryExecution(getQueryExecutionResponse)
      mockGetQueryResults(athenaMockGetQueryResultsWithNoUsageAmount)
    })

    afterEach(() => {
      jest.restoreAllMocks()
      startQueryExecutionSpy.mockClear()
      getQueryExecutionSpy.mockClear()
      getQueryResultsSpy.mockClear()
    })

    it('validates presence of product_vcpu column before including in query', async () => {
      const mockGetAthenaTable = jest.fn().mockResolvedValue({
        Table: {
          StorageDescriptor: {
            Columns: [
              {
                Name: 'column1',
                Type: 'string',
              },
              {
                Name: 'product_vcpu',
                Type: 'string',
              },
            ],
          },
        },
      })
      const serviceWrapper = getServiceWrapper()
      serviceWrapper.getAthenaTableDescription = mockGetAthenaTable

      athenaService = new CostAndUsageReports(
        new ComputeEstimator(),
        new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
        new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
        new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
        new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
        new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
        new EmbodiedEmissionsEstimator(
          AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
        ),
        serviceWrapper,
      )

      await athenaService.getEstimates(startDate, endDate, grouping)

      expect(mockGetAthenaTable).toHaveBeenCalledWith({
        DatabaseName: 'test-db',
        Name: 'test-table',
      })
      expect(startQueryExecutionSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          QueryString: expect.stringContaining('product_vcpu'),
        }),
        expect.anything(),
      )
    })

    it('excludes product_vcpu column in query if not present in athena table', async () => {
      const mockGetAthenaTable = jest.fn().mockResolvedValue({
        Table: {
          StorageDescriptor: {
            Columns: [
              {
                Name: 'column1',
                Type: 'string',
              },
            ],
          },
        },
      })
      const serviceWrapper = getServiceWrapper()
      serviceWrapper.getAthenaTableDescription = mockGetAthenaTable

      athenaService = new CostAndUsageReports(
        new ComputeEstimator(),
        new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
        new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
        new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
        new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
        new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
        new EmbodiedEmissionsEstimator(
          AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
        ),
        serviceWrapper,
      )

      await athenaService.getEstimates(startDate, endDate, grouping)

      expect(mockGetAthenaTable).toHaveBeenCalledWith({
        DatabaseName: 'test-db',
        Name: 'test-table',
      })
      expect(startQueryExecutionSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          QueryString: expect.not.stringContaining('product_vcpu'),
        }),
        expect.anything(),
      )
    })

    it('handles any errors from checking the athena description by ignoring the product_vcpu column', async () => {
      const mockGetAthenaTable = jest
        .fn()
        .mockRejectedValue(
          new Error('EntityNotFoundException: Database test-db not found'),
        )
      const serviceWrapper = getServiceWrapper()
      serviceWrapper.getAthenaTableDescription = mockGetAthenaTable

      const errorLoggerSpy = jest.spyOn(Logger.prototype, 'error')
      const warningLoggerSpy = jest.spyOn(Logger.prototype, 'warn')

      athenaService = new CostAndUsageReports(
        new ComputeEstimator(),
        new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
        new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
        new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
        new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
        new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
        new EmbodiedEmissionsEstimator(
          AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
        ),
        serviceWrapper,
      )

      await athenaService.getEstimates(startDate, endDate, grouping)

      expect(errorLoggerSpy).toHaveBeenCalledWith(
        'Error verifying schema for Athena table: "test-table"',
        new Error('EntityNotFoundException: Database test-db not found'),
      )
      expect(warningLoggerSpy).toHaveBeenCalledWith(
        `'product_vcpu' column could not be verified in Athena table schema. This may occur if there was an error fetching the schema or when there is no historical CPU usage (i.e. EC2) for the configured account. The CPU column will be excluded from Athena Query`,
      )
      expect(startQueryExecutionSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          QueryString: expect.not.stringContaining('product_vcpu'),
        }),
        expect.anything(),
      )
    })
  })

  const startQueryExecutionSpy = jest.fn()
  const getQueryExecutionSpy = jest.fn()
  const getQueryResultsSpy = jest.fn()

  function mockStartQueryExecution(response: { QueryExecutionId: string }) {
    startQueryExecutionSpy.mockResolvedValue(response)
    athenaClientMock
      .on(StartQueryExecutionCommand)
      .callsFake(startQueryExecutionSpy)
  }
  function mockStartQueryExecutionFailed(response: string) {
    startQueryExecutionSpy.mockRejectedValue(new Error(response))
    athenaClientMock
      .on(StartQueryExecutionCommand)
      .callsFake(startQueryExecutionSpy)
  }

  function mockGetQueryExecution(response: GetQueryExecutionCommandOutput) {
    getQueryExecutionSpy.mockResolvedValue(response)
    athenaClientMock
      .on(GetQueryExecutionCommand)
      .callsFake(getQueryExecutionSpy)
  }

  function mockGetQueryResults(results: GetQueryResultsCommandOutput) {
    getQueryResultsSpy.mockResolvedValue(results)
    athenaClientMock.on(GetQueryResultsCommand).callsFake(getQueryResultsSpy)
  }
})

describe('converting tag names to Athena column names', () => {
  it('replaces colons with underscores', () => {
    expect(tagNameToAthenaColumn('aws:user')).toEqual('resource_tags_aws_user')
  })

  it('replaces uppercase characters with their lowercase equivalents', () => {
    expect(tagNameToAthenaColumn('user:Environment')).toEqual(
      'resource_tags_user_environment',
    )
  })

  // This behaviour isn't documented anywhere I can find, but it's what AWS appears to do...
  it('prefixes uppercase characters in the tag name with an underscore', () => {
    expect(tagNameToAthenaColumn('user:CreatedBy')).toEqual(
      'resource_tags_user_created_by',
    )
  })

  it('correctly handles tag names that start with an uppercase character', () => {
    expect(tagNameToAthenaColumn('User:CreatedBy')).toEqual(
      'resource_tags_user_created_by',
    )
  })
})
