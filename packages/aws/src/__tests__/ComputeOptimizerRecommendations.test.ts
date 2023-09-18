/*
 * © 2021 Thoughtworks, Inc.
 */
import AWSMock from 'aws-sdk-mock'
import AWS, { CloudWatch, CloudWatchLogs, CostExplorer, S3 } from 'aws-sdk'
import path from 'path'
import moment from 'moment'
import * as fs from 'fs'

import {
  ComputeEstimator,
  MemoryEstimator,
  StorageEstimator,
} from '@cloud-carbon-footprint/core'
import {
  AWS_RECOMMENDATIONS_SERVICES,
  configLoader,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'

import { AWS_CLOUD_CONSTANTS } from '../domain'
import { ServiceWrapper, ComputeOptimizerRecommendations } from '../lib'
import {
  mockEBSComputeOptimizerBucketList,
  mockEC2ComputeOptimizerBucketList,
  mockLambdaComputeOptimizerBucketList,
} from './fixtures/computeOptimizer.fixtures'

describe('AWS Compute Optimizer Recommendations Service', () => {
  const getServiceWrapper = () =>
    new ServiceWrapper(
      new CloudWatch(),
      new CloudWatchLogs(),
      new CostExplorer(),
      new S3(),
    )
  const getRecommendationsService = () =>
    new ComputeOptimizerRecommendations(
      new ComputeEstimator(),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      getServiceWrapper(),
    )

  const listBucketObjectsSpy = jest.fn()
  const mockBucketName = 'test-bucket'
  const defaultConfig = configLoader().AWS.RECOMMENDATIONS_SERVICE

  function mockListComputeOptimizerBucket(response: any) {
    listBucketObjectsSpy.mockResolvedValue(response)
    AWSMock.mock('S3', 'listObjectsV2', listBucketObjectsSpy)
  }

  function mockGetComputeOptimizerBucket(mockCSVFilePath: string) {
    const mockFilePath = path.join(process.cwd(), mockCSVFilePath)
    const mockFile = fs.readFileSync(mockFilePath)
    AWSMock.mock('S3', 'getObject', Buffer.alloc(mockFile.length, mockFile))
  }

  beforeAll(() => {
    configLoader().AWS.RECOMMENDATIONS_SERVICE =
      AWS_RECOMMENDATIONS_SERVICES.ComputeOptimizer
    AWSMock.setSDKInstance(AWS)
  })

  afterEach(() => {
    AWSMock.restore()
    jest.restoreAllMocks()
    configLoader().AWS.RECOMMENDATIONS_SERVICE = defaultConfig
  })

  it('gets recommendations for only "Over Provisioned" EC2 instances ignoring AutoScalingGroup', async () => {
    moment.now = function () {
      return +new Date('2022-01-21T00:00:00.000Z')
    }

    const mockCSVFilePath = '/src/__tests__/fixtures/computeOptimizerEC2.csv'

    mockListComputeOptimizerBucket(mockEC2ComputeOptimizerBucketList)
    mockGetComputeOptimizerBucket(mockCSVFilePath)

    const awsRecommendationsServices = getRecommendationsService()

    const result = await awsRecommendationsServices.getRecommendations(
      mockBucketName,
    )

    const expectedResult: RecommendationResult[] = [
      {
        cloudProvider: 'AWS',
        accountId: '1234567890',
        accountName: '1234567890',
        region: 'eu-central-1',
        recommendationType: 'EC2-OVER_PROVISIONED',
        kilowattHourSavings: 9.737524749599999,
        resourceId: 'i-0c80d1b0f3a0c5c69',
        instanceName: 'PA-VM-100 | Networks',
        co2eSavings: 0.0030283701971256004,
        recommendationDetail:
          'Save cost by changing instance type from m4.xlarge to t3.xlarge.',
        costSavings: 33.79,
      },
    ]

    expect(result).toEqual(expectedResult)
  })

  it('gets recommendations for only "Not Optimized" EBS volumes (with and without cost savings)', async () => {
    moment.now = function () {
      return +new Date('2022-01-21T00:00:00.000Z')
    }

    const mockCSVFilePath = '/src/__tests__/fixtures/computeOptimizerEBS.csv'

    mockListComputeOptimizerBucket(mockEBSComputeOptimizerBucketList)
    mockGetComputeOptimizerBucket(mockCSVFilePath)

    const awsRecommendationsServices = getRecommendationsService()

    const result = await awsRecommendationsServices.getRecommendations(
      mockBucketName,
    )

    const expectedResult: RecommendationResult[] = [
      {
        cloudProvider: 'AWS',
        accountId: '1234567890',
        accountName: '1234567890',
        region: 'us-west-2',
        recommendationType: 'EBS-NotOptimized',
        kilowattHourSavings: 0.0019612799999999993,
        resourceId: 'vol-00e39f1234a7eadfb',
        co2eSavings: 6.318596937599997e-7,
        recommendationDetail:
          'Save cost by changing volume type from gp2(80GB) to gp3(50GB).',
        costSavings: 6.2,
      },
    ]

    expect(result).toEqual(expectedResult)
  })

  it('gets recommendations for only "Not Optimized" Lambda functions', async () => {
    moment.now = function () {
      return +new Date('2022-01-21T00:00:00.000Z')
    }

    const mockCSVFilePath = '/src/__tests__/fixtures/computeOptimizerLambda.csv'

    mockListComputeOptimizerBucket(mockLambdaComputeOptimizerBucketList)
    mockGetComputeOptimizerBucket(mockCSVFilePath)

    const awsRecommendationsServices = getRecommendationsService()

    const result = await awsRecommendationsServices.getRecommendations(
      mockBucketName,
    )

    const expectedResult: RecommendationResult[] = [
      {
        cloudProvider: 'AWS',
        accountId: '1234567890',
        accountName: '1234567890',
        region: 'us-east-2',
        recommendationType: 'Lambda-NotOptimized',
        kilowattHourSavings: 0.1781104877331825,
        resourceId: 'api-user-prod-add_user:$LATEST',
        co2eSavings: 0.00007313359114714655,
        recommendationDetail:
          'Save cost by changing configuration memory size from 1024MB to 848MB.',
        costSavings: 2.988e-4,
      },
    ]

    expect(result).toEqual(expectedResult)
  })
})
