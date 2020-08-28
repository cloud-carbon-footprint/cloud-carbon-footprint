import useRemoteService from './RemoteServiceHook'
import { renderHook } from '@testing-library/react-hooks'
import axios from 'axios'

jest.mock('axios')
const axiosMocked = axios as jest.Mocked<typeof axios>

test('should send request to /api endpoint', async () => {
  axiosMocked.get.mockResolvedValue({ data: ['data'] })

  const { result, waitForNextUpdate } = renderHook(() => useRemoteService([], '2020-08-26', '2020-08-27'))

  await waitForNextUpdate()

  expect(result.current).toEqual({
    data: ['data'],
    loading: false,
    error: false,
  })
  expect(axiosMocked.get).toBeCalledWith('/api/footprint', {
    params: { end: '2020-08-27', start: '2020-08-26' },
  })
})

test('should notify of erronous response', async () => {
  axiosMocked.get.mockRejectedValue()

  const { result, waitForNextUpdate } = renderHook(() => useRemoteService([], '2020-08-26', '2020-08-27'))

  await waitForNextUpdate()

  expect(result.current).toEqual({
    data: [],
    loading: false,
    error: true,
  })
})
