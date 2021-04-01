/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import AWSMock from 'aws-sdk-mock'
import AWS, {
  CloudWatch,
  CloudWatchLogs,
  CostExplorer,
  Athena as AWSAthena,
} from 'aws-sdk'
import CostAndUsageReports from '../CostAndUsageReports'
import ComputeEstimator from '../../../domain/ComputeEstimator'
import NetworkingEstimator from '../../../domain/NetworkingEstimator'
import { StorageEstimator } from '../../../domain/StorageEstimator'
import { CLOUD_CONSTANTS } from '../../../domain/FootprintEstimationConstants'
import {
  GetQueryExecutionOutput,
  GetQueryResultsOutput,
} from 'aws-sdk/clients/athena'
import { EstimationResult } from '../../../application/EstimationResult'
import config from '../../../application/ConfigLoader'
import {
  athenaMockGetQueryResultsWithEC2EBSLambda,
  athenaMockGetQueryResultsWithNetworkingGlueECSDynamoDB,
  athenaMockGetQueryResultsWithS3CloudWatchRDS,
  athenaMockGetQueryResultsWithKenesisESAndEc2Spot,
  athenaMockGetQueryResultsWithECSEksKafkaAndUnknownServices,
  athenaMockGetQueryResultsWithDocDBComputeEbsOptimizedSpotUsage,
  athenaMockGetQueryResultsWithRedshiftStorageComputeSavingsPlan,
  athenaMockGetQueryResultsNetworking,
} from '../../../../test/fixtures/athena.fixtures'
import { ServiceWrapper } from '../ServiceWrapper'

jest.mock('../../../application/ConfigLoader')

describe('CostAndUsageReports Service', () => {
  const startDate = new Date('2020-10-01')
  const endDate = new Date('2020-11-03')

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
      new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT),
      new NetworkingEstimator(),
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
            kilowattHours: 0.0020702399999999997,
            co2e: 9.409240799999999e-7,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountName: '123456789',
            serviceName: 'AmazonEC2',
            cost: 3,
            region: 'us-east-1',
          },
          {
            kilowattHours: 0.0010351199999999998,
            co2e: 4.917906875999999e-7,
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
            kilowattHours: 0.0010351199999999998,
            co2e: 4.917906875999999e-7,
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
            kilowattHours: 0.0030399840000000003,
            co2e: 0.0000013816727280000002,
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
            kilowattHours: 0.0027444300000000004,
            co2e: 9.647577111900002e-7,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountName: '123456789',
            serviceName: 'AmazonEC2',
            cost: 6,
            region: 'us-west-1',
          },
          {
            kilowattHours: 0.000013147083333333335,
            co2e: 4.621633645416667e-9,
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
      new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT),
      new NetworkingEstimator(),
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
            co2e: 4.717430251730548e-19,
            cost: 9,
            region: 'us-west-1',
            serviceName: 'AmazonS3',
            usesAverageCPUConstant: false,
            kilowattHours: 1.3419594324659556e-15,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 1.2751432723234759e-18,
            cost: 10,
            region: 'us-east-2',
            serviceName: 'AmazonCloudWatch',
            usesAverageCPUConstant: false,
            kilowattHours: 2.6839188649319113e-15,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.0000012473434350000002,
            cost: 11,
            region: 'us-east-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0027444300000000004,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.0000017810911591200002,
            cost: 12,
            region: 'us-west-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: false,
            kilowattHours: 0.005066640000000001,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 3.6387883895999995e-7,
            cost: 13,
            region: 'us-west-2',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: true,
            kilowattHours: 0.0010351199999999998,
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
      new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT),
      new NetworkingEstimator(),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(startDate, endDate)

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-30'),
        serviceEstimates: [
          {
            kilowattHours: 0.0189318,
            co2e: 0.000008604503099999998,
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
            kilowattHours: 0.000006709797162329778,
            co2e: 2.358715125865274e-9,
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
      new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT),
      new NetworkingEstimator(),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(startDate, endDate)

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-30'),
        serviceEstimates: [
          {
            kilowattHours: 0.0078110700000000016,
            co2e: 0.0000037110784123500008,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountName: '123456789',
            serviceName: 'AmazonKinesisAnalytics',
            cost: 912,
            region: 'us-east-2',
          },
          {
            kilowattHours: 0.037493135999999996,
            co2e: 0.000013180074577487998,
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
            kilowattHours: 0.5730615,
            co2e: 0.00026045645175,
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
    mockGetQueryResults(
      athenaMockGetQueryResultsWithECSEksKafkaAndUnknownServices,
    )

    // when
    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT),
      new NetworkingEstimator(),
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
            co2e: 7.118023109999999e-9,
            cost: 2,
            region: 'us-east-2',
            serviceName: 'AmazonECS',
            usesAverageCPUConstant: false,
            kilowattHours: 0.000014981999999999998,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.000004159470280875001,
            cost: 2,
            region: 'us-west-1',
            serviceName: 'AmazonECS',
            usesAverageCPUConstant: true,
            kilowattHours: 0.011832375000000001,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.000013378133191150002,
            cost: 4,
            region: 'us-west-1',
            serviceName: 'AmazonMSK',
            usesAverageCPUConstant: true,
            kilowattHours: 0.03805655,
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
      new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT),
      new NetworkingEstimator(),
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
            co2e: 0.000055958341188750004,
            cost: 10,
            region: 'us-west-1',
            serviceName: 'AmazonDocDB',
            usesAverageCPUConstant: true,
            kilowattHours: 0.15918375,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.000029844448634,
            cost: 5,
            region: 'us-west-2',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.084898,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.0005239855281024,
            cost: 25,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 1.4905727999999998,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.000022933942613400002,
            cost: 20,
            region: 'us-west-1',
            serviceName: 'ElasticMapReduce',
            usesAverageCPUConstant: true,
            kilowattHours: 0.0652398,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.000007528940212499999,
            cost: 20,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.016565325,
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
      new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT),
      new NetworkingEstimator(),
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
            co2e: 0.0000023027878800000003,
            cost: 10,
            region: 'us-east-1',
            serviceName: 'AmazonRedshift',
            usesAverageCPUConstant: false,
            kilowattHours: 0.005066640000000001,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 2.7729801872499996e-8,
            cost: 10,
            region: 'us-west-1',
            serviceName: 'AmazonRedshift',
            usesAverageCPUConstant: true,
            kilowattHours: 0.00007888249999999999,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.0005123414052556801,
            cost: 15,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 1.45744896,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.0000066551524493999995,
            cost: 15,
            region: 'us-west-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: true,
            kilowattHours: 0.0189318,
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
      new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT),
      new NetworkingEstimator(),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(startDate, endDate)

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2021-01-01'),
        serviceEstimates: [
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.000811959705,
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

  it('throws an error when the query status fails', async () => {
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionFailedResponse)
    const athenaService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT),
      new NetworkingEstimator(),
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
      new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT),
      new NetworkingEstimator(),
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
