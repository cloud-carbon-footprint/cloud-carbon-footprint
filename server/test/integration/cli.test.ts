import cli from '@view/cli'
import AWSServices from '@application/AWSServices'
import RDS from '@services/aws/RDS'
import RDSStorage from '@services/aws/RDSStorage'
import RDSComputeService from '@services/aws/RDSCompute'
import EBS from '@services/aws/EBS'
import S3 from '@services/aws/S3'
import EC2 from '@services/aws/EC2'
import ElastiCache from '@services/aws/ElastiCache'
import AWSMock from 'aws-sdk-mock'
import AWS, { CloudWatch, CostExplorer } from 'aws-sdk'
import { mocked } from 'ts-jest/utils'

import {
  mockAwsCloudWatchGetMetricData,
  mockAwsCloudWatchGetQueryResultsForLambda,
  mockAwsCostExplorerGetCostAndUsage,
  mockAwsCostExplorerGetCostAndUsageResponse,
} from '../fixtures/awsMockFunctions'
import Lambda from '@services/aws/Lambda'
import { lambdaMockGetCostResponse } from '../fixtures/costexplorer.fixtures'
import { EstimationRequestValidationError } from '@application/CreateValidRequest'
import { ServiceWrapper } from '@services/aws/ServiceWrapper'

jest.mock('@application/AWSServices')

//disable cache
jest.mock('@application/Cache')

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

afterEach(() => {
  AWSMock.restore()
})

describe('cli', () => {
  const start = '2020-07-01'
  const end = '2020-07-07'
  const servicesRegistered = mocked(AWSServices, true)
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

  describe('ebs, s3, ec3, elasticache, rds', () => {
    beforeEach(() => {
      mockAwsCloudWatchGetMetricData()
      mockAwsCostExplorerGetCostAndUsage()
      servicesRegistered.mockReturnValue([
        new EBS(getServiceWrapper()),
        new S3(getServiceWrapper()),
        new EC2(getServiceWrapper()),
        new ElastiCache(getServiceWrapper()),
        new RDS(new RDSComputeService(getServiceWrapper()), new RDSStorage(getServiceWrapper())),
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
      servicesRegistered.mockReturnValue([new Lambda(60000, 1000, getServiceWrapper())])
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
        const command = ['executable', 'file', '--startDate', start, '--endDate', end]

        //assert
        await expect(() => {
          return cli([...command])
        }).rejects.toThrow(EstimationRequestValidationError)
      })
    })
  })
})
