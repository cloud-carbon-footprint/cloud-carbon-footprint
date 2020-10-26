/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import useRemoteService from './RemoteServiceHook'
import { renderHook } from '@testing-library/react-hooks'
import axios from 'axios'
import moment from 'moment'

jest.mock('axios')
const axiosMocked = axios as jest.Mocked<typeof axios>

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
    error: false,
  })
  expect(axiosMocked.get).toBeCalledWith('/api/footprint', {
    params: { end: '2020-08-27', start: '2020-08-26', region: region },
  })
})

test('should notify of erronous response', async () => {
  axiosMocked.get.mockRejectedValue(null)

  const { result, waitForNextUpdate } = renderHook(() => useRemoteService([], startDate, endDate, region))

  await waitForNextUpdate()

  expect(result.current).toEqual({
    data: [],
    loading: false,
    error: true,
  })
})
