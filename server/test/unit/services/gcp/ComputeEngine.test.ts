import ComputeEngine from '@services/gcp/ComputeEngine'
import { MetricServiceClient } from '@google-cloud/monitoring'
import Mock = jest.Mock
import { buildComputeUsages } from '@domain/ComputeUsage'

jest.mock('@google-cloud/monitoring', () => {
  return {
    MetricServiceClient: jest.fn(),
  }
})

const computeUsageModule = require('@domain/ComputeUsage')
const buildComputeUsagesMock = jest.spyOn(computeUsageModule, "buildComputeUsages")

describe('ComputeEngine', () => {
  const metricServiceClientMock = (MetricServiceClient as unknown) as Mock
  const mockListTimeSeries = jest.fn()
  metricServiceClientMock.mockImplementation(() => {
    return {
      listTimeSeries: mockListTimeSeries,
      projectPath: jest.fn(),
    }
  })

  it('should use the timeSeries fn', async () => {
    const ce = new ComputeEngine()
    const startDate = new Date('2020-07-10')
    const endDate = new Date('2020-07-11')
    const region = 'us-east1'

    mockListTimeSeries.mockResolvedValueOnce(
      [[
        {
            points: [
              {
                interval: {
                  startTime: {
                    seconds: 1600297200, //see the date for this with new Date(1600297200 * 1000)
                    nanos: 0,
                  },
                  endTime: {
                    seconds: 1600297200,
                    nanos: 0,
                  },
                },
                value: {
                  doubleValue: 0.25,
                  value: 'doubleValue',
                },
              },
            ],
            metric: {
              labels: {},
              type: 'compute.googleapis.com/instance/cpu/utilization',
            }
          }],
          {},
          {}
      ]
    )

    //also mock vcpus response
    mockListTimeSeries.mockResolvedValueOnce(
        [[
          {
            points: [
              {
                interval: {
                  startTime: {
                    seconds: '1600297200', //see the date for this with new Date(1600297200 * 1000)
                    nanos: 0,
                  },
                  endTime: {
                    seconds: '1600297200',
                    nanos: 0,
                  },
                },
                value: {
                  doubleValue: 0.25,
                  value: 'doubleValue',
                },
              },
            ],
            metric: {
              labels: {},
              type: 'compute.googleapis.com/instance/cpu/reserved_cores',
            },
          }],
          {},
          {}
        ]
      )

    // expect(await ce.getUsage(startDate, endDate, region)).toEqual([
    //   {
    //     cpuUtilizationAverage: 0.25, //should be the average of CPUUtilization accross vcpus per hour
    //     numberOfvCpus: 4,
    //     timestamp: new Date('2020-09-16T23:00:00.000Z'),
    //     usesAverageCPUConstant: false,
    //   },
    // ])


    const result = await ce.getUsage(startDate, endDate, region)
    
    expect(buildComputeUsagesMock).toHaveBeenCalled()
  })

})
