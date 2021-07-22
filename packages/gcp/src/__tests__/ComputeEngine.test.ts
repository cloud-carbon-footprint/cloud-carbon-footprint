/*
 * © 2021 Thoughtworks, Inc.
 */

import { MetricServiceClient } from '@google-cloud/monitoring'
import { google } from '@google-cloud/monitoring/build/protos/protos'
import Reducer = google.monitoring.v3.Aggregation.Reducer
import { ComputeEngine } from '../lib'
import { GCP_CLOUD_CONSTANTS } from '../domain'

const mockListTimeSeries = jest.fn()

jest.mock('@google-cloud/monitoring', () => {
  return {
    MetricServiceClient: jest.fn().mockImplementation(() => {
      return {
        listTimeSeries: mockListTimeSeries,
        projectPath: jest
          .fn()
          .mockReturnValue('projects/cloud-carbon-footprint'),
        getProjectId: jest.fn().mockResolvedValue('cloud-carbon-footprint'),
      }
    }),
  }
})

describe('ComputeEngine', () => {
  const startDate = new Date('2020-09-16')
  const endDate = new Date('2020-09-17')
  const region = 'us-east1'
  const cpuMetricType = 'utilization'
  const vCpuMetricType = 'reserved_cores'

  const dayOneHourOne = new Date('2020-09-16T22:00:00.000Z')
  const dayOneHourTwo = new Date('2020-09-16T23:00:00.000Z')
  const dayOneHourOneInMilliSecs = dayOneHourOne.getTime() / 1000
  const dayOneHourTwoInMilliSecs = dayOneHourTwo.getTime() / 1000
  const mockCpuUtilizationTimeSeries = [
    {
      points: [
        {
          interval: {
            startTime: {
              seconds: dayOneHourOneInMilliSecs,
              nanos: 0,
            },
            endTime: {
              seconds: dayOneHourOneInMilliSecs,
              nanos: 0,
            },
          },
          value: {
            doubleValue: 0.25,
            value: 'doubleValue',
          },
        },
        {
          interval: {
            startTime: {
              seconds: dayOneHourTwoInMilliSecs,
              nanos: 0,
            },
            endTime: {
              seconds: dayOneHourTwoInMilliSecs,
              nanos: 0,
            },
          },
          value: {
            doubleValue: 0.75,
            value: 'doubleValue',
          },
        },
      ],
      metric: {
        labels: {},
        type: 'compute.googleapis.com/instance/cpu/utilization',
      },
      resource: {
        labels: {
          project_id: 'cloud-carbon-footprint',
        },
        type: 'gce_instance',
      },
      metricKind: 'GAUGE',
      valueType: 'DOUBLE',
    },
  ]

  const mockVCPUTimeSeries = [
    {
      points: [
        {
          interval: {
            startTime: {
              seconds: dayOneHourOneInMilliSecs,
              nanos: 0,
            },
            endTime: {
              seconds: dayOneHourOneInMilliSecs,
              nanos: 0,
            },
          },
          value: {
            doubleValue: 4,
            value: 'doubleValue',
          },
        },
        {
          interval: {
            startTime: {
              seconds: dayOneHourTwoInMilliSecs,
              nanos: 0,
            },
            endTime: {
              seconds: dayOneHourTwoInMilliSecs,
              nanos: 0,
            },
          },
          value: {
            doubleValue: 2,
            value: 'doubleValue',
          },
        },
      ],
      metric: {
        labels: {},
        type: 'compute.googleapis.com/instance/cpu/reserved_cores',
      },
    },
  ]

  afterEach(() => {
    mockListTimeSeries.mockReset()
  })

  it('gets compute engine usage for two data points', async () => {
    mockListTimeSeries.mockResolvedValueOnce([
      mockCpuUtilizationTimeSeries,
      {},
      {},
    ])
    mockListTimeSeries.mockResolvedValueOnce([mockVCPUTimeSeries, {}, {}])

    const computeEngineService = new ComputeEngine(new MetricServiceClient())
    const result = await computeEngineService.getUsage(
      startDate,
      endDate,
      region,
    )

    expect(mockListTimeSeries).toHaveBeenNthCalledWith(
      1,
      computeEngineService.buildTimeSeriesRequest(
        startDate,
        endDate,
        'projects/cloud-carbon-footprint',
        cpuMetricType,
        Reducer.REDUCE_MEAN,
        region,
      ),
    )

    expect(mockListTimeSeries).toHaveBeenNthCalledWith(
      2,
      computeEngineService.buildTimeSeriesRequest(
        startDate,
        endDate,
        'projects/cloud-carbon-footprint',
        vCpuMetricType,
        Reducer.REDUCE_SUM,
        region,
      ),
    )

    expect(result).toEqual([
      {
        cpuUtilizationAverage: 0.25,
        numberOfvCpus: 4,
        timestamp: dayOneHourOne,
        usesAverageCPUConstant: false,
      },
      {
        cpuUtilizationAverage: 0.75,
        numberOfvCpus: 2,
        timestamp: dayOneHourTwo,
        usesAverageCPUConstant: false,
      },
    ])
  })

  it('uses the average cpu utilization constant when there is no measure CPUUtilization returned', async () => {
    const mockCpuUtilizationTimeSeriesWithMissingPoint = [
      {
        points: [
          {
            interval: {
              startTime: {
                seconds: dayOneHourOneInMilliSecs,
                nanos: 0,
              },
              endTime: {
                seconds: dayOneHourOneInMilliSecs,
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
        },
        resource: {
          labels: {
            project_id: 'cloud-carbon-footprint',
          },
          type: 'gce_instance',
        },
        metricKind: 'GAUGE',
        valueType: 'DOUBLE',
      },
    ]

    mockListTimeSeries.mockResolvedValueOnce([
      mockCpuUtilizationTimeSeriesWithMissingPoint,
      {},
      {},
    ])
    mockListTimeSeries.mockResolvedValueOnce([mockVCPUTimeSeries, {}, {}])

    const computeEngineService = new ComputeEngine(new MetricServiceClient())
    const result = await computeEngineService.getUsage(
      startDate,
      endDate,
      region,
    )

    expect(result).toEqual([
      {
        cpuUtilizationAverage: 0.25,
        numberOfvCpus: 4,
        timestamp: dayOneHourOne,
        usesAverageCPUConstant: false,
      },
      {
        cpuUtilizationAverage:
          GCP_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020 / 100,
        numberOfvCpus: 2,
        timestamp: dayOneHourTwo,
        usesAverageCPUConstant: true,
      },
    ])
  })

  it('returns an empty array when listTimeSeries returns no data', async () => {
    mockListTimeSeries.mockResolvedValueOnce([[], {}, {}])
    mockListTimeSeries.mockResolvedValueOnce([[], {}, {}])

    const computeEngineService = new ComputeEngine(new MetricServiceClient())
    const result = await computeEngineService.getUsage(
      startDate,
      endDate,
      region,
    )

    expect(result).toEqual([])
  })
})
