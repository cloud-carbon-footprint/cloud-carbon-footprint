/*
 * © 2021 ThoughtWorks, Inc.
 */

import { Config as mockConfig } from '@cloud-carbon-footprint/common'
import { ComputeEngine } from '../lib'

const mockMetricServiceClient = jest.fn()
jest.mock('@google-cloud/monitoring', () => {
  return {
    v3: {
      MetricServiceClient: mockMetricServiceClient,
    },
  }
})

describe('GCPAccount', () => {
  const projectId = 'test-project'

  /* eslint-disable @typescript-eslint/no-var-requires */
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should return empty if no service in config file', () => {
    mockConfig.GCP.CURRENT_SERVICES = []

    const GCPAccount = require('../GCPAccount').default
    const services = new GCPAccount(['us-east1']).getServices()
    expect(services).toHaveLength(0)
  })

  it('should throw error if unknown service', () => {
    mockConfig.GCP.CURRENT_SERVICES = [{ key: 'goose', name: '' }]

    const GCPAccount = require('../GCPAccount').default
    const account = new GCPAccount(['us-east1'])
    expect(() => {
      account.getServices()
    }).toThrowError('Unsupported service: goose')
  })

  it('should return computeEngine instance and inject MetricServiceClient', () => {
    expectGCPService('computeEngine').toBeInstanceOf(ComputeEngine)
    expect(mockMetricServiceClient).toHaveBeenCalledWith({
      projectId: projectId,
    })
  })
})

function expectGCPService(key: string) {
  mockConfig.GCP.CURRENT_SERVICES = [
    {
      key: key,
      name: '',
    },
  ]

  const GCPAccount = require('../GCPAccount').default
  const services = new GCPAccount('test-project', 'test project', [
    'us-east1',
  ]).getServices()
  return expect(services[0])
}
