/*
 * © 2021 Thoughtworks, Inc. All rights reserved.
 */

import {
  AWSAccount,
  EBS,
  S3,
  EC2,
  ElastiCache,
  RDS,
  RDSComputeService,
  RDSStorage,
  ServiceWrapper,
} from '@cloud-carbon-footprint/core'
import path from 'path'
import fs from 'fs'
import {
  mockAwsCloudWatchGetMetricData,
  mockAwsCostExplorerGetCostAndUsage,
} from '../../test/fixtures/awsMockFunctions'
import cli from '../cli'
import AWSMock from 'aws-sdk-mock'
import AWS, { CloudWatch, CostExplorer, CloudWatchLogs } from 'aws-sdk'
import config from '../../../core/src/application/ConfigLoader'
const getServices = jest.spyOn(AWSAccount.prototype, 'getServices')

//disable cache
jest.mock('../../../core/src/application/Cache')

jest.mock('../../../core/src/application/ConfigLoader')

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

afterEach(() => {
  AWSMock.restore()
})

describe('csv test', () => {
  const start = '2020-07-01'
  const end = '2020-07-07'
  const rawRequest = [
    'executable',
    'file',
    '--startDate',
    start,
    '--endDate',
    end,
    '--region',
    'us-east-1',
  ]

  function getCloudWatch() {
    return new CloudWatch({ region: 'us-east-1' })
  }

  function getCloudWatchLogs() {
    return new CloudWatchLogs({ region: 'us-east-1' })
  }

  function getCostExplorer() {
    return new CostExplorer({ region: 'us-east-1' })
  }

  function getServiceWrapper() {
    return new ServiceWrapper(
      getCloudWatch(),
      getCloudWatchLogs(),
      getCostExplorer(),
    )
  }

  let outputFilePath: string

  beforeAll(() => {
    ;(config as jest.Mock).mockReturnValue({
      AWS: {
        accounts: [{ id: '12345678', name: 'test account' }],
        NAME: 'AWS',
        CURRENT_REGIONS: ['us-east-1', 'us-east-2'],
        authentication: {
          mode: 'GCP',
          options: {
            targetRoleSessionName: 'test-target',
            proxyAccountId: 'test-account-id',
            proxyRoleName: 'test-role-name',
          },
        },
      },
      GCP: {
        projects: [{ id: 'test-project', name: 'test project' }],
        NAME: 'GCP',
        CURRENT_REGIONS: ['us-east1'],
      },
      LOGGING_MODE: 'test',
    })
  })

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
      new RDS(
        new RDSComputeService(getServiceWrapper()),
        new RDSStorage(getServiceWrapper()),
      ),
    ])

    await cli([...rawRequest, '--format', 'csv', '--groupBy', 'dayAndService'])

    expect(fs.existsSync(outputFilePath)).toBe(true)
    expect(fs.readFileSync(outputFilePath).toString()).toMatchSnapshot()
  })
})
