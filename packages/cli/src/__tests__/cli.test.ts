/*
 * © 2021 Thoughtworks, Inc.
 */

import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'
import {
  EstimationRequestValidationError,
  EstimationResult,
  GroupBy,
} from '@cloud-carbon-footprint/common'
import {
  mockAwsCloudWatchGetMetricData,
  mockAwsCloudWatchGetQueryResultsForLambda,
  mockAwsCostExplorerGetCostAndUsage,
  mockAwsCostExplorerGetCostAndUsageResponse,
} from './fixtures/awsMockFunctions'
import { lambdaMockGetCostResponse } from './fixtures/costexplorer.fixtures'
import {
  mockCpuUtilizationTimeSeries,
  mockVCPUTimeSeries,
} from './fixtures/cloudmonitoring.fixtures'
import cli from '../cli'

let mockWarn: jest.SpyInstance
const mockListTimeSeries = jest.fn()

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
        accounts: [{ id: '12345678', name: 'test account' }],
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
        projects: [{ id: 'test-project', name: 'test project' }],
        NAME: 'GCP',
        CURRENT_REGIONS: ['us-east1'],
        CURRENT_SERVICES: [
          {
            key: 'computeEngine',
            name: 'ComputeEngine',
          },
        ],
      },
      LOGGING_MODE: 'test',
    }
  }),
}))

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

beforeEach(() => {
  mockWarn = jest.spyOn(console, 'warn').mockImplementation()
})

afterEach(() => {
  AWSMock.restore()
})

describe('cli', () => {
  const start = '2020-07-01'
  const end = '2020-07-07'
  const grouping = 'day'
  const rawRequest = [
    'executable',
    'file',
    '--startDate',
    start,
    '--endDate',
    end,
    '--groupBy',
    grouping,
  ]

  beforeEach(() => {
    const expectedResponse: EstimationResult[] = []
    mockGetCostAndEstimates.mockResolvedValueOnce(expectedResponse)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('request parameters', () => {
    const expectedValidatedParams = {
      startDate: new Date(start),
      endDate: new Date(end),
      groupBy: GroupBy.day,
      ignoreCache: false,
    }

    it('passes all required request parameters to App request', async () => {
      await cli([...rawRequest])
      expect(mockGetCostAndEstimates).toHaveBeenCalledWith(
        expectedValidatedParams,
      )
    })
  })

  describe('ebs, s3, ec3, elasticache, rds', () => {
    beforeEach(() => {
      mockAwsCloudWatchGetMetricData()
      mockAwsCostExplorerGetCostAndUsage()
      mockListTimeSeries
        .mockResolvedValueOnce([mockCpuUtilizationTimeSeries, {}, {}])
        .mockResolvedValueOnce([mockVCPUTimeSeries, {}, {}])
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

  describe('parameter validation', () => {
    describe('given: invalid dates', () => {
      it('throws an estimation validation error', async () => {
        // setup
        const start = '2020-06-16'
        const end = '2020-06-15'
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

    describe('given: invalid table grouping parameter', () => {
      it('throws an estimation request validation error', async () => {
        const grouping = 'year'
        const command = [
          'executable',
          'file',
          '--startDate',
          start,
          '--endDate',
          end,
          '--groupBy',
          grouping,
        ]

        const validGroupByParams = ['day', 'dayAndService', 'service']
        const errorMessage = `GroupBy param is incorrect. Please specify one of the following grouping methods: ${validGroupByParams.join(
          ' | ',
        )}`

        await expect(() => {
          return cli([...command])
        }).rejects.toThrow(new EstimationRequestValidationError(errorMessage))
      })

      it('assigns a default value of "day" along with a warning when not provided', async () => {
        const command = [
          'executable',
          'file',
          '--startDate',
          start,
          '--endDate',
          end,
        ]

        await cli([...command])
        expect(mockWarn).toHaveBeenCalledWith(
          'GroupBy parameter not specified, adopting "day" as the default.',
        )
      })
    })
  })
})
