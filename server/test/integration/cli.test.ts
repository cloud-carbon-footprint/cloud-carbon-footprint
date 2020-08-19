import cli from '@view/cli'
import {
  ebsMockGetCostResponse,
  ebsMockUsageResponse,
  ec2MockGetMetricDataResponse,
  elastiCacheMockGetCostResponse,
  elastiCacheMockGetMetricDataResponse,
  elastiCacheMockGetUsageResponse,
  rdsCPUCostResponse,
  rdsCPUUsageResponse,
  rdsCPUUtilizationResponse,
  rdsStorageCostResponse,
  rdsStorageUsageResponse,
  s3MockGetCostResponse,
  s3MockGetMetricDataResponse,
  ec2MockGetCostResponse,
} from '@fixtures'
import AWSServices from '@application/AWSServices'
import RDS from '@services/RDS'
import RDSStorage from '@services/RDSStorage'
import RDSComputeService from '@services/RDSCompute'
import EBS from '@services/EBS'
import S3 from '@services/S3'
import EC2 from '@services/EC2'
import ElastiCache from '@services/ElastiCache'
import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'
import path from 'path'
import { mocked } from 'ts-jest/utils'
import fs from 'fs'
import { when } from 'jest-when'

jest.mock('@application/AWSServices')
const servicesRegistered = mocked(AWSServices, true)

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

afterEach(() => {
  AWSMock.restore()
})

describe('cli', () => {
  const rawRequest = [
    'executable',
    'file',
    '--startDate',
    '2020-07-10',
    '--endDate',
    '2020-07-13',
    '--region',
    'us-east-1',
  ]

  test('ebs, s3, ec2, elasticache', async () => {
    mockAwsCloudWatchGetMetricData()
    mockAwsCostExplorerGetCostAndUsage()
    servicesRegistered.mockReturnValue([new EBS(), new S3(), new EC2(), new ElastiCache()])

    const result = await cli(rawRequest)

    expect(result).toMatchSnapshot()
  })

  test('ebs, s3, ec2, elasticache grouped by service', async () => {
    mockAwsCloudWatchGetMetricData()
    mockAwsCostExplorerGetCostAndUsage()
    servicesRegistered.mockReturnValue([new EBS(), new S3(), new EC2(), new ElastiCache()])

    const result = await cli([...rawRequest, '--groupBy', 'service'])

    expect(result).toMatchSnapshot()
  })

  test('rds group by service', async () => {
    rdsTestSetup()

    const result = await cli([...rawRequest, '--groupBy', 'service'])

    expect(result).toMatchSnapshot()
  })

  test('rds group by day', async () => {
    rdsTestSetup()

    const result = await cli([...rawRequest, '--groupBy', 'day'])

    expect(result).toMatchSnapshot()
  })

  describe('csv test', () => {
    let outputFilePath: string

    beforeEach(() => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1596660091000)
      outputFilePath = path.join(process.cwd(), 'results-2020-08-05-20:41:31.csv')
    })
    afterEach(() => {
      try {
        fs.unlinkSync(outputFilePath)
      } catch (err) {
        console.error(err)
      }
      jest.restoreAllMocks()
    })

    test('formats table into csv file', async () => {
      mockAwsCloudWatchGetMetricData()
      mockAwsCostExplorerGetCostAndUsage()
      servicesRegistered.mockReturnValue([new EBS(), new S3(), new EC2(), new ElastiCache()])

      await cli([...rawRequest, '--format', 'csv', '--groupBy', 'dayAndService'])

      expect(fs.existsSync(outputFilePath)).toBe(true)
      expect(fs.readFileSync(outputFilePath).toString()).toMatchSnapshot()
    })
  })
})

function mockAwsCloudWatchGetMetricData() {
  const mockGetMetricDataFunction = jest.fn()
  mockGetMetricDataFunction
    .mockReturnValueOnce(s3MockGetMetricDataResponse)
    .mockReturnValueOnce(ec2MockGetMetricDataResponse)
    .mockReturnValueOnce(elastiCacheMockGetMetricDataResponse)

  AWSMock.mock(
    'CloudWatch',
    'getMetricData',
    (params: AWS.CloudWatch.GetMetricDataOutput, callback: (a: Error, response: any) => any) => {
      callback(null, mockGetMetricDataFunction())
    },
  )
}

function mockAwsCostExplorerGetCostAndUsage() {
  const mockGetCostAndUsageFunction = jest.fn()
  when(mockGetCostAndUsageFunction)
    .calledWith(expect.objectContaining({ Metrics: ['AmortizedCost'] }))
    .mockReturnValueOnce(ebsMockGetCostResponse)
    .mockReturnValueOnce(s3MockGetCostResponse)
    .mockReturnValueOnce(ec2MockGetCostResponse)
    .mockReturnValueOnce(elastiCacheMockGetCostResponse)

  when(mockGetCostAndUsageFunction)
    .calledWith(expect.objectContaining({ Metrics: ['UsageQuantity'] }))
    .mockReturnValueOnce(ebsMockUsageResponse)
    .mockReturnValueOnce(elastiCacheMockGetUsageResponse)

  AWSMock.mock(
    'CostExplorer',
    'getCostAndUsage',
    (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
      callback(null, mockGetCostAndUsageFunction(params))
    },
  )
}

function rdsTestSetup() {
  servicesRegistered.mockReturnValue([new RDS(new RDSComputeService(), new RDSStorage())])
  const mockAwsCloudWatchGetMetricDataFunction = jest.fn()
  mockAwsCloudWatchGetMetricDataFunction.mockReturnValueOnce(rdsCPUUtilizationResponse)

  AWSMock.mock(
    'CloudWatch',
    'getMetricData',
    (params: AWS.CloudWatch.GetMetricDataOutput, callback: (a: Error, response: any) => any) => {
      callback(null, mockAwsCloudWatchGetMetricDataFunction())
    },
  )

  const mockAwsCostExplorerGetCostAndUsageFunction = jest.fn()
  mockAwsCostExplorerGetCostAndUsageFunction
    .mockReturnValueOnce(rdsCPUCostResponse)
    .mockReturnValueOnce(rdsStorageCostResponse)
    .mockReturnValueOnce(rdsStorageUsageResponse)
    .mockReturnValueOnce(rdsCPUUsageResponse)

  AWSMock.mock(
    'CostExplorer',
    'getCostAndUsage',
    (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
      callback(null, mockAwsCostExplorerGetCostAndUsageFunction())
    },
  )
}
