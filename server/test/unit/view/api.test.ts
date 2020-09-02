import api from '@view/api'
import request from 'supertest'
import { EstimationResult } from '@application/EstimationResult'
import { EstimationRequestValidationError } from '@application/EstimationRequest'
import { RawRequest } from '@view/RawRequest'

const mockGetCostAndEstimates = jest.fn()
jest.mock('@application/App', () => {
  return jest.fn().mockImplementation(() => {
    return { getCostAndEstimates: mockGetCostAndEstimates }
  })
})

describe('api', () => {
  describe('/footprint', () => {
    it('should return footprint estimates for a period of time and region', async () => {
      //setup
      const startDate = '2020-07-12'
      const endDate = '2020-07-13'
      const region = 'us-east-1'

      const expectedResponse: EstimationResult[] = []
      mockGetCostAndEstimates.mockResolvedValueOnce(expectedResponse)

      //run
      const response = await request(api).get(
        encodeURI(`/api/footprint?start=${startDate}&end=${endDate}&region=${region}`),
      )

      //assert
      const estimationRequest: RawRequest = {
        startDate: startDate,
        endDate: endDate,
        region: region,
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
        const region = 'us-east-2'

        mockGetCostAndEstimates.mockRejectedValueOnce(new EstimationRequestValidationError('date error'))

        //run
        const response = await request(api).get(encodeURI(`/api/footprint?end=${endDate}&region=${region}`))

        //assert
        expect(response.status).toBe(400)
      })

      it('should return bad request if end date is not specified', async () => {
        //setup
        const startDate = '2020-07-12'
        const region = 'us-east-2'

        mockGetCostAndEstimates.mockRejectedValueOnce(new EstimationRequestValidationError('date error'))

        //run
        const response = await request(api).get(encodeURI(`/api/footprint?start=${startDate}&region=${region}`))

        //assert
        expect(response.status).toBe(400)
      })

      it('should return bad request if region is not specified', async () => {
        //setup
        const startDate = '2020-07-12'
        const endDate = '2020-07-13'

        mockGetCostAndEstimates.mockRejectedValueOnce(new EstimationRequestValidationError('date error'))

        //run
        const response = await request(api).get(encodeURI(`/api/footprint?start=${startDate}&end=${endDate}`))

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
