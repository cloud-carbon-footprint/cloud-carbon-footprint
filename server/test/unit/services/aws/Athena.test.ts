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
import {
  athenaMockGetQueryResultsWithEC2EBSLambda,
  athenaMockGetQueryResultsWithS3CloudWatchRDS,
} from '../../../fixtures/athena.fixtures'

jest.mock('@application/ConfigLoader')

describe('Athena Service', () => {
  const startDate = new Date('2020-10-01')
  const endDate = new Date('2020-11-03')

  const startQueryExecutionResponse = { QueryExecutionId: 'some-execution-id' }
  const getQueryExecutionResponse = { QueryExecution: { Status: { State: 'SUCCEEDED' } } }

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

  it('Gets Estimates for EC2, EBS Snapshot, EBS SDD Storage and Lambda across multiple days with accumulation', async () => {
    // given
    mockStartQueryExecution(startQueryExecutionResponse)
    mockGetQueryExecution(getQueryExecutionResponse)
    mockGetQueryResults(athenaMockGetQueryResultsWithEC2EBSLambda)

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
        timestamp: new Date('2020-10-29'),
        serviceEstimates: [
          {
            wattHours: 3.2140799999999996,
            co2e: 0.0010829148717265919,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountName: '921261756131',
            serviceName: 'EBS',
            cost: 0,
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
            serviceName: 'EBS',
            cost: 0,
            region: 'us-west-1',
          },
          {
            wattHours: 0.02213333333333333,
            co2e: 0.00000423667369288,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountName: '921261756131',
            serviceName: 'Lambda',
            cost: 0,
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
    const athenaService = new Athena(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT, CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT, CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS),
    )
    const result = await athenaService.getEstimates(startDate, endDate)

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-30'),
        serviceEstimates: [
          {
            wattHours: 1.196352,
            co2e: 0.00022900089062459521,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountName: '921261756131',
            serviceName: 'S3',
            cost: 0,
            region: 'us-west-1',
          },
          {
            wattHours: 2.392704,
            co2e: 0.0014432482673132545,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountName: '921261756131',
            serviceName: 'CloudWatch',
            cost: 0,
            region: 'us-east-2',
          },
          {
            wattHours: 2.99088,
            co2e: 0.001007712450078912,
            usesAverageCPUConstant: false,
            cloudProvider: 'AWS',
            accountName: '921261756131',
            serviceName: 'RDS',
            cost: 0,
            region: 'us-east-1',
          },
          {
            wattHours: 10.0488,
            co2e: 0.00192350090082888,
            usesAverageCPUConstant: true,
            cloudProvider: 'AWS',
            accountName: '921261756131',
            serviceName: 'RDS',
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
