import cli from '@view/cli'
import AWSServices from '@application/AWSServices'
import RDS from '@services/RDS'
import RDSStorage from '@services/RDSStorage'
import RDSComputeService from '@services/RDSCompute'
import EBS from '@services/EBS'
import S3 from '@services/S3'
import EC2 from '@services/EC2'
import ElastiCache from '@services/ElastiCache'
import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'
import { mocked } from 'ts-jest/utils'

import {
  mockAwsCloudWatchGetMetricData,
  mockAwsCloudWatchGetQueryResultsForLambda,
  mockAwsCostExplorerGetCostAndUsage,
  mockAwsCostExplorerGetCostAndUsageResponse,
} from '../fixtures/awsMockFunctions'
import Lambda from '@services/Lambda'
import { lambdaMockGetCostResponse } from '../fixtures/costexplorer.fixtures'
import { defaultTransformer } from '@application/Transformer'

jest.mock('@application/AWSServices')

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

  describe('ebs, s3, ec3, elasticache, rds', () => {
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

    test('ebs, s3, ec2, elasticache, rds, grouped by day and service', async () => {
      mockAwsCloudWatchGetMetricData()
      mockAwsCostExplorerGetCostAndUsage()

      const result = await cli(rawRequest)

      expect(result).toMatchSnapshot()
    })

    test('ebs, s3, ec2, elasticache, rds grouped by service', async () => {
      mockAwsCloudWatchGetMetricData()
      mockAwsCostExplorerGetCostAndUsage()

      const result = await cli([...rawRequest, '--groupBy', 'service'])

      expect(result).toMatchSnapshot()
    })

    test('ebs, s3, ec2, elasticache, rds, grouped by day', async () => {
      mockAwsCloudWatchGetMetricData()
      mockAwsCostExplorerGetCostAndUsage()

      const result = await cli([...rawRequest, '--groupBy', 'day'])

      expect(result).toMatchSnapshot()
    })
  })

  describe('lambda', () => {
    beforeEach(() => {
      servicesRegistered.mockReturnValue([
        {
          service: new Lambda(),
          transformer: defaultTransformer,
        },
      ])
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
})
