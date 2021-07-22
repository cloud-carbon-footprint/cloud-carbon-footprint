/*
 * © 2021 Thoughtworks, Inc.
 */

import path from 'path'
import fs from 'fs'
import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'

import {
  mockAwsCloudWatchGetMetricData,
  mockAwsCostExplorerGetCostAndUsage,
} from './fixtures/awsMockFunctions'
import cli from '../cli'
import { EstimationResult } from '@cloud-carbon-footprint/common'

const mockGetCostAndEstimates = jest.fn()
const mockGetFilterData = jest.fn()
const mockGetEmissionsFactors = jest.fn()

jest.mock('@cloud-carbon-footprint/app', () => ({
  ...(jest.requireActual('@cloud-carbon-footprint/app') as Record<
    string,
    unknown
  >),
  App: jest.fn().mockImplementation(() => {
    return {
      getCostAndEstimates: mockGetCostAndEstimates,
      getEmissionsFactors: mockGetEmissionsFactors,
      getFilterData: mockGetFilterData,
    }
  }),
  cache: jest.fn(),
}))

jest.mock('@cloud-carbon-footprint/common', () => ({
  ...(jest.requireActual('@cloud-carbon-footprint/common') as Record<
    string,
    unknown
  >),
  Logger: jest.fn().mockReturnValue({
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  }),
  configLoader: jest.fn().mockImplementation(() => {
    return {
      AWS: {
        accounts: [{ id: '12345678', name: 'test AWS account' }],
        NAME: 'AWS',
        CURRENT_REGIONS: ['us-east-1', 'us-east-2'],
        CURRENT_SERVICES: [
          {
            key: 'ebs',
            name: 'EBS',
          },
          {
            key: 's3',
            name: 'S3',
          },
          {
            key: 'ec2',
            name: 'EC2',
          },
          {
            key: 'elasticache',
            name: 'ElastiCache',
          },
          {
            key: 'rds',
            name: 'RDS',
          },
          {
            key: 'lambda',
            name: 'Lambda',
          },
        ],
        authentication: {
          mode: 'GCP',
          options: {
            targetRoleName: 'test-target',
            proxyAccountId: 'test-account-id',
            proxyRoleName: 'test-role-name',
          },
        },
      },
      GCP: {
        projects: [
          { id: '987654321', name: 'test GCP account' },
          { id: '987654321', name: 'test GCP account 2' },
        ],
        NAME: 'GCP',
        CURRENT_SERVICES: [{ key: 'testService', name: 'service' }],
        CURRENT_REGIONS: ['us-east1', 'us-west1', 'us-central1'],
        CACHE_BUCKET_NAME: 'test-bucket-name',
      },
    }
  }),
}))

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

  let outputFilePath: string

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1596660091000)
    outputFilePath = path.join(process.cwd(), 'results-2020-08-05-20:41:31.csv')
    const expectedResponse: EstimationResult[] = []
    mockGetCostAndEstimates.mockResolvedValueOnce(expectedResponse)
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
