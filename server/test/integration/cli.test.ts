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
import AWSServices from '@application/AWSServices'
import RDS from '@services/RDS'
import RDSStorage from '@services/RDSStorage'
import RDSComputeService from '@services/RDSCompute'
import { mocked } from 'ts-jest/utils'
import EBS from '@services/EBS'
import S3 from '@services/S3'
import EC2 from '@services/EC2'
import ElastiCache from '@services/ElastiCache'

jest.mock('@application/AWSServices')
const servicesRegistered = mocked(AWSServices, true)

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

afterEach(() => {
  AWSMock.restore()
})

describe('cli', () => {
  test('ebs, s3, ec2, elasticache', async () => {
    const mockFunction = jest.fn()
    mockFunction
      .mockReturnValueOnce(s3MockResponse)
      .mockReturnValueOnce(ec2MockResponse)
      .mockReturnValueOnce(elastiCacheMockResponse)

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

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, mockGetCostAndUsageFunction())
      },
    )

    servicesRegistered.mockReturnValue([new EBS(), new S3(), new EC2(), new ElastiCache()])

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

  test('ebs, s3, ec2, elasticache grouped by service', async () => {
    const mockFunction = jest.fn()
    mockFunction
      .mockReturnValueOnce(s3MockResponse)
      .mockReturnValueOnce(ec2MockResponse)
      .mockReturnValueOnce(elastiCacheMockResponse)

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

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, mockGetCostAndUsageFunction())
      },
    )

    servicesRegistered.mockReturnValue([new EBS(), new S3(), new EC2(), new ElastiCache()])

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

  test('rds group by service', async () => {
    const mockFunction = jest.fn()
    mockFunction.mockReturnValueOnce(rdsCPUUtilizationResponse)

    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: AWS.CloudWatch.GetMetricDataOutput, callback: (a: Error, response: any) => any) => {
        callback(null, mockFunction())
      },
    )

    const mockGetCostAndUsageFunction = jest.fn()
    mockGetCostAndUsageFunction.mockReturnValueOnce(rdsStorageResponse).mockReturnValueOnce(rdsCPUUsageResponse)

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, mockGetCostAndUsageFunction())
      },
    )

    servicesRegistered.mockReturnValue([new RDS(new RDSComputeService(), new RDSStorage())])

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
