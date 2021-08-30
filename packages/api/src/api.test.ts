/*
 * © 2021 Thoughtworks, Inc.
 */

import express from 'express'
import request from 'supertest'

import {
  EstimationResult,
  EmissionRatioResult,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'

import api from './api'

const mockGetCostAndEstimates = jest.fn()
const mockGetEmissionsFactors = jest.fn()
const mockGetRecommendations = jest.fn()

jest.mock('@cloud-carbon-footprint/app', () => ({
  ...(jest.requireActual('@cloud-carbon-footprint/app') as Record<
    string,
    unknown
  >),
  App: jest.fn().mockImplementation(() => {
    return {
      getCostAndEstimates: mockGetCostAndEstimates,
      getEmissionsFactors: mockGetEmissionsFactors,
      getRecommendations: mockGetRecommendations,
    }
  }),
}))

describe('api', () => {
  let server: express.Express
  const originalConsoleError = console.error

  beforeEach(() => {
    server = express()
    server.use(api)
  })

  describe('/footprint', () => {
    it('returns footprint estimates for a period of time', async () => {
      //setup
      const startDate = '2020-07-12'
      const endDate = '2020-07-13'

      const expectedResponse: EstimationResult[] = []
      mockGetCostAndEstimates.mockResolvedValueOnce(expectedResponse)

      //run
      const response = await request(server).get(
        encodeURI(`/footprint?start=${startDate}&end=${endDate}`),
      )

      //assert
      expect(response.status).toBe(200)
      expect(response.body).toEqual(expectedResponse)
    })

    describe('error handling', () => {
      beforeEach(() => (console.error = jest.fn()))
      afterEach(() => (console.error = originalConsoleError))

      it('returns bad request if start date is not specified', async () => {
        //setup
        const endDate = '2020-07-13'

        //run
        const response = await request(server).get(
          encodeURI(`/footprint?end=${endDate}`),
        )

        //assert
        expect(response.status).toBe(400)
      })

      it('returns bad request if end date is not specified', async () => {
        //setup
        const startDate = '2020-07-12'

        //run
        const response = await request(server).get(
          encodeURI(`/footprint?start=${startDate}`),
        )

        //assert
        expect(response.status).toBe(400)
      })

      it('returns server error if unexpected error happens', async () => {
        //setup
        const startDate = '2020-07-12'
        const endDate = '2020-07-13'

        //run
        mockGetCostAndEstimates.mockRejectedValueOnce(new Error('error'))
        const response = await request(server).get(
          encodeURI(`/footprint?start=${startDate}&end=${endDate}`),
        )

        //assert
        expect(response.status).toBe(500)
      })
    })
  })

  describe('/regions/emissions-factors', () => {
    it('returns data for regional emissions factors', async () => {
      const expectedResponse: EmissionRatioResult[] = [
        {
          cloudProvider: 'AWS',
          region: 'awsRegion1',
          mtPerKwHour: 1,
        },
        {
          cloudProvider: 'AWS',
          region: 'awsRegion2',
          mtPerKwHour: 2,
        },
        {
          cloudProvider: 'GCP',
          region: 'gcpRegion1',
          mtPerKwHour: 3,
        },
        {
          cloudProvider: 'GCP',
          region: 'gcpRegion2',
          mtPerKwHour: 4,
        },
      ]

      mockGetEmissionsFactors.mockResolvedValueOnce(expectedResponse)
      const response = await request(server).get(
        encodeURI(`/regions/emissions-factors`),
      )

      expect(response.status).toBe(200)
      expect(response.body).toEqual(expectedResponse)
    })

    describe('error handling', () => {
      beforeEach(() => (console.error = jest.fn()))
      afterEach(() => (console.error = originalConsoleError))

      it('returns server error if unexpected error happens', async () => {
        mockGetEmissionsFactors.mockRejectedValueOnce(new Error('error'))
        const response = await request(server).get(
          encodeURI(`/regions/emissions-factors`),
        )

        expect(response.status).toBe(500)
      })
    })
  })

  describe('/recommendations', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns data for recommendations', async () => {
      const expectedResponse: RecommendationResult[] = []

      mockGetRecommendations.mockResolvedValueOnce(expectedResponse)
      const response = await request(server).get(encodeURI('/recommendations'))

      expect(response.status).toBe(200)
      expect(response.body).toEqual(expectedResponse)
    })

    it('returns data when a Cross Instance Family AWS recommendation target is given', async () => {
      const expectedResponse: RecommendationResult[] = []

      mockGetRecommendations.mockResolvedValue(expectedResponse)
      const response = await request(server).get(
        encodeURI(
          '/recommendations?awsRecommendationTarget=CROSS_INSTANCE_FAMILY',
        ),
      )

      expect(response.status).toBe(200)
      expect(response.body).toEqual(expectedResponse)
      expect(mockGetRecommendations).toHaveBeenCalledWith({
        awsRecommendationTarget: 'CROSS_INSTANCE_FAMILY',
      })
    })

    it('returns data when a Same Instance Family AWS recommendation target is given', async () => {
      const expectedResponse: RecommendationResult[] = []

      mockGetRecommendations.mockResolvedValue(expectedResponse)
      const response = await request(server).get(
        encodeURI(
          '/recommendations?awsRecommendationTarget=SAME_INSTANCE_FAMILY',
        ),
      )

      expect(response.status).toBe(200)
      expect(response.body).toEqual(expectedResponse)
      expect(mockGetRecommendations).toHaveBeenCalledWith({
        awsRecommendationTarget: 'SAME_INSTANCE_FAMILY',
      })
    })

    describe('error handling', () => {
      beforeEach(() => (console.error = jest.fn()))
      afterEach(() => (console.error = originalConsoleError))

      it('returns server error if unexpected error happens', async () => {
        mockGetRecommendations.mockRejectedValueOnce(new Error('error'))
        const response = await request(server).get(
          encodeURI('/recommendations'),
        )

        expect(response.status).toBe(500)
      })

      it('returns bad request if an invalid recommendation target is given', async () => {
        mockGetRecommendations.mockRejectedValueOnce(new Error('error'))
        const response = await request(server).get(
          encodeURI(
            '/recommendations?awsRecommendationTarget=ULTRA_INSTANCE_FAMILY',
          ),
        )

        expect(response.status).toBe(400)
      })
    })
  })
})
