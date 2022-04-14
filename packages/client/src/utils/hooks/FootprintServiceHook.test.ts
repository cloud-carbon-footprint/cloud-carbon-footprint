/*
 * © 2021 Thoughtworks, Inc.
 */
import axios from 'axios'
import moment from 'moment'
import { renderHook } from '@testing-library/react-hooks'
import useRemoteFootprintService from './FootprintServiceHook'

jest.mock('axios')
const axiosMocked = axios as jest.Mocked<typeof axios>
const mockUseNavigate = jest.fn((args) =>
  console.log('history push args', args),
)

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockUseNavigate,
}))

const startDate = moment.utc('2020-08-26')
const endDate = moment.utc('2020-08-27')
const ignoreCache = true
const region = 'us-east-2'
const baseUrl = '/api'
const minLoadTimeMs = 10
const groupBy = 'month'

describe('FootprintServiceHook', () => {
  describe('when baseUrl is null', () => {
    it('should do nothing', () => {
      const { result } = renderHook(() =>
        useRemoteFootprintService({
          baseUrl: null,
          startDate,
          endDate,
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
        useRemoteFootprintService({
          baseUrl,
          startDate,
          endDate,
          ignoreCache,
          region,
          minLoadTimeMs,
          groupBy,
        }),
      )

      expect(axiosMocked.get).toBeCalledWith('/api/footprint', {
        params: {
          end: '2020-08-27',
          start: '2020-08-26',
          ignoreCache,
          region: region,
          groupBy: 'month',
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

      it('should return error', async () => {
        const { result, waitForNextUpdate } = renderHook(() =>
          useRemoteFootprintService({
            baseUrl,
            initial: [],
            startDate,
            endDate,
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
            useRemoteFootprintService({
              baseUrl,
              initial: [],
              startDate,
              endDate,
              onApiError,
              minLoadTimeMs,
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
})
