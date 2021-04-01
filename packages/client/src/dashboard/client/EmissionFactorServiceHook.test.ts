/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import axios from 'axios'
import { renderHook } from '@testing-library/react-hooks'
import useRemoteService from './EmissionFactorServiceHook'

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
})
