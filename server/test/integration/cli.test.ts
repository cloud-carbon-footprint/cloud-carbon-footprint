import cli from '@view/cli'
import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'
import {
  s3MockResponse,
  ec2MockResponse,
  ebsMockResponse,
  elastiCacheMockResponse,
  elastiCacheMockDescribeCacheClusters,
} from '@fixtures'
import { AWS_REGIONS } from '../../src/domain/constants'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

afterAll(() => {
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

    AWSMock.mock('ElastiCache', 'describeCacheClusters', (callback: (a: Error, response: any) => any) => {
      callback(null, elastiCacheMockDescribeCacheClusters)
    })

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, ebsMockResponse)
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
})
