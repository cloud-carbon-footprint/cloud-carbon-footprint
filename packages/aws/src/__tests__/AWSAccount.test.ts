/*
 * © 2021 ThoughtWorks, Inc.
 */

import { Credentials } from 'aws-sdk'
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service'
import { Config as mockConfig } from '@cloud-carbon-footprint/common'
import { EBS, S3, EC2, ElastiCache, RDS, Lambda } from '../lib'
import AWSCredentialsProvider from '../application/AWSCredentialsProvider'

jest.mock('../application/AWSCredentialsProvider')

/* eslint-disable @typescript-eslint/no-var-requires */
describe('AWSAccount', () => {
  const CloudWatch = jest.fn()
  const CostExplorer = jest.fn()
  const CloudWatchLogs = jest.fn()
  const Athena = jest.fn()
  let expectedCredentials: Credentials

  beforeEach(() => {
    jest.doMock('aws-sdk', () => {
      return {
        CloudWatch: CloudWatch,
        CostExplorer: CostExplorer,
        CloudWatchLogs: CloudWatchLogs,
        Athena: Athena,
      }
    })

    const mockedCreate = jest.fn()
    expectedCredentials = new Credentials('test', 'test', 'test')
    mockedCreate.mockReturnValue(expectedCredentials)
    AWSCredentialsProvider.create = mockedCreate
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should return empty if no service in config file', () => {
    mockConfig.AWS.CURRENT_SERVICES = []
    const AWSAccount = require('../application/AWSAccount').default
    const services = new AWSAccount().getServices()
    expect(services).toHaveLength(0)
  })

  it('should throw error if unknown service', () => {
    mockConfig.AWS.CURRENT_SERVICES = [
      {
        key: 'duck',
        name: '',
      },
    ]

    const awsAccount = require('../application/AWSAccount').default
    const account = new awsAccount('123', 'us-east-1')
    expect(() => {
      account.getServices()
    }).toThrowError('Unsupported service: duck')
  })

  it('should return instances from registered services in configuration file', () => {
    expectAWSService('ebs').toBeInstanceOf(EBS)
    expect(CloudWatch).toHaveBeenCalledWith({
      region: 'some-region',
      credentials: expectedCredentials,
    })
    expect(CostExplorer).toHaveBeenCalledWith({
      region: 'us-east-1',
      credentials: expectedCredentials,
    })
  })

  it('should return s3 instance', () => {
    expectAWSService('s3').toBeInstanceOf(S3)
  })

  it('should return ec2 instance', () => {
    expectAWSService('ec2').toBeInstanceOf(EC2)
  })

  it('should return elasticache instance', () => {
    expectAWSService('elasticache').toBeInstanceOf(ElastiCache)
  })

  it('should return rds instance', () => {
    expectAWSService('rds').toBeInstanceOf(RDS)
  })

  it('should return lambda instance', () => {
    expectAWSService('lambda').toBeInstanceOf(Lambda)
  })

  describe('credentials provider', () => {
    it('should set credentials to cloudwatch client', () => {
      // when
      expectAWSService('ebs')

      //then
      const options: ServiceConfigurationOptions = CloudWatch.mock.calls[0][0]
      expect(options.credentials).toEqual(expectedCredentials)
    })

    it('should set credentials to costExplorer client', () => {
      // when
      expectAWSService('s3')

      //then
      const options: ServiceConfigurationOptions = CostExplorer.mock.calls[0][0]
      expect(options.credentials).toEqual(expectedCredentials)
    })

    it('should set credentials to CloudWatchLogs client', () => {
      // when
      expectAWSService('lambda')

      //then
      const options: ServiceConfigurationOptions =
        CloudWatchLogs.mock.calls[0][0]
      expect(options.credentials).toEqual(expectedCredentials)
    })
  })
})

function expectAWSService(key: string) {
  mockConfig.AWS.CURRENT_SERVICES = [
    {
      key: key,
      name: '',
    },
  ]
  const testRegion = 'some-region'
  const AWSAccount = require('../application/AWSAccount').default
  const services = new AWSAccount('12345678', 'test account', [
    testRegion,
  ]).getServices(testRegion)
  return expect(services[0])
}
