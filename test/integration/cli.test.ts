import cli from '@application/cli'
import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'
import { mocked } from 'ts-jest/utils'
import AWSServices from '@application/AWSServices'
import EBS from '@services/EBS'
import S3 from '@services/S3'
import EC2 from '@services/EC2'
import { s3MockResponse, ec2MockResponse, ebsMockResponse } from '@fixtures'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

afterAll(() => {
  AWSMock.restore()
})

describe('cli', () => {
  test.only('ebs & s3', async () => {
    const mockFunction = jest.fn()
    mockFunction.mockReturnValueOnce(s3MockResponse).mockReturnValueOnce(ec2MockResponse)

    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: AWS.CloudWatch.GetMetricDataOutput, callback: (a: Error, response: any) => any) => {
        callback(null, mockFunction())
      },
    )

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, ebsMockResponse)
      },
    )
    const result = await cli(['executable', 'file', '--startDate', '2020-07-10', '--endDate', '2020-07-13'])

    expect(result).toMatchSnapshot()
  })
})
