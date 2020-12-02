/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'
import Athena from '@services/aws/Athena'
import ComputeEstimator from '@domain/ComputeEstimator'
import { StorageEstimator } from '@domain/StorageEstimator'
import { CLOUD_CONSTANTS } from '@domain/FootprintEstimationConstants'
import { GetQueryExecutionOutput, GetQueryResultsOutput } from 'aws-sdk/clients/athena'
import { EstimationResult } from '@application/EstimationResult'
import config from '@application/ConfigLoader'

jest.mock('@application/ConfigLoader')

describe('Athena Service', () => {
  const startDate = new Date('2020-10-01')
  const endDate = new Date('2020-11-03')

  const startQueryExecutionResponse = { QueryExecutionId: 'some-execution-id' }
  const getQueryExecutionResponse = { QueryExecution: { Status: { State: 'SUCCEEDED' } } }

  const queryResultsHeaders = {
    Data: [
      { VarCharValue: 'day' },
      { VarCharValue: 'line_item_usage_account_id' },
      { VarCharValue: 'product_region' },
      { VarCharValue: 'line_item_product_code' },
      { VarCharValue: 'line_item_usage_type' },
      { VarCharValue: 'pricing_unit' },
      { VarCharValue: 'product_vcpu' },
      { VarCharValue: 'total_line_item_usage_amount' },
    ],
  }

  const queryResultsData = [
    {
      Data: [
        { VarCharValue: '2020-11-02' },
        { VarCharValue: '921261756131' },
        { VarCharValue: 'us-east-1' },
        { VarCharValue: 'AmazonEC2' },
        { VarCharValue: 'USE2-BoxUsage:t2.micro' },
        { VarCharValue: 'Hrs' },
        { VarCharValue: '1' },
        { VarCharValue: '2' },
      ],
    },
    {
      Data: [
        { VarCharValue: '2020-11-02' },
        { VarCharValue: '921261756131' },
        { VarCharValue: 'us-east-1' },
        { VarCharValue: 'AmazonEC2' },
        { VarCharValue: 'USE2-BoxUsage:t2.micro' },
        { VarCharValue: 'Hrs' },
        { VarCharValue: '1' },
        { VarCharValue: '2' },
      ],
    },
    {
      Data: [
        { VarCharValue: '2020-11-02' },
        { VarCharValue: '921261756131' },
        { VarCharValue: 'us-east-2' },
        { VarCharValue: 'AmazonEC2' },
        { VarCharValue: 'USE2-BoxUsage:t2.micro' },
        { VarCharValue: 'Hrs' },
        { VarCharValue: '1' },
        { VarCharValue: '2' },
      ],
    },
    {
      Data: [
        { VarCharValue: '2020-11-03' },
        { VarCharValue: '921261756131' },
        { VarCharValue: 'us-east-2' },
        { VarCharValue: 'AmazonEC2' },
        { VarCharValue: 'USE2-BoxUsage:t2.micro' },
        { VarCharValue: 'Hrs' },
        { VarCharValue: '1' },
        { VarCharValue: '2' },
      ],
    },
    {
      Data: [
        { VarCharValue: '2020-10-31' },
        { VarCharValue: '921261756131' },
        { VarCharValue: 'us-west-1' },
        { VarCharValue: 'AmazonEC2' },
        { VarCharValue: 'USW1-EBS:SnapshotUsage' },
        { VarCharValue: 'GB-Mo' },
        { VarCharValue: '' },
        { VarCharValue: '5' },
      ],
    },
  ]

  const queryResultsResponse = {
    ResultSet: {
      Rows: [queryResultsHeaders, ...queryResultsData],
    },
  }

  beforeAll(() => {
    AWSMock.setSDKInstance(AWS)
  })

  beforeEach(() => {
    ;(config as jest.Mock).mockReturnValue({
      AWS: {
        ATHENA_DB_NAME: 'test-db',
        ATHENA_DB_TABLE: 'test-table',
        ATHENA_QUERY_RESULT_LOCATION: 'test-location',
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

  it('Gets Estimates for EC2 and EBS', async () => {
    // given
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(queryResultsResponse)

    // when
    const athenaService = new Athena(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT, CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT, CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS),
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
            serviceName: 'EC2',
            cost: 0,
            region: 'us-east-1',
          },
          {
            wattHours: 4.692,
            co2e: 0.0028301540308512,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountName: '921261756131',
            serviceName: 'EC2',
            cost: 0,
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
            serviceName: 'EC2',
            cost: 0,
            region: 'us-east-2',
          },
        ],
      },
      {
        timestamp: new Date('2020-10-31'),
        serviceEstimates: [
          {
            wattHours: 2.99088,
            co2e: 0.000572502226561488,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountName: '921261756131',
            serviceName: 'EBS',
            cost: 0,
            region: 'us-west-1',
          },
        ],
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

  function mockGetQueryExecution(response: GetQueryExecutionOutput) {
    getQueryExecutionSpy.mockResolvedValue(response)
    AWSMock.mock('Athena', 'getQueryExecution', getQueryExecutionSpy)
  }

  function mockGetQueryResults(results: GetQueryResultsOutput) {
    getQueryResultsSpy.mockResolvedValue(results)
    AWSMock.mock('Athena', 'getQueryResults', getQueryResultsSpy)
  }
})
