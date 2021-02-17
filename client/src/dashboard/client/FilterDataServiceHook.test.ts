/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { renderHook } from '@testing-library/react-hooks'
import axios from 'axios'
import { useFilterDataService } from './FilterDataServiceHook'

jest.mock('axios')
const axiosMocked = axios as jest.Mocked<typeof axios>

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn(),
  }),
}))

describe('FilterDataServiceHook', () => {
  const expectedErrorResponse = {
    accounts: [],
    services: [],
  }

  test('should send back data from /filters endpoint', async () => {
    axiosMocked.get.mockResolvedValue({
      data: '[]',
    })

    const { result, waitForNextUpdate } = renderHook(() => useFilterDataService())

    await waitForNextUpdate()

    expect(result.current).toEqual('[]')
    expect(axiosMocked.get).toBeCalledWith('/api/filters')
  })

  test('should set default error response ', async () => {
    axiosMocked.get.mockRejectedValue({
      error: 'some error',
    })

    const { result, waitForNextUpdate } = renderHook(() => useFilterDataService())

    await waitForNextUpdate()

    expect(result.current).toEqual(expectedErrorResponse)
    expect(axiosMocked.get).toBeCalledWith('/api/filters')
  })

  test('should set custom error response ', async () => {
    axiosMocked.get.mockRejectedValue({
      response: 'some custom error',
    })

    const { result, waitForNextUpdate } = renderHook(() => useFilterDataService())

    await waitForNextUpdate()

    expect(result.current).toEqual(expectedErrorResponse)
    expect(axiosMocked.get).toBeCalledWith('/api/filters')
  })
})
