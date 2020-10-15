import AWSAccount from '@application/AWSAccount'
import EBS from '@services/aws/EBS'
import S3 from '@services/aws/S3'
import EC2 from '@services/aws/EC2'
import ElastiCache from '@services/aws/ElastiCache'
import RDS from '@services/aws/RDS'
import RDSComputeService from '@services/aws/RDSCompute'
import RDSStorage from '@services/aws/RDSStorage'
import path from 'path'
import fs from 'fs'
import { mockAwsCloudWatchGetMetricData, mockAwsCostExplorerGetCostAndUsage } from '../fixtures/awsMockFunctions'
import cli from '@view/cli'
import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'
import { ServiceWrapper } from '@services/aws/ServiceWrapper'
import { CloudWatch, CostExplorer } from 'aws-sdk'

const getServices = jest.spyOn(AWSAccount.prototype, 'getServices')

//disable cache
jest.mock('@application/Cache')

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

afterEach(() => {
  AWSMock.restore()
})

describe('csv test', () => {
  const start = '2020-07-01'
  const end = '2020-07-07'
  const rawRequest = ['executable', 'file', '--startDate', start, '--endDate', end, '--region', 'us-east-1']

  function getCloudWatch() {
    return new CloudWatch({ region: 'us-east-1' })
  }

  function getCostExplorer() {
    return new CostExplorer({ region: 'us-east-1' })
  }

  function getServiceWrapper() {
    return new ServiceWrapper(getCloudWatch(), getCostExplorer())
  }

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
    ;(getServices as jest.Mock).mockReturnValue([
      new EBS(getServiceWrapper()),
      new S3(getServiceWrapper()),
      new EC2(getServiceWrapper()),
      new ElastiCache(getServiceWrapper()),
      new RDS(new RDSComputeService(getServiceWrapper()), new RDSStorage(getServiceWrapper())),
    ])

    await cli([...rawRequest, '--format', 'csv', '--groupBy', 'dayAndService'])

    expect(fs.existsSync(outputFilePath)).toBe(true)
    expect(fs.readFileSync(outputFilePath).toString()).toMatchSnapshot()
  })
})
