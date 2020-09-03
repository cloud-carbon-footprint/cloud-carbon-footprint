import { mocked } from 'ts-jest/utils'
import AWSServices from '@application/AWSServices'
import EBS from '@services/EBS'
import S3 from '@services/S3'
import EC2 from '@services/EC2'
import ElastiCache from '@services/ElastiCache'
import RDS from '@services/RDS'
import RDSComputeService from '@services/RDSCompute'
import RDSStorage from '@services/RDSStorage'
import path from 'path'
import fs from 'fs'
import { mockAwsCloudWatchGetMetricData, mockAwsCostExplorerGetCostAndUsage } from '../fixtures/awsMockFunctions'
import cli from '@view/cli'
import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'
import { defaultTransformer } from '@application/Transformer'

jest.mock('@application/AWSServices')

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

afterEach(() => {
  AWSMock.restore()
})

describe('csv test', () => {
  const start = '2020-07-01'
  const end = '2020-07-07'
  const servicesRegistered = mocked(AWSServices, true)
  const rawRequest = ['executable', 'file', '--startDate', start, '--endDate', end, '--region', 'us-east-1']

  servicesRegistered.mockReturnValue([
    {
      service: new EBS(),
      transformer: defaultTransformer,
    },
    {
      service: new S3(),
      transformer: defaultTransformer,
    },
    {
      service: new EC2(),
      transformer: defaultTransformer,
    },
    {
      service: new ElastiCache(),
      transformer: defaultTransformer,
    },
    {
      service: new RDS(new RDSComputeService(), new RDSStorage()),
      transformer: defaultTransformer,
    },
  ])

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

    await cli([...rawRequest, '--format', 'csv', '--groupBy', 'dayAndService'])

    expect(fs.existsSync(outputFilePath)).toBe(true)
    expect(fs.readFileSync(outputFilePath).toString()).toMatchSnapshot()
  })
})
