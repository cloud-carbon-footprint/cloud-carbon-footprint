/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import express from 'express'
import api from '@view/api'
import request from 'supertest'
import { EstimationResult } from '@application/EstimationResult'

const mockGetCostAndEstimates = jest.fn()
const mockGetFilterData = jest.fn()

jest.mock('@application/App', () => {
  return jest.fn().mockImplementation(() => {
    return { getCostAndEstimates: mockGetCostAndEstimates, getFilterData: mockGetFilterData }
  })
})

describe('api', () => {
  let server: express.Express

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
      const response = await request(server).get(encodeURI(`/footprint?start=${startDate}&end=${endDate}`))

      //assert
      expect(response.status).toBe(200)
      expect(response.body).toEqual(expectedResponse)
    })

    describe('error handling', () => {
      const originalConsoleError = console.error
      beforeEach(() => (console.error = jest.fn()))
      afterEach(() => (console.error = originalConsoleError))

      it('returns bad request if start date is not specified', async () => {
        //setup
        const endDate = '2020-07-13'

        //run
        const response = await request(server).get(encodeURI(`/footprint?end=${endDate}`))

        //assert
        expect(response.status).toBe(400)
      })

      it('returns bad request if end date is not specified', async () => {
        //setup
        const startDate = '2020-07-12'

        //run
        const response = await request(server).get(encodeURI(`/footprint?start=${startDate}`))

        //assert
        expect(response.status).toBe(400)
      })

      it('returns server error if unexpected error happens', async () => {
        //setup
        const startDate = '2020-07-12'
        const endDate = '2020-07-13'

        //run
        mockGetCostAndEstimates.mockRejectedValueOnce(new Error('error'))
        const response = await request(server).get(encodeURI(`/footprint?start=${startDate}&end=${endDate}`))

        //assert
        expect(response.status).toBe(500)
      })
    })
  })

  describe('/filters', () => {
    it('returns data for filtering purposes', async () => {
      const response = await request(server).get(encodeURI(`/filters`))

      expect(response.status).toBe(200)
    })
  })
})
