/*
 * © 2021 ThoughtWorks, Inc.
 */

import cli from '../cli'
import {
  AWSAccount,
  RDS,
  RDSStorage,
  RDSComputeService,
  EBS,
  S3,
  EC2,
  ElastiCache,
  Lambda,
  EstimationRequestValidationError,
  ServiceWrapper,
  GCPAccount,
  ComputeEngine,
} from '@cloud-carbon-footprint/core'
import AWSMock from 'aws-sdk-mock'
import AWS, { CloudWatch, CloudWatchLogs, CostExplorer } from 'aws-sdk'
import { MetricServiceClient } from '@google-cloud/monitoring'

import {
  mockAwsCloudWatchGetMetricData,
  mockAwsCloudWatchGetQueryResultsForLambda,
  mockAwsCostExplorerGetCostAndUsage,
  mockAwsCostExplorerGetCostAndUsageResponse,
} from '../../test/fixtures/awsMockFunctions'
import { lambdaMockGetCostResponse } from '../../test/fixtures/costexplorer.fixtures'
import config from '../../../core/src/application/ConfigLoader'
import {
  mockCpuUtilizationTimeSeries,
  mockVCPUTimeSeries,
} from '../../test/fixtures/cloudmonitoring.fixtures'

const getAWSServices = jest.spyOn(AWSAccount.prototype, 'getServices')
const getGCPServices = jest.spyOn(GCPAccount.prototype, 'getServices')
const mockListTimeSeries = jest.fn()

jest.mock('../../../core/src/application/ConfigLoader')

jest.mock('@google-cloud/monitoring', () => {
  return {
    MetricServiceClient: jest.fn().mockImplementation(() => {
      return {
        listTimeSeries: mockListTimeSeries,
        projectPath: jest
          .fn()
          .mockReturnValue('projects/cloud-carbon-footprint'),
        getProjectId: jest.fn().mockResolvedValue('cloud-carbon-footprint'),
      }
    }),
  }
})

//disable cache
jest.mock('../../../core/src/application/Cache')

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

afterEach(() => {
  AWSMock.restore()
})

describe('cli', () => {
  const start = '2020-07-01'
  const end = '2020-07-07'
  const rawRequest = [
    'executable',
    'file',
    '--startDate',
    start,
    '--endDate',
    end,
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

  function getCloudMonitoring() {
    return new MetricServiceClient()
  }

  describe('ebs, s3, ec3, elasticache, rds', () => {
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
      mockAwsCloudWatchGetMetricData()
      mockAwsCostExplorerGetCostAndUsage()
      mockListTimeSeries
        .mockResolvedValueOnce([mockCpuUtilizationTimeSeries, {}, {}])
        .mockResolvedValueOnce([mockVCPUTimeSeries, {}, {}])
      ;(getAWSServices as jest.Mock).mockReturnValue([
        new EBS(getServiceWrapper()),
        new S3(getServiceWrapper()),
        new EC2(getServiceWrapper()),
        new ElastiCache(getServiceWrapper()),
        new RDS(
          new RDSComputeService(getServiceWrapper()),
          new RDSStorage(getServiceWrapper()),
        ),
      ])
      ;(getGCPServices as jest.Mock).mockReturnValue([
        new ComputeEngine(getCloudMonitoring()),
      ])
    })

    test('ebs, s3, ec2, elasticache, rds, grouped by day and service', async () => {
      const result = await cli(rawRequest)

      expect(result).toMatchSnapshot()
    })

    test('ebs, s3, ec2, elasticache, rds grouped by service', async () => {
      const result = await cli([...rawRequest, '--groupBy', 'service'])

      expect(result).toMatchSnapshot()
    })

    test('ebs, s3, ec2, elasticache, rds, grouped by day', async () => {
      const result = await cli([...rawRequest, '--groupBy', 'day'])

      expect(result).toMatchSnapshot()
    })
  })

  describe('lambda', () => {
    beforeEach(() => {
      mockAwsCloudWatchGetQueryResultsForLambda()
      mockAwsCostExplorerGetCostAndUsageResponse(lambdaMockGetCostResponse)
      ;(getAWSServices as jest.Mock).mockReturnValue([
        new Lambda(60000, 1000, getServiceWrapper()),
      ])
      ;(config as jest.Mock).mockReturnValueOnce({
        AWS: {
          accounts: [{ id: '12345678', name: 'test account' }],
          NAME: 'aws',
          CURRENT_REGIONS: ['us-east-1', 'us-east-2'],
        },
        authentication: {
          mode: 'GCP',
          options: {
            targetRoleSessionName: 'test-target',
            proxyAccountId: 'test-account-id',
            proxyRoleName: 'test-role-name',
          },
        },
        GCP: {
          projects: [],
          NAME: 'gcp',
          CURRENT_REGIONS: ['us-east1'],
        },
        LOGGING_MODE: 'test',
      })
    })

    it('lambda estimates', async () => {
      const result = await cli([...rawRequest, '--groupBy', 'dayAndService'])
      expect(result).toMatchSnapshot()
    })

    it('lambda cost', async () => {
      const result = await cli([...rawRequest, '--groupBy', 'service'])
      expect(result).toMatchSnapshot()
    })
  })

  describe('start and end date parameter validation', () => {
    describe('given: invalid dates', () => {
      it('throws an estimation validation error', async () => {
        // setup
        const start = '2020-06-16'
        const end = '2020-06-16'
        const command = [
          'executable',
          'file',
          '--startDate',
          start,
          '--endDate',
          end,
        ]

        //assert
        await expect(() => {
          return cli([...command])
        }).rejects.toThrow(EstimationRequestValidationError)
      })
    })
  })
})
