/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
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

test('should send request to /api endpoint', async () => {
  axiosMocked.get.mockResolvedValue({ data: ['data'] })

  const { result, waitForNextUpdate } = renderHook(() => useRemoteService([], startDate, endDate, region))

  await waitForNextUpdate()

  expect(result.current).toEqual({
    data: ['data'],
    loading: false,
  })
  expect(axiosMocked.get).toBeCalledWith('/api/footprint', {
    params: { end: '2020-08-27', start: '2020-08-26', region: region },
  })
})

test('should notify of erronous response', async () => {
  const response = { status: 500, statusText: 'Internal Service Error' }
  axiosMocked.get.mockRejectedValue({ response })

  const { result, waitForNextUpdate } = renderHook(() => useRemoteService([], startDate, endDate, region))

  await waitForNextUpdate()

  expect(mockPush).toBeCalledWith('/error', response)

  expect(result.current).toEqual({
    data: [],
    loading: false,
  })
})
