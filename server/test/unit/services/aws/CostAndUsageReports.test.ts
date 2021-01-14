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
  athenaMockGetQueryResultsWithNetworkingGlueECS,
  athenaMockGetQueryResultsWithS3CloudWatchRDS,
  athenaMockGetQueryResultsWithKenesisESAndEc2Spot,
  athenaMockGetQueryResultsWithECSEksKafkaAndUnknownServices,
  athenaMockGetQueryResultsWithDocDBComputeEbsOptimizedSpotUsage,
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
            wattHours: 9.384,
            co2e: 0.000031617362219616,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountName: '123456789',
            serviceName: 'AmazonEC2',
            cost: 3,
            region: 'us-east-1',
          },
          {
            wattHours: 4.692,
            co2e: 0.000028301540308512,
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
            wattHours: 4.692,
            co2e: 0.000028301540308512,
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
            co2e: 0.000010829148717265918,
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
            co2e: 0.000005725022265614881,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountName: '123456789',
            serviceName: 'AmazonEC2',
            cost: 6,
            region: 'us-west-1',
          },
          {
            wattHours: 0.02213333333333333,
            co2e: 4.2366736928799996e-8,
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
            co2e: 2.8665819764211776e-18,
            cost: 9,
            region: 'us-west-1',
            serviceName: 'AmazonS3',
            usesAverageCPUConstant: false,
            wattHours: 1.4975666999816895e-12,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 1.806625930273533e-17,
            cost: 10,
            region: 'us-east-2',
            serviceName: 'AmazonCloudWatch',
            usesAverageCPUConstant: false,
            wattHours: 2.995133399963379e-12,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.00001007712450078912,
            cost: 11,
            region: 'us-east-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: false,
            wattHours: 2.99088,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.0000192350090082888,
            cost: 25,
            region: 'us-west-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: true,
            wattHours: 10.0488,
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
    mockGetQueryResults(athenaMockGetQueryResultsWithNetworkingGlueECS)

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
            wattHours: 18.768,
            co2e: 0.000063234724439232,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountName: '123456789',
            serviceName: 'AWSGlue',
            cost: 5,
            region: 'us-east-1',
          },
          {
            wattHours: 0.01728,
            co2e: 3.307668136128e-8,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountName: '123456789',
            serviceName: 'AmazonECS',
            cost: 7,
            region: 'us-west-1',
          },
        ],
      },
      {
        timestamp: new Date('2020-10-31'),
        serviceEstimates: [
          {
            wattHours: 0.007487833499908447,
            co2e: 1.4332909882105887e-8,
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
            co2e: 0.00005035213171410049,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountName: '123456789',
            serviceName: 'AmazonKinesisAnalytics',
            cost: 912,
            region: 'us-east-2',
          },
          {
            wattHours: 39.640319999999996,
            co2e: 0.00007587790704277632,
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
            wattHours: 506.736,
            co2e: 0.001707337559859264,
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
            co2e: 9.554484196224e-8,
            cost: 2,
            region: 'us-east-2',
            serviceName: 'AmazonECS',
            usesAverageCPUConstant: false,
            wattHours: 0.01584,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.00002245309446573,
            cost: 2,
            region: 'us-west-1',
            serviceName: 'AmazonECS',
            usesAverageCPUConstant: true,
            wattHours: 11.73,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.000062868664504044,
            cost: 4,
            region: 'us-west-1',
            serviceName: 'AmazonMSK',
            usesAverageCPUConstant: true,
            wattHours: 32.844,
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Gets Estimates for DocumentDB Compute, ElasticMapReduce, Cloudfront Lambda Storage and EC2 Credits', async () => {
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
            co2e: 0.00026943713358876004,
            cost: 10,
            region: 'us-west-1',
            serviceName: 'AmazonDocDB',
            usesAverageCPUConstant: true,
            wattHours: 140.76000000000002,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.0027302962870327675,
            cost: 30,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            wattHours: 1426.368,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.000107774853435504,
            cost: 20,
            region: 'us-west-1',
            serviceName: 'ElasticMapReduce',
            usesAverageCPUConstant: true,
            wattHours: 56.304,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 3.190266335e-8,
            cost: 20,
            region: 'us-west-1',
            serviceName: 'AmazonCloudFront',
            usesAverageCPUConstant: false,
            wattHours: 0.016666666666666666,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.000055330383884328006,
            cost: 20,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            wattHours: 16.422,
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
