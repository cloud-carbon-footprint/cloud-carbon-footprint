/*
 * © 2021 Thoughtworks, Inc.
 */
import axios from 'axios'
import moment from 'moment'
import { renderHook } from '@testing-library/react-hooks'
import { EstimationResult, GroupBy } from '@cloud-carbon-footprint/common'
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
const mockEstimationResult: EstimationResult = {
  timestamp: moment.utc('2020-08-27').toDate(),
  serviceEstimates: [],
  groupBy: GroupBy.day,
}
const ignoreCache = true
const region = 'us-east-2'
const baseUrl = '/api'
const minLoadTimeMs = 10
const groupBy = 'day'

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
      axiosMocked.get.mockResolvedValue({ data: [mockEstimationResult] })

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
          groupBy: 'day',
          skip: 0,
        },
      })

      await waitForNextUpdate()
      expect(result.current).toEqual({
        data: [mockEstimationResult],
        loading: true,
        error: null,
      })

      await waitForNextUpdate()
      expect(result.current).toEqual({
        data: [mockEstimationResult],
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

  describe('when data is paginated', () => {
    it('should send initial request to /api endpoint with limit and skip value', async () => {
      const mockEstimate: EstimationResult = {
        timestamp: moment.utc('2022-02-05').toDate(),
        serviceEstimates: [],
        groupBy: GroupBy.day,
      }
      axiosMocked.get.mockResolvedValue({ data: [mockEstimate] })

      const start = moment.utc('2022-02-01')
      const end = moment.utc('2022-02-05')

      const { result, waitForNextUpdate } = renderHook(() =>
        useRemoteFootprintService({
          baseUrl,
          startDate: start,
          endDate: end,
          ignoreCache,
          region,
          minLoadTimeMs,
          groupBy: GroupBy.day,
          limit: 90,
        }),
      )

      expect(axiosMocked.get).toBeCalledWith('/api/footprint', {
        params: {
          end: '2022-02-05',
          start: '2022-02-01',
          ignoreCache,
          region: region,
          groupBy: 'day',
          limit: 90,
          skip: 0,
        },
      })

      await waitForNextUpdate()
      expect(result.current).toEqual({
        data: [mockEstimate],
        loading: true,
        error: null,
      })

      await waitForNextUpdate()
      expect(result.current).toEqual({
        data: [mockEstimate],
        loading: false,
        error: null,
      })
    })
    it('should make more requests to /api endpoint if there is another page of estimates', async () => {
      const mockEstimate: EstimationResult = {
        timestamp: moment.utc('2022-02-01').toDate(),
        serviceEstimates: [
          {
            cloudProvider: 'AWS',
            accountId: 'accountId',
            accountName: 'accountName',
            serviceName: 'serviceName',
            region: 'region',
            cost: 0,
            kilowattHours: 0,
            co2e: 0,
          },
        ],
        groupBy: GroupBy.day,
      }
      const mockEstimateTwo: EstimationResult = {
        timestamp: moment.utc('2022-02-01').toDate(),
        serviceEstimates: [
          {
            cloudProvider: 'GCP',
            accountId: 'accountId',
            accountName: 'accountName',
            serviceName: 'serviceName',
            region: 'region',
            cost: 0,
            kilowattHours: 0,
            co2e: 0,
          },
        ],
        groupBy: GroupBy.day,
      }

      axiosMocked.get.mockResolvedValueOnce({ data: [mockEstimate] })

      const start = moment.utc('2022-02-01')
      const end = moment.utc('2022-02-05')

      const { result, waitForNextUpdate } = renderHook(() =>
        useRemoteFootprintService({
          baseUrl,
          startDate: start,
          endDate: end,
          ignoreCache: false,
          region,
          minLoadTimeMs,
          groupBy: GroupBy.day,
          limit: 1,
        }),
      )

      expect(axiosMocked.get).toBeCalledWith('/api/footprint', {
        params: {
          end: '2022-02-05',
          start: '2022-02-01',
          ignoreCache: false,
          region: region,
          groupBy: 'day',
          limit: 1,
          skip: 0,
        },
      })

      // Second call
      axiosMocked.get.mockResolvedValueOnce({ data: [mockEstimateTwo] })
      await waitForNextUpdate()

      expect(axiosMocked.get).toBeCalledWith('/api/footprint', {
        params: {
          end: '2022-02-05',
          start: '2022-02-01',
          ignoreCache: false,
          region: region,
          groupBy: 'day',
          limit: 1,
          skip: 1,
        },
      })

      await waitForNextUpdate()
      expect(result.current).toEqual({
        data: [mockEstimate],
        loading: false,
        error: null,
      })
    })
  })
})
