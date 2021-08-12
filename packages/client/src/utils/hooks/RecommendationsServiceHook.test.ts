/*
 * © 2021 Thoughtworks, Inc.
 */

import axios from 'axios'
import { renderHook } from '@testing-library/react-hooks'
import useRemoteRecommendationsService from './RecommendationsServiceHook'

jest.mock('axios')
const axiosMocked = axios as jest.Mocked<typeof axios>

const mockPush = jest.fn((args) => console.log('history push args', args))
jest.mock('react-router-dom', () => ({
  useHistory: () => ({ push: mockPush }),
}))

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

  it('should send request with a specified recommendation target', async () => {
    axiosMocked.get.mockResolvedValue({
      data: ['test recommendation cross instance data'],
    })
    const recommendationTarget = 'CROSS_INSTANCE_FAMILY'

    const { result, waitForNextUpdate } = renderHook(() =>
      useRemoteRecommendationsService(recommendationTarget),
    )

    await waitForNextUpdate()

    setTimeout(() => {
      expect(result.current).toEqual({
        data: ['test recommendation cross instance data'],
        loading: true,
      })
    }, 1000)

    expect(axiosMocked.get).toBeCalledWith('/api/recommendations', {
      params: { awsRecommendationTarget: recommendationTarget },
    })
  })

  it('should notify of internal server error', async () => {
    const response = { status: 500, statusText: 'Internal Server Error' }
    axiosMocked.get.mockRejectedValue({ response })

    const { result, waitForNextUpdate } = renderHook(() =>
      useRemoteRecommendationsService(),
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

  it('should notify of a default error response', async () => {
    const defaultResponse = { status: '520', statusText: 'Unknown Error' }
    axiosMocked.get.mockRejectedValue('some error')

    const { result, waitForNextUpdate } = renderHook(() =>
      useRemoteRecommendationsService(),
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

  it('should notify of a recommendation target error response', async () => {
    const response = {
      status: '400',
      statusText: 'Bad Request',
    }
    axiosMocked.get.mockRejectedValue({ response })

    const { result, waitForNextUpdate } = renderHook(() =>
      useRemoteRecommendationsService(),
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
})
