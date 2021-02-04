/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import AWSMock from 'aws-sdk-mock'
import AWS, { CloudWatch, CloudWatchLogs, CostExplorer, Athena as AWSAthena } from 'aws-sdk'
import CostAndUsageReports from '@services/aws/CostAndUsageReports'
import ComputeEstimator from '@domain/ComputeEstimator'
import { StorageEstimator } from '@domain/StorageEstimator'
import { CLOUD_CONSTANTS } from '@domain/FootprintEstimationConstants'
import { GetQueryExecutionOutput, GetQueryResultsOutput } from 'aws-sdk/clients/athena'
import { EstimationResult } from '@application/EstimationResult'
import config from '@application/ConfigLoader'
import {
  athenaMockGetQueryResultsWithEC2EBSLambda,
  athenaMockGetQueryResultsWithNetworkingGlueECSDynamoDB,
  athenaMockGetQueryResultsWithS3CloudWatchRDS,
  athenaMockGetQueryResultsWithKenesisESAndEc2Spot,
  athenaMockGetQueryResultsWithECSEksKafkaAndUnknownServices,
  athenaMockGetQueryResultsWithDocDBComputeEbsOptimizedSpotUsage,
  athenaMockGetQueryResultsWithRedshiftStorageComputeSavingsPlan,
} from '../../../fixtures/athena.fixtures'
import { ServiceWrapper } from '@services/aws/ServiceWrapper'

jest.mock('@application/ConfigLoader')

describe('CostAndUsageReports Service', () => {
  const startDate = new Date('2020-10-01')
  const endDate = new Date('2020-11-03')

  const startQueryExecutionResponse = { QueryExecutionId: 'some-execution-id' }
  const getQueryExecutionResponse = { QueryExecution: { Status: { State: 'SUCCEEDED' } } }
  const getQueryExecutionFailedResponse = { QueryExecution: { Status: { State: 'FAILED', StateChangeReason: 'TEST' } } }
  const getServiceWrapper = () =>
    new ServiceWrapper(new CloudWatch(), new CloudWatchLogs(), new CostExplorer(), new AWSAthena())

  beforeAll(() => {
    AWSMock.setSDKInstance(AWS)
  })

  beforeEach(() => {
    ;(config as jest.Mock).mockReturnValue({
      AWS: {
        ATHENA_DB_NAME: 'test-db',
        ATHENA_DB_TABLE: 'test-table',
        ATHENA_QUERY_RESULT_LOCATION: 'test-location',
        ATHENA_REGION: 'test-region',
      },
    })
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
      new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT, CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT, CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS),
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

    expect(getQueryExecutionSpy).toHaveBeenCalledWith(startQueryExecutionResponse, expect.anything())
    expect(getQueryResultsSpy).toHaveBeenCalledWith(startQueryExecutionResponse, expect.anything())

    // then

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            wattHours: 9.815999999999999,
            co2e: 0.000004461371999999999,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountName: '123456789',
            serviceName: 'AmazonEC2',
            cost: 3,
            region: 'us-east-1',
          },
          {
            wattHours: 4.9079999999999995,
            co2e: 0.0000023318153399999996,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountName: '123456789',
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
            wattHours: 4.9079999999999995,
            co2e: 0.0000023318153399999996,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountName: '123456789',
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
            wattHours: 3.2140799999999996,
            co2e: 0.0000014607993599999999,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountName: '123456789',
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
            wattHours: 2.99088,
            co2e: 0.00000105139301904,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountName: '123456789',
            serviceName: 'AmazonEC2',
            cost: 6,
            region: 'us-west-1',
          },
          {
            wattHours: 0.023333333333333334,
            co2e: 8.202436666666668e-9,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountName: '123456789',
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
      new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT, CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT, CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(startDate, endDate)

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-30'),
        serviceEstimates: [
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 5.264441147446633e-19,
            cost: 9,
            region: 'us-west-1',
            serviceName: 'AmazonS3',
            usesAverageCPUConstant: false,
            wattHours: 1.4975666999816895e-12,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 1.4230028539896011e-18,
            cost: 10,
            region: 'us-east-2',
            serviceName: 'AmazonCloudWatch',
            usesAverageCPUConstant: false,
            wattHours: 2.995133399963379e-12,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.0000013593549600000002,
            cost: 11,
            region: 'us-east-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: false,
            wattHours: 2.99088,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.0000036084159384000003,
            cost: 25,
            region: 'us-west-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: true,
            wattHours: 10.264800000000001,
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
      new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT, CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT, CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(startDate, endDate)

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-30'),
        serviceEstimates: [
          {
            wattHours: 19.631999999999998,
            co2e: 0.000008922743999999999,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountName: '123456789',
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
            wattHours: 0.007487833499908447,
            co2e: 2.6322205737233162e-9,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountName: '123456789',
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
      new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT, CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT, CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(startDate, endDate)

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-30'),
        serviceEstimates: [
          {
            wattHours: 8.34768,
            co2e: 0.0000039660245064,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountName: '123456789',
            serviceName: 'AmazonKinesisAnalytics',
            cost: 912,
            region: 'us-east-2',
          },
          {
            wattHours: 39.640319999999996,
            co2e: 0.000013934880610559998,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountName: '123456789',
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
            wattHours: 530.064,
            co2e: 0.00024091408799999998,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountName: '123456789',
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
    mockGetQueryResults(athenaMockGetQueryResultsWithECSEksKafkaAndUnknownServices)

    // when
    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT, CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT, CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(startDate, endDate)

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-30'),
        serviceEstimates: [
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 7.5256632e-9,
            cost: 2,
            region: 'us-east-2',
            serviceName: 'AmazonECS',
            usesAverageCPUConstant: false,
            wattHours: 0.01584,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.00000431330991,
            cost: 2,
            region: 'us-west-1',
            serviceName: 'AmazonECS',
            usesAverageCPUConstant: true,
            wattHours: 12.27,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.000012077267747999998,
            cost: 4,
            region: 'us-west-1',
            serviceName: 'AmazonMSK',
            usesAverageCPUConstant: true,
            wattHours: 34.355999999999995,
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
    mockGetQueryResults(athenaMockGetQueryResultsWithDocDBComputeEbsOptimizedSpotUsage)

    // when
    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT, CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT, CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(startDate, endDate)

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-30'),
        serviceEstimates: [
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.00005175971891999999,
            cost: 10,
            region: 'us-west-1',
            serviceName: 'AmazonDocDB',
            usesAverageCPUConstant: true,
            wattHours: 147.23999999999998,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.0005244984850560001,
            cost: 30,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            wattHours: 1492.0320000000002,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.000020703887567999997,
            cost: 20,
            region: 'us-west-1',
            serviceName: 'ElasticMapReduce',
            usesAverageCPUConstant: true,
            wattHours: 58.895999999999994,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.000007807400999999999,
            cost: 20,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            wattHours: 17.177999999999997,
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
    mockGetQueryResults(athenaMockGetQueryResultsWithRedshiftStorageComputeSavingsPlan)

    // when
    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT, CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT, CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(startDate, endDate)

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-30'),
        serviceEstimates: [
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.0000024346656000000003,
            cost: 10,
            region: 'us-east-1',
            serviceName: 'AmazonRedshift',
            usesAverageCPUConstant: false,
            wattHours: 5.356800000000001,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 2.87553994e-8,
            cost: 10,
            region: 'us-west-1',
            serviceName: 'AmazonRedshift',
            usesAverageCPUConstant: true,
            wattHours: 0.0818,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.0006073140353279999,
            cost: 15,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            wattHours: 1727.6159999999998,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.000006901295856,
            cost: 15,
            region: 'us-west-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: true,
            wattHours: 19.631999999999998,
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
      new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT, CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT, CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS),
      getServiceWrapper(),
    )
    await expect(() => athenaService.getEstimates(startDate, endDate)).rejects.toThrow(
      `Athena query failed. Reason TEST. Query ID: some-execution-id`,
    )
  })

  it('throws an error when the query start fail', async () => {
    mockStartQueryExecutionFailed('Start failed')
    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT, CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT, CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS),
      getServiceWrapper(),
    )
    await expect(() => athenaService.getEstimates(startDate, endDate)).rejects.toThrow(
      `Athena start query failed. Reason Start failed.`,
    )
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
