import cli from '@view/cli'
import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'
import {
  s3MockResponse,
  ec2MockResponse,
  ebsMockResponse,
  elastiCacheMockResponse,
  elastiCacheMockGetCostAndUsageResponse,
  rdsCPUUtilizationResponse,
  rdsCPUUsageResponse,
  rdsStorageResponse,
} from '@fixtures'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

afterEach(() => {
  AWSMock.restore()
})

describe('cli', () => {
  test('ebs, s3, ec2, elasticache, rds', async () => {
    const mockFunction = jest.fn()
    mockFunction
      .mockReturnValueOnce(s3MockResponse)
      .mockReturnValueOnce(ec2MockResponse)
      .mockReturnValueOnce(elastiCacheMockResponse)
      .mockReturnValueOnce(rdsCPUUtilizationResponse)

    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: AWS.CloudWatch.GetMetricDataOutput, callback: (a: Error, response: any) => any) => {
        callback(null, mockFunction())
      },
    )

    const mockGetCostAndUsageFunction = jest.fn()
    mockGetCostAndUsageFunction
      .mockReturnValueOnce(ebsMockResponse)
      .mockReturnValueOnce(elastiCacheMockGetCostAndUsageResponse)
      .mockReturnValueOnce(rdsCPUUsageResponse)
      .mockReturnValueOnce(rdsStorageResponse)

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, mockGetCostAndUsageFunction())
      },
    )
    const result = await cli([
      'executable',
      'file',
      '--startDate',
      '2020-07-10',
      '--endDate',
      '2020-07-13',
      '--region',
      'us-east-1',
    ])

    expect(result).toMatchSnapshot()
  })

  test('ebs, s3, ec2, elasticache, rds grouped by service', async () => {
    const mockFunction = jest.fn()
    mockFunction
      .mockReturnValueOnce(s3MockResponse)
      .mockReturnValueOnce(ec2MockResponse)
      .mockReturnValueOnce(elastiCacheMockResponse)
      .mockReturnValueOnce(rdsCPUUtilizationResponse)

    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: AWS.CloudWatch.GetMetricDataOutput, callback: (a: Error, response: any) => any) => {
        callback(null, mockFunction())
      },
    )

    const mockGetCostAndUsageFunction = jest.fn()
    mockGetCostAndUsageFunction
      .mockReturnValueOnce(ebsMockResponse)
      .mockReturnValueOnce(elastiCacheMockGetCostAndUsageResponse)
      .mockReturnValueOnce(rdsCPUUsageResponse)
      .mockReturnValueOnce(rdsStorageResponse)

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, mockGetCostAndUsageFunction())
      },
    )

    const result = await cli([
      'executable',
      'file',
      '--startDate',
      '2020-07-10',
      '--endDate',
      '2020-07-13',
      '--region',
      'us-east-1',
      '--groupBy',
      'service',
    ])

    expect(result).toMatchSnapshot()
  })
})
