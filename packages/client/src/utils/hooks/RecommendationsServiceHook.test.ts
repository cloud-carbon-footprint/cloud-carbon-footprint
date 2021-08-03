/*
 * © 2021 Thoughtworks, Inc.
 */

import axios from 'axios'
import { renderHook } from '@testing-library/react-hooks'
import useRemoteRecommendationsService from './RecommendationsServiceHook'

jest.mock('axios')
const axiosMocked = axios as jest.Mocked<typeof axios>

describe('Recommendations Service Hook', () => {
  it('should send request to /api/recommendations endpoint', async () => {
    axiosMocked.get.mockResolvedValue({ data: ['test recommendation data'] })

    const { result, waitForNextUpdate } = renderHook(() =>
      useRemoteRecommendationsService(),
    )

    await waitForNextUpdate()

    setTimeout(() => {
      expect(result.current).toEqual({
        data: ['test recommendation data'],
        loading: true,
      })
    }, 1000)

    expect(axiosMocked.get).toBeCalledWith('/api/recommendations')
  })
})
