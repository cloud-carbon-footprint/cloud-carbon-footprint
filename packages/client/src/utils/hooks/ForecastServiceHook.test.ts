import { renderHook } from '@testing-library/react-hooks'
import { waitFor } from '@testing-library/react'
import useRemoteForecastService from './ForecastServiceHook'

describe('Forecast Service hook', () => {
  it('Render forecast service hook', async () => {
    const promiseExecutor1 = (res) => {
      res({
        data: [
          {
            dataEndAt: '2022-11-10T10:00:00+00:00',
            dataStartAt: '2022-11-09T10:00:00+00:00',
            forecastData: [
              {
                duration: 60,
                location: 'CAISO_NORTH',
                timestamp: '2022-11-09T07:25:00+00:00',
                value: 435.0320147282777,
              },
              {
                duration: 60,
                location: 'CAISO_NORTH',
                timestamp: '2022-11-09T07:30:00+00:00',
                value: 435.07368308252774,
              },
              {
                duration: 60,
                location: 'CAISO_NORTH',
                timestamp: '2022-11-09T07:35:00+00:00',
                value: 435.1770568685555,
              },
            ],
            generatedAt: '2022-11-09T09:55:00+00:00',
            location: 'us-west-1',
            optimalDataPoints: [
              {
                location: 'CAISO_NORTH',
                timestamp: '2022-11-09T17:10:00+00:00',
                duration: 60,
                value: 402.97351435675,
              },
            ],
            requestedAt: '2022-11-09T09:57:12.893661+00:00',
            windowSize: 60,
          },
        ],
      })
    }
    const promiseExecutor2 = (res) => {
      res({
        data: [
          {
            dataEndAt: '2022-11-10T10:00:00+00:00',
            dataStartAt: '2022-11-09T10:00:00+00:00',
            forecastData: [
              {
                duration: 60,
                location: 'CAISO_NORTH',
                timestamp: '2022-11-09T07:25:00+00:00',
                value: 435.0320147282777,
              },
              {
                duration: 60,
                location: 'CAISO_NORTH',
                timestamp: '2022-11-09T07:30:00+00:00',
                value: 435.07368308252774,
              },
              {
                duration: 60,
                location: 'CAISO_NORTH',
                timestamp: '2022-11-09T07:35:00+00:00',
                value: 435.1770568685555,
              },
            ],
            generatedAt: '2022-11-09T09:55:00+00:00',
            location: 'us-west-1',
            optimalDataPoints: [
              {
                location: 'CAISO_NORTH',
                timestamp: '2022-11-09T17:10:00+00:00',
                duration: 60,
                value: 402.97351435675,
              },
            ],
            requestedAt: '2022-11-09T09:57:12.893661+00:00',
            windowSize: 60,
          },
        ],
      })
    }
    const promiseExecutor3 = (res) => {
      res({
        data: [
          {
            dataEndAt: '2022-11-10T10:00:00+00:00',
            dataStartAt: '2022-11-09T10:00:00+00:00',
            forecastData: [
              {
                duration: 60,
                location: 'CAISO_NORTH',
                timestamp: '2022-11-09T07:25:00+00:00',
                value: 435.0320147282777,
              },
              {
                duration: 60,
                location: 'CAISO_NORTH',
                timestamp: '2022-11-09T07:30:00+00:00',
                value: 435.07368308252774,
              },
              {
                duration: 60,
                location: 'CAISO_NORTH',
                timestamp: '2022-11-09T07:35:00+00:00',
                value: 435.1770568685555,
              },
            ],
            generatedAt: '2022-11-09T09:55:00+00:00',
            location: 'us-west-1',
            optimalDataPoints: [
              {
                location: 'CAISO_NORTH',
                timestamp: '2022-11-09T17:10:00+00:00',
                duration: 60,
                value: 402.97351435675,
              },
            ],
            requestedAt: '2022-11-09T09:57:12.893661+00:00',
            windowSize: 60,
          },
        ],
      })
    }

    const testPromise1 = new Promise(promiseExecutor1)
    const testPromise2 = new Promise(promiseExecutor2)
    const testPromise3 = new Promise(promiseExecutor3)

    const params = [testPromise1, testPromise2, testPromise3]

    const { result, waitForNextUpdate } = renderHook(() =>
      useRemoteForecastService(params),
    )

    await waitForNextUpdate()

    await waitFor(() =>
      expect(result.current).toStrictEqual([
        {
          dataEndAt: '2022-11-10T10:00:00+00:00',
          dataStartAt: '2022-11-09T10:00:00+00:00',
          forecastData: [
            {
              duration: 60,
              location: 'CAISO_NORTH',
              timestamp: '2022-11-09T07:25:00+00:00',
              value: 435.0320147282777,
            },
            {
              duration: 60,
              location: 'CAISO_NORTH',
              timestamp: '2022-11-09T07:30:00+00:00',
              value: 435.07368308252774,
            },
            {
              duration: 60,
              location: 'CAISO_NORTH',
              timestamp: '2022-11-09T07:35:00+00:00',
              value: 435.1770568685555,
            },
          ],
          generatedAt: '2022-11-09T09:55:00+00:00',
          location: 'us-west-1',
          optimalDataPoints: [
            {
              location: 'CAISO_NORTH',
              timestamp: '2022-11-09T17:10:00+00:00',
              duration: 60,
              value: 402.97351435675,
            },
          ],
          requestedAt: '2022-11-09T09:57:12.893661+00:00',
          windowSize: 60,
        },
        {
          dataEndAt: '2022-11-10T10:00:00+00:00',
          dataStartAt: '2022-11-09T10:00:00+00:00',
          forecastData: [
            {
              duration: 60,
              location: 'CAISO_NORTH',
              timestamp: '2022-11-09T07:25:00+00:00',
              value: 435.0320147282777,
            },
            {
              duration: 60,
              location: 'CAISO_NORTH',
              timestamp: '2022-11-09T07:30:00+00:00',
              value: 435.07368308252774,
            },
            {
              duration: 60,
              location: 'CAISO_NORTH',
              timestamp: '2022-11-09T07:35:00+00:00',
              value: 435.1770568685555,
            },
          ],
          generatedAt: '2022-11-09T09:55:00+00:00',
          location: 'us-west-1',
          optimalDataPoints: [
            {
              location: 'CAISO_NORTH',
              timestamp: '2022-11-09T17:10:00+00:00',
              duration: 60,
              value: 402.97351435675,
            },
          ],
          requestedAt: '2022-11-09T09:57:12.893661+00:00',
          windowSize: 60,
        },
        {
          dataEndAt: '2022-11-10T10:00:00+00:00',
          dataStartAt: '2022-11-09T10:00:00+00:00',
          forecastData: [
            {
              duration: 60,
              location: 'CAISO_NORTH',
              timestamp: '2022-11-09T07:25:00+00:00',
              value: 435.0320147282777,
            },
            {
              duration: 60,
              location: 'CAISO_NORTH',
              timestamp: '2022-11-09T07:30:00+00:00',
              value: 435.07368308252774,
            },
            {
              duration: 60,
              location: 'CAISO_NORTH',
              timestamp: '2022-11-09T07:35:00+00:00',
              value: 435.1770568685555,
            },
          ],
          generatedAt: '2022-11-09T09:55:00+00:00',
          location: 'us-west-1',
          optimalDataPoints: [
            {
              location: 'CAISO_NORTH',
              timestamp: '2022-11-09T17:10:00+00:00',
              duration: 60,
              value: 402.97351435675,
            },
          ],
          requestedAt: '2022-11-09T09:57:12.893661+00:00',
          windowSize: 60,
        },
      ]),
    )
  })
})
