/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  Config as mockConfig,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'
import { ComputeEngine, Recommendations } from '../lib'
import { google } from 'googleapis'

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

    const GCPAccount = require('../application/GCPAccount').default
    const services = new GCPAccount(['us-east1']).getServices()
    expect(services).toHaveLength(0)
  })

  it('should throw error if unknown service', () => {
    mockConfig.GCP.CURRENT_SERVICES = [{ key: 'goose', name: '' }]

    const GCPAccount = require('../application/GCPAccount').default
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

  it('should get data for gcp recommendations', async () => {
    const GCPAccount = require('../application/GCPAccount').default
    const testGCPAccount = new GCPAccount('12345678', 'test account', [
      'some-region',
    ])

    const expectedRecommendations: RecommendationResult[] = [
      {
        cloudProvider: 'GCP',
        accountId: 'account-id',
        accountName: 'account-name',
        region: 'us-east1',
        recommendationType: 'STOP_VM',
        recommendationDetail: "Save cost by stopping Idle VM 'test-instance'.",
        kilowattHourSavings: 5,
        co2eSavings: 4,
        costSavings: 3,
      },
    ]

    const getClientSpy = jest.spyOn(google.auth, 'getClient')

    ;(getClientSpy as jest.Mock).mockResolvedValue(jest.fn())

    const getRecommendations = jest.spyOn(
      Recommendations.prototype,
      'getRecommendations',
    )

    getRecommendations.mockResolvedValue(expectedRecommendations)
    const result = await testGCPAccount.getDataForRecommendations()

    expect(result).toEqual(expectedRecommendations)
  })
})

function expectGCPService(key: string) {
  mockConfig.GCP.CURRENT_SERVICES = [
    {
      key: key,
      name: '',
    },
  ]

  const GCPAccount = require('../application/GCPAccount').default
  const services = new GCPAccount('test-project', 'test project', [
    'us-east1',
  ]).getServices()
  return expect(services[0])
}
