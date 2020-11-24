/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { renderHook } from '@testing-library/react-hooks'
import axios from 'axios'
import { useFilterDataService } from './FilterDataServiceHook'

jest.mock('axios')
const axiosMocked = axios as jest.Mocked<typeof axios>

test('should send back data from /filters endpoint', async () => {
  axiosMocked.get.mockResolvedValue({
    data: '[]',
  })

  const { result, waitForNextUpdate } = renderHook(() => useFilterDataService())

  await waitForNextUpdate()

  expect(result.current).toEqual('[]')
  expect(axiosMocked.get).toBeCalledWith('/api/filters')
})
