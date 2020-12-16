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
            co2e: 0.0031617362219616,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountName: '921261756131',
            serviceName: 'ec2',
            cost: 3,
            region: 'us-east-1',
          },
          {
            wattHours: 4.692,
            co2e: 0.0028301540308512,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountName: '921261756131',
            serviceName: 'ec2',
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
            co2e: 0.0028301540308512,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountName: '921261756131',
            serviceName: 'ec2',
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
            co2e: 0.0010829148717265919,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountName: '921261756131',
            serviceName: 'ebs',
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
            co2e: 0.000572502226561488,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountName: '921261756131',
            serviceName: 'ebs',
            cost: 6,
            region: 'us-west-1',
          },
          {
            wattHours: 0.02213333333333333,
            co2e: 0.00000423667369288,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountName: '921261756131',
            serviceName: 'lambda',
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
            accountName: '921261756131',
            cloudProvider: 'AWS',
            co2e: 2.8665819764211777e-16,
            cost: 9,
            region: 'us-west-1',
            serviceName: 's3',
            usesAverageCPUConstant: false,
            wattHours: 1.4975666999816895e-12,
          },
          {
            accountName: '921261756131',
            cloudProvider: 'AWS',
            co2e: 1.806625930273533e-15,
            cost: 10,
            region: 'us-east-2',
            serviceName: 'cloudwatch',
            usesAverageCPUConstant: false,
            wattHours: 2.995133399963379e-12,
          },
          {
            accountName: '921261756131',
            cloudProvider: 'AWS',
            co2e: 0.001007712450078912,
            cost: 11,
            region: 'us-east-1',
            serviceName: 'rds',
            usesAverageCPUConstant: false,
            wattHours: 2.99088,
          },
          {
            accountName: '921261756131',
            cloudProvider: 'AWS',
            co2e: 0.00192350090082888,
            cost: 25,
            region: 'us-west-1',
            serviceName: 'rds',
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
            co2e: 0.0063234724439232,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountName: '921261756131',
            serviceName: 'glue',
            cost: 5,
            region: 'us-east-1',
          },
          {
            wattHours: 0.01728,
            co2e: 0.000003307668136128,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountName: '921261756131',
            serviceName: 'ecs',
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
            co2e: 0.0000014332909882105887,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountName: '921261756131',
            serviceName: 'dynamodb',
            cost: 13,
            region: 'us-west-1',
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
