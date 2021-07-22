/*
 * © 2021 Thoughtworks, Inc.
 */

import useRemoteService from './RemoteServiceHook'
import { renderHook } from '@testing-library/react-hooks'
import axios from 'axios'
import moment from 'moment'

jest.mock('axios')
const axiosMocked = axios as jest.Mocked<typeof axios>

const mockPush = jest.fn((args) => console.log('history push args', args))
jest.mock('react-router-dom', () => ({
  useHistory: () => ({ push: mockPush }),
}))

const startDate = moment.utc('2020-08-26')
const endDate = moment.utc('2020-08-27')
const region = 'us-east-2'

describe('RemoteServiceHook', () => {
  test('should send request to /api endpoint', async () => {
    axiosMocked.get.mockResolvedValue({ data: ['data'] })

    const { result, waitForNextUpdate } = renderHook(() =>
      useRemoteService([], startDate, endDate, region),
    )

    await waitForNextUpdate()

    setTimeout(() => {
      expect(result.current).toEqual({
        data: ['data'],
        loading: true,
      })
    }, 1000)
    expect(axiosMocked.get).toBeCalledWith('/api/footprint', {
      params: { end: '2020-08-27', start: '2020-08-26', region: region },
    })
  })

  test('should notify of custom error response', async () => {
    const response = { status: 500, statusText: 'Internal Service Error' }
    axiosMocked.get.mockRejectedValue({ response })

    const { result, waitForNextUpdate } = renderHook(() =>
      useRemoteService([], startDate, endDate, region),
    )

    await waitForNextUpdate()

    expect(mockPush).toBeCalledWith('/error', response)

    setTimeout(() => {
      expect(result.current).toEqual({
        data: [],
        loading: true,
      })
    }, 1000)
  })

  test('should notify of default error response', async () => {
    const defaultResponse = { status: '520', statusText: 'Unknown Error' }
    axiosMocked.get.mockRejectedValue('some error')

    const { result, waitForNextUpdate } = renderHook(() =>
      useRemoteService([], startDate, endDate, region),
    )

    await waitForNextUpdate()

    expect(mockPush).toBeCalledWith('/error', defaultResponse)

    setTimeout(() => {
      expect(result.current).toEqual({
        data: [],
        loading: true,
      })
    }, 1000)
  })
})
