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
      { VarCharValue: 'line_item_product_code' },
      { VarCharValue: 'line_item_usage_type' },
      { VarCharValue: 'line_item_usage_account_id' },
      { VarCharValue: 'line_item_usage_amount' },
      { VarCharValue: 'product_instance_type' },
      { VarCharValue: 'product_region' },
      { VarCharValue: 'product_vcpu' },
      { VarCharValue: 'pricing_unit' },
      { VarCharValue: 'line_item_usage_start_date' },
      { VarCharValue: 'line_item_usage_end_date' },
    ],
  }

  const queryResultsData = [
    {
      Data: [
        { VarCharValue: 'AmazonEC2' },
        { VarCharValue: 'USE2-BoxUsage:t2.micro' },
        { VarCharValue: '921261756131' },
        { VarCharValue: '2' },
        { VarCharValue: 't2.micro' },
        { VarCharValue: 'us-east-1' },
        { VarCharValue: '1' },
        { VarCharValue: 'Hrs' },
        { VarCharValue: '2020-11-02 15:00:00.000' },
        { VarCharValue: '2020-11-02 16:00:00.000' },
      ],
    },
    {
      Data: [
        { VarCharValue: 'AmazonEC2' },
        { VarCharValue: 'USE2-BoxUsage:t2.micro' },
        { VarCharValue: '921261756131' },
        { VarCharValue: '2' },
        { VarCharValue: 't2.micro' },
        { VarCharValue: 'us-east-1' },
        { VarCharValue: '1' },
        { VarCharValue: 'Hrs' },
        { VarCharValue: '2020-11-02 18:00:00.000' },
        { VarCharValue: '2020-11-02 19:00:00.000' },
      ],
    },
    {
      Data: [
        { VarCharValue: 'AmazonEC2' },
        { VarCharValue: 'USE2-BoxUsage:t2.micro' },
        { VarCharValue: '921261756131' },
        { VarCharValue: '2' },
        { VarCharValue: 't2.micro' },
        { VarCharValue: 'us-east-2' },
        { VarCharValue: '1' },
        { VarCharValue: 'Hrs' },
        { VarCharValue: '2020-11-02 16:00:00.000' },
        { VarCharValue: '2020-11-02 17:00:00.000' },
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

  it('Gets Estimates for EC2', async () => {
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
            serviceName: 'AmazonEC2',
            cost: 0,
            region: 'us-east-1',
          },
          {
            wattHours: 4.692,
            co2e: 0.0028301540308512,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountName: '921261756131',
            serviceName: 'AmazonEC2',
            cost: 0,
            region: 'us-east-2',
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
