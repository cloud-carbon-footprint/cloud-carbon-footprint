/*
 * © 2021 Thoughtworks, Inc.
 */

import axios from 'axios'
import { renderHook } from '@testing-library/react-hooks'
import useRemoteEmissionService from './EmissionFactorServiceHook'

jest.mock('axios')
const axiosMocked = axios as jest.Mocked<typeof axios>

const mockUseNavigate = jest.fn((args) =>
  console.log('history push args', args),
)
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockUseNavigate,
}))

const baseUrl = '/api'

describe('EmissionFactorServiceHook', () => {
  describe('when baseUrl is null', () => {
    it('should do nothing', () => {
      const { result } = renderHook(() =>
        useRemoteEmissionService({
          baseUrl: null,
        }),
      )

      expect(axiosMocked.get).not.toHaveBeenCalled()
      expect(result.current).toEqual({
        data: [],
        error: null,
        loading: true,
      })
    })
  })
  describe('when baseUrl is provided', () => {
    it('Should send api call to /regions/emissions-factors', async () => {
      axiosMocked.get.mockResolvedValue({ data: ['data'] })

      const { result, waitForNextUpdate } = renderHook(() =>
        useRemoteEmissionService({
          baseUrl,
        }),
      )

      expect(axios.get).toBeCalledWith('/api/regions/emissions-factors')

      await waitForNextUpdate()
      expect(result.current).toEqual({
        data: ['data'],
        loading: false,
        error: null,
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
          useRemoteEmissionService({
            baseUrl,
          }),
        )

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
            useRemoteEmissionService({
              baseUrl,
              onApiError,
            }),
          )

          await waitForNextUpdate()
          expect(result.current).toEqual({
            data: [],
            loading: false,
            error,
          })
          expect(onApiError).toHaveBeenCalledWith(error)
        })
      })
    })
  })
})
