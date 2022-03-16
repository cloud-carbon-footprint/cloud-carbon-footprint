/*
 * © 2021 Thoughtworks, Inc.
 */
import axios from 'axios'
import moment from 'moment'
import { renderHook } from '@testing-library/react-hooks'
import useRemoteService from './RemoteServiceHook'

jest.mock('axios')
const axiosMocked = axios as jest.Mocked<typeof axios>
const mockUseNavigate = jest.fn((args) =>
  console.log('history push args', args),
)

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockUseNavigate,
}))

jest.mock('ConfigLoader', () => ({
  __esModule: true,
  default: () => ({
    GROUP_BY: 'month',
  }),
}))

const startDate = moment.utc('2020-08-26')
const endDate = moment.utc('2020-08-27')
const ignoreCache = true
const region = 'us-east-2'

describe('RemoteServiceHook', () => {
  it('should send request to /api endpoint', async () => {
    axiosMocked.get.mockResolvedValue({ data: ['data'] })

    const { result, waitForNextUpdate } = renderHook(() =>
      useRemoteService([], startDate, endDate, ignoreCache, region),
    )

    await waitForNextUpdate()

    setTimeout(() => {
      expect(result.current).toEqual({
        data: ['data'],
        loading: true,
      })
    }, 1000)
    expect(axiosMocked.get).toBeCalledWith('/api/footprint', {
      params: {
        end: '2020-08-27',
        start: '2020-08-26',
        ignoreCache,
        region: region,
        groupBy: 'month',
      },
    })
  })

  it('should notify of custom error response', async () => {
    const response = { status: 500, statusText: 'Internal Service Error' }
    axiosMocked.get.mockRejectedValue({ response })

    const { result, waitForNextUpdate } = renderHook(() =>
      useRemoteService([], startDate, endDate, ignoreCache, region),
    )

    await waitForNextUpdate()

    expect(mockUseNavigate).toBeCalledWith('/error', { state: response })

    setTimeout(() => {
      expect(result.current).toEqual({
        data: [],
        loading: true,
      })
    }, 1000)
  })

  it('should notify of default error response', async () => {
    const defaultResponse = { status: '520', statusText: 'Unknown Error' }
    axiosMocked.get.mockRejectedValue('some error')

    const { result, waitForNextUpdate } = renderHook(() =>
      useRemoteService([], startDate, endDate, ignoreCache, region),
    )

    await waitForNextUpdate()

    expect(mockUseNavigate).toBeCalledWith('/error', { state: defaultResponse })

    setTimeout(() => {
      expect(result.current).toEqual({
        data: [],
        loading: true,
      })
    }, 1000)
  })
})
