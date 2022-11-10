import { renderHook } from '@testing-library/react-hooks'
import { waitFor } from '@testing-library/react'
import useRemoteRegionRecommendationService from './RegionRecommendationServiceHook'

describe('Region Recommendation Service hook', () => {
  it('Render region recommendation hook', async () => {
    const promiseExecutor1 = (res) => {
      res({
        data: {
          location: 'us-east-1',
          startTime: '2020-01-25T00:00:00+00:00',
          endTime: '2020-02-25T00:00:00+05:30',
          carbonIntensity: 617.3369634751824,
        },
      })
    }
    const promiseExecutor2 = (res) => {
      res({
        data: {
          location: 'us-east-1',
          startTime: '2020-01-25T00:00:00+00:00',
          endTime: '2020-02-25T00:00:00+05:30',
          carbonIntensity: 617.3369634751824,
        },
      })
    }
    const promiseExecutor3 = (res) => {
      res({
        data: {
          location: 'us-east-1',
          startTime: '2020-01-25T00:00:00+00:00',
          endTime: '2020-02-25T00:00:00+05:30',
          carbonIntensity: 617.3369634751824,
        },
      })
    }

    const testPromise1 = new Promise(promiseExecutor1)
    const testPromise2 = new Promise(promiseExecutor2)
    const testPromise3 = new Promise(promiseExecutor3)

    const params = [testPromise1, testPromise2, testPromise3]

    const { result, waitForNextUpdate } = renderHook(() =>
      useRemoteRegionRecommendationService(params),
    )

    await waitForNextUpdate()

    await waitFor(() => {
      expect(result.current.data).toStrictEqual([
        {
          location: 'us-east-1',
          startTime: '2020-01-25T00:00:00+00:00',
          endTime: '2020-02-25T00:00:00+05:30',
          carbonIntensity: 617.3369634751824,
        },
        {
          location: 'us-east-1',
          startTime: '2020-01-25T00:00:00+00:00',
          endTime: '2020-02-25T00:00:00+05:30',
          carbonIntensity: 617.3369634751824,
        },
        {
          location: 'us-east-1',
          startTime: '2020-01-25T00:00:00+00:00',
          endTime: '2020-02-25T00:00:00+05:30',
          carbonIntensity: 617.3369634751824,
        },
      ])
      expect(result.current.error).toBeNull()
      expect(result.current.loading).toBe(false)
    })
  })
})
