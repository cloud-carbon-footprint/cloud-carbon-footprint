import ComputeEngine from '@services/gcp/ComputeEngine'
import { MetricServiceClient } from '@google-cloud/monitoring'
import { google } from '@google-cloud/monitoring/build/protos/protos'
import Reducer = google.monitoring.v3.Aggregation.Reducer
import Mock = jest.Mock

jest.mock('@google-cloud/monitoring', () => {
  return {
    MetricServiceClient: jest.fn(),
  }
})

describe('ComputeEngine', () => {
  const metricServiceClientMock = (MetricServiceClient as unknown) as Mock
  const mockListTimeSeries = jest.fn()
  metricServiceClientMock.mockImplementation(() => {
    return {
      listTimeSeries: mockListTimeSeries,
      projectPath: jest.fn().mockReturnValue('projects/cloud-carbon-footprint'),
    }
  })

  const startDate = new Date('2020-09-16')
  const endDate = new Date('2020-09-17')
  const region = 'us-east1'
  const cpuMetricType = 'utilization'
  const vCpuMetricType = 'reserved_cores'

  const dayOneHourOne = new Date('2020-09-16T22:00:00.000Z')
  const dayOneHourTwo = new Date('2020-09-16T23:00:00.000Z')
  const dayOneHourOneInMilliSecs = dayOneHourOne.getTime() / 1000
  const dayOneHourTwoInMilliSecs = dayOneHourTwo.getTime() / 1000

  afterEach(() => {
    mockListTimeSeries.mockReset()
    metricServiceClientMock.mockReset()
  })

  it('gets compute engine usage for two data points', async () => {
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

    mockListTimeSeries.mockResolvedValueOnce([mockCpuUtilizationTimeSeries, {}, {}])

    mockListTimeSeries.mockResolvedValueOnce([mockVCPUTimeSeries, {}, {}])

    const computeEngineService = new ComputeEngine()
    const result = await computeEngineService.getUsage(startDate, endDate, region)

    //expect mockListTimeSeries to have been called with start, end, and region
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
    //and with correct metric type in filter
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

  //TODO
  // add test for no results in gcp request
})
