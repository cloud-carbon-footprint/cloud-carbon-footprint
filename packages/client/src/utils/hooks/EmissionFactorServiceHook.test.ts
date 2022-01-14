/*
 * © 2021 Thoughtworks, Inc.
 */

import axios from 'axios'
import { renderHook } from '@testing-library/react-hooks'
import useRemoteService from './EmissionFactorServiceHook'

jest.mock('axios')
const axiosMocked = axios as jest.Mocked<typeof axios>

const mockUseNavigate = jest.fn((args) =>
  console.log('history push args', args),
)
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockUseNavigate,
}))

describe('EmissionFactorServiceHook', () => {
  it('Should send api call to /regions/emissions-factors', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: ['data'],
      loading: false,
    })

    const { result, waitForNextUpdate } = renderHook(() => useRemoteService())

    await waitForNextUpdate()

    expect(result.current).toEqual({
      data: ['data'],
      loading: false,
    })

    expect(axios.get).toBeCalledWith('/api/regions/emissions-factors')
  })

  test('should notify of custom error response', async () => {
    const response = { status: 500, statusText: 'Internal Service Error' }
    axiosMocked.get.mockRejectedValue({ response })

    const { result, waitForNextUpdate } = renderHook(() => useRemoteService())

    await waitForNextUpdate()

    expect(mockUseNavigate).toBeCalledWith('/error', { state: response })

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

    const { result, waitForNextUpdate } = renderHook(() => useRemoteService())

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
