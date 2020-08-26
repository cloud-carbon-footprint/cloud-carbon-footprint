import api from '@view/api'
import request from 'supertest'
import { EstimationResult } from '@application/EstimationResult'
import { EstimationRequestValidationError, RawRequest } from '@application/EstimationRequest'

const mockGetCostAndEstimates = jest.fn()
jest.mock('@application/App', () => {
  return jest.fn().mockImplementation(() => {
    return { getCostAndEstimates: mockGetCostAndEstimates }
  })
})

describe('api', () => {
  describe('/footprint', () => {
    it('should return footprint estimates for a period of time', async () => {
      //setup
      const startDate = '2020-07-12'
      const endDate = '2020-07-13'

      const expectedResponse: EstimationResult[] = []
      mockGetCostAndEstimates.mockResolvedValueOnce(expectedResponse)

      //run
      const response = await request(api).get(encodeURI(`/api/footprint?start=${startDate}&end=${endDate}`))

      //assert
      const estimationRequest: RawRequest = {
        startDate: startDate,
        endDate: endDate,
      }
      expect(mockGetCostAndEstimates).toBeCalledWith(estimationRequest)
      expect(response.status).toBe(200)
      expect(response.body).toEqual(expectedResponse)
    })

    describe('error handling', () => {
      const originalConsoleError = console.error
      beforeEach(() => (console.error = jest.fn()))
      afterEach(() => (console.error = originalConsoleError))

      it('should return bad request if start date is not specified', async () => {
        //setup
        const endDate = '2020-07-13'

        mockGetCostAndEstimates.mockRejectedValueOnce(new EstimationRequestValidationError('date error'))

        //run
        const response = await request(api).get(encodeURI(`/api/footprint?end=${endDate}`))

        //assert
        expect(response.status).toBe(400)
      })

      it('should return server error if unexpected error happens', async () => {
        //setup
        mockGetCostAndEstimates.mockRejectedValueOnce(new Error('error'))

        //run
        const response = await request(api).get(encodeURI(`/api/footprint`))

        //assert
        expect(response.status).toBe(500)
      })
    })
  })
})
