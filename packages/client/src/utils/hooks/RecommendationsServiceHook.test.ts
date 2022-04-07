/*
 * © 2021 Thoughtworks, Inc.
 */

import axios from 'axios'
import { renderHook } from '@testing-library/react-hooks'
import useRemoteRecommendationsService from './RecommendationsServiceHook'

jest.mock('axios')
const axiosMocked = axios as jest.Mocked<typeof axios>

const mockUseNavigate = jest.fn((args) =>
  console.log('history push args', args),
)
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockUseNavigate,
}))

const baseUrl = '/api'
const minLoadTimeMs = 10

describe('Recommendations Service Hook', () => {
  describe('when baseUrl is null', () => {
    it('should do nothing', () => {
      const { result } = renderHook(() =>
        useRemoteRecommendationsService({
          baseUrl: null,
        }),
      )

      expect(axiosMocked.get).not.toHaveBeenCalled()
      expect(result.current).toEqual({
        data: [],
        error: null,
        loading: false,
      })
    })
  })

  describe('when baseUrl is provided', () => {
    it('should send request to /api endpoint', async () => {
      axiosMocked.get.mockResolvedValue({ data: ['data'] })

      const { result, waitForNextUpdate } = renderHook(() =>
        useRemoteRecommendationsService({
          baseUrl,
          minLoadTimeMs,
          awsRecommendationTarget: 'target',
        }),
      )

      expect(axiosMocked.get).toBeCalledWith('/api/recommendations', {
        params: {
          awsRecommendationTarget: 'target',
        },
      })

      await waitForNextUpdate()
      expect(result.current).toEqual({
        data: ['data'],
        loading: true,
        error: null,
      })

      await waitForNextUpdate()
      expect(result.current).toEqual({
        data: ['data'],
        loading: false,
        error: null,
      })
    })
  })
  describe('when response is an error', () => {
    const error = {
      message: 'Axios generated error message',
      response: {
        status: 500,
        statusText: 'Internal Service Error',
      },
    }

    beforeEach(() => {
      axiosMocked.get.mockRejectedValue(error)
    })

    it('should return the error', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useRemoteRecommendationsService({
          baseUrl,
          minLoadTimeMs,
        }),
      )

      await waitForNextUpdate()
      expect(result.current).toEqual({
        data: [],
        loading: true,
        error,
      })

      await waitForNextUpdate()
      expect(result.current).toEqual({
        data: [],
        loading: false,
        error,
      })
    })

    describe('when error handler is provided', () => {
      it('should invoke error handler with error thrown by axios', async () => {
        const onApiError = jest.fn()

        const { result, waitForNextUpdate } = renderHook(() =>
          useRemoteRecommendationsService({
            baseUrl,
            minLoadTimeMs,
            onApiError,
          }),
        )

        await waitForNextUpdate()
        expect(result.current).toEqual({
          data: [],
          loading: true,
          error,
        })
        expect(onApiError).toHaveBeenCalledWith(error)

        await waitForNextUpdate()
        expect(result.current).toEqual({
          data: [],
          loading: false,
          error,
        })
      })
    })
  })
})
