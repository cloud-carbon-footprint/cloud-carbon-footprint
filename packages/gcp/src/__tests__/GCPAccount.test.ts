/*
 * © 2021 Thoughtworks, Inc.
 */

import { auth as googleAuth } from 'googleapis/build/src/apis/iam'

import { ComputeEngine, Recommendations } from '../lib'

import {
  setConfig,
  EstimationResult,
  GroupBy,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'

import {
  Region,
  RegionCosts,
  RegionEstimates,
} from '@cloud-carbon-footprint/core'

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
    setConfig({
      GCP: {
        CURRENT_SERVICES: [],
      },
    })

    const GCPAccount = require('../application/GCPAccount').default
    const services = new GCPAccount(['us-east1']).getServices()
    expect(services).toHaveLength(0)
  })

  it('should throw error if unknown service', () => {
    setConfig({
      GCP: {
        CURRENT_SERVICES: [{ key: 'goose', name: '' }],
      },
    })

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

  it('should get data for regions', async () => {
    // given
    const startDate: Date = new Date('2020-01-01')
    const endDate: Date = new Date('2020-01-02')
    const grouping: GroupBy = GroupBy.day
    const expectedEstimatesData: RegionEstimates = {
      ComputeEngine: [
        {
          timestamp: startDate,
          kilowattHours: 10,
          co2e: 2,
          usesAverageCPUConstant: false,
        },
      ],
    }
    const getEstimatesSpy = jest.spyOn(Region.prototype, 'getEstimates')
    getEstimatesSpy.mockResolvedValue(expectedEstimatesData)

    const expectedCostData: RegionCosts = {
      ComputeEngine: [
        {
          timestamp: startDate,
          amount: 1000,
          currency: 'USD',
        },
      ],
    }
    const getCostsSpy = jest.spyOn(Region.prototype, 'getCosts')
    getCostsSpy.mockResolvedValue(expectedCostData)

    const regions: string[] = ['test-region-1', 'test-region-2']
    const GCPAccount = require('../application/GCPAccount').default
    const testGCPAccount = new GCPAccount('12345678', 'test account', regions)

    // when
    const result = await testGCPAccount.getDataForRegions(
      startDate,
      endDate,
      grouping,
    )

    // then
    const expectedResult: EstimationResult[] = [
      {
        timestamp: startDate,
        serviceEstimates: [
          {
            cloudProvider: 'GCP',
            kilowattHours: 10,
            co2e: 2,
            cost: 1000,
            usesAverageCPUConstant: false,
            accountId: '12345678',
            accountName: 'test account',
            serviceName: 'ComputeEngine',
            region: 'test-region-1',
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-01-01T23:59:59.000Z'),
        periodStartDate: new Date('2020-01-01T00:00:00.000Z'),
      },
      {
        timestamp: startDate,
        serviceEstimates: [
          {
            cloudProvider: 'GCP',
            kilowattHours: 10,
            co2e: 2,
            cost: 1000,
            usesAverageCPUConstant: false,
            accountId: '12345678',
            accountName: 'test account',
            serviceName: 'ComputeEngine',
            region: 'test-region-2',
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2020-01-01T23:59:59.000Z'),
        periodStartDate: new Date('2020-01-01T00:00:00.000Z'),
      },
    ]
    expect(result).toEqual(expectedResult)
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

    const getClientSpy = jest.spyOn(googleAuth, 'getClient')

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
  setConfig({
    GCP: {
      CURRENT_SERVICES: [{ key: key, name: '' }],
    },
  })

  const GCPAccount = require('../application/GCPAccount').default
  const services = new GCPAccount('test-project', 'test project', [
    'us-east1',
  ]).getServices()
  return expect(services[0])
}
