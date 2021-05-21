/*
 * © 2021 ThoughtWorks, Inc.
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
import MemoryEstimator from '../../../domain/MemoryEstimator'
import { StorageEstimator } from '../../../domain/StorageEstimator'
import { CLOUD_CONSTANTS } from '../../../domain/FootprintEstimationConstants'
import {
  GetQueryExecutionOutput,
  GetQueryResultsOutput,
} from 'aws-sdk/clients/athena'
import { EstimationResult } from '@cloud-carbon-footprint/common'
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
} from '../../../../test/fixtures/athena.fixtures'
import { ServiceWrapper } from '../ServiceWrapper'

jest.mock('@cloud-carbon-footprint/common', () => ({
  ...jest.requireActual('@cloud-carbon-footprint/common'),
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

  // beforeEach(() => {
  //   ;(configLoader as jest.Mock).mockReturnValue({
  //     AWS: {
  //       ATHENA_DB_NAME: 'test-db',
  //       ATHENA_DB_TABLE: 'test-table',
  //       ATHENA_QUERY_RESULT_LOCATION: 'test-location',
  //       ATHENA_REGION: 'test-region',
  //     },
  //   })
  // })

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
      new MemoryEstimator(CLOUD_CONSTANTS.AWS.MEMORY_COEFFICIENT),
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
            co2e: 8.607126311999999e-7,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountName: '123456789',
            serviceName: 'AmazonEC2',
            cost: 3,
            region: 'us-east-1',
          },
          {
            kilowattHours: 0.0010351199999999998,
            co2e: 4.5564636743999993e-7,
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
            co2e: 4.5564636743999993e-7,
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
            co2e: 0.0000012638885479200001,
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
            co2e: 9.629134542300002e-7,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountName: '123456789',
            serviceName: 'AmazonEC2',
            cost: 6,
            region: 'us-west-1',
          },
          {
            kilowattHours: 0.000013147083333333335,
            co2e: 4.612798805416667e-9,
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
      new MemoryEstimator(CLOUD_CONSTANTS.AWS.MEMORY_COEFFICIENT),
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
            co2e: 4.708412284344377e-19,
            cost: 9,
            region: 'us-west-1',
            serviceName: 'AmazonS3',
            usesAverageCPUConstant: false,
            kilowattHours: 1.3419594324659556e-15,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 1.1814261933977831e-18,
            cost: 10,
            region: 'us-east-2',
            serviceName: 'AmazonCloudWatch',
            usesAverageCPUConstant: false,
            kilowattHours: 2.6839188649319113e-15,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.0000011410104946500003,
            cost: 11,
            region: 'us-east-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0027444300000000004,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.0000017776863770400002,
            cost: 12,
            region: 'us-west-1',
            serviceName: 'AmazonRDS',
            usesAverageCPUConstant: false,
            kilowattHours: 0.005066640000000001,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 3.6318323831999994e-7,
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
      new MemoryEstimator(CLOUD_CONSTANTS.AWS.MEMORY_COEFFICIENT),
      getServiceWrapper(),
    )
    const result = await athenaService.getEstimates(startDate, endDate)

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-30'),
        serviceEstimates: [
          {
            kilowattHours: 0.0189318,
            co2e: 0.000007870990509,
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
            co2e: 2.3542061421721883e-9,
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
      new MemoryEstimator(CLOUD_CONSTANTS.AWS.MEMORY_COEFFICIENT),
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
            accountName: '123456789',
            serviceName: 'AmazonKinesisAnalytics',
            cost: 912,
            region: 'us-east-2',
          },
          {
            kilowattHours: 0.037493135999999996,
            co2e: 0.000013154879190095999,
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
            kilowattHours: 0.6775231545,
            co2e: 0.00028168363909914754,
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
      new MemoryEstimator(CLOUD_CONSTANTS.AWS.MEMORY_COEFFICIENT),
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
            co2e: 6.594881633999999e-9,
            cost: 2,
            region: 'us-east-2',
            serviceName: 'AmazonECS',
            usesAverageCPUConstant: false,
            kilowattHours: 0.000014981999999999998,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.000004151518924875001,
            cost: 2,
            region: 'us-west-1',
            serviceName: 'AmazonECS',
            usesAverageCPUConstant: true,
            kilowattHours: 0.011832375000000001,
          },
          {
            accountName: '123456789',
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
      new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT),
      new NetworkingEstimator(),
      new MemoryEstimator(CLOUD_CONSTANTS.AWS.MEMORY_COEFFICIENT),
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
            co2e: 0.00005585136970875,
            cost: 10,
            region: 'us-west-1',
            serviceName: 'AmazonDocDB',
            usesAverageCPUConstant: true,
            kilowattHours: 0.15918375,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.00003521725207570733,
            cost: 5,
            region: 'us-west-2',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.10037380066666667,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.0006165438795025607,
            cost: 25,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 1.7572311527999998,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.000034629593454714295,
            cost: 20,
            region: 'us-west-1',
            serviceName: 'ElasticMapReduce',
            usesAverageCPUConstant: true,
            kilowattHours: 0.0986988963,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.000006887116695375,
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
      new MemoryEstimator(CLOUD_CONSTANTS.AWS.MEMORY_COEFFICIENT),
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
            co2e: 0.0000021064809132000003,
            cost: 10,
            region: 'us-east-1',
            serviceName: 'AmazonRedshift',
            usesAverageCPUConstant: false,
            kilowattHours: 0.005066640000000001,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.0001214032761030355,
            cost: 10,
            region: 'us-west-1',
            serviceName: 'AmazonRedshift',
            usesAverageCPUConstant: true,
            kilowattHours: 0.3460153055,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.00051136199955456,
            cost: 15,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 1.45744896,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.000006642430279799999,
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
      new MemoryEstimator(CLOUD_CONSTANTS.AWS.MEMORY_COEFFICIENT),
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
      new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT),
      new NetworkingEstimator(),
      new MemoryEstimator(CLOUD_CONSTANTS.AWS.MEMORY_COEFFICIENT),
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
            co2e: 0.0001464982839139463,
            cost: 40,
            region: 'us-east-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.35236686008333334,
          },
          {
            accountName: '123456789',
            cloudProvider: 'AWS',
            co2e: 0.0000883784746890136,
            cost: 7,
            region: 'us-west-1',
            serviceName: 'AmazonEC2',
            usesAverageCPUConstant: true,
            kilowattHours: 0.2518902776,
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
      new MemoryEstimator(CLOUD_CONSTANTS.AWS.MEMORY_COEFFICIENT),
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
      new MemoryEstimator(CLOUD_CONSTANTS.AWS.MEMORY_COEFFICIENT),
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
