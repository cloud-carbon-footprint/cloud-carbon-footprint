import ComputeEngine from '@services/gcp/ComputeEngine'
import { MetricServiceClient } from '@google-cloud/monitoring'
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
      projectPath: jest.fn(),
    }
  })

  it('gets compute engine usage for two data points', async () => {
    const computeEngineService = new ComputeEngine()

    //these could be any day, since we're mocking the response. is that ok?
    const startDate = new Date('2020-09-16')
    const endDate = new Date('2020-09-17')
    const region = 'us-east1'

    //will be data points one hour apart, already aggregated across instances as defined in request aggregation
    const mockCpuUtilizationTimeSeries = [
      {
        points: [
          {
            interval: {
              startTime: {
                seconds: 1600297200,
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
          {
            interval: {
              startTime: {
                seconds: 1600293600,
                nanos: 0,
              },
              endTime: {
                seconds: 1600293600,
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
                seconds: '1600297200',
                nanos: 0,
              },
              endTime: {
                seconds: '1600297200',
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
                seconds: 1600293600,
                nanos: 0,
              },
              endTime: {
                seconds: 1600293600,
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

    //listTimeSeries resolves with an array of 1. TimeSeries array 2. listTimeSeriesRequest 3. listTimeSeriesResponse
    //we don't care about the listTimeSeriesRequest/Response right now.
    // We may need the response when we need to paginate through results
    mockListTimeSeries.mockResolvedValueOnce([mockCpuUtilizationTimeSeries, {}, {}])

    //also mock vcpus response
    mockListTimeSeries.mockResolvedValueOnce([mockVCPUTimeSeries, {}, {}])

    const result = await computeEngineService.getUsage(startDate, endDate, region)

    expect(result).toEqual([
      {
        cpuUtilizationAverage: 0.25,
        numberOfvCpus: 4,
        timestamp: new Date('2020-09-16T23:00:00.000Z'),
        usesAverageCPUConstant: false,
      },
      {
        cpuUtilizationAverage: 0.75,
        numberOfvCpus: 2,
        timestamp: new Date('2020-09-16T23:00:00.000Z'),
        usesAverageCPUConstant: false,
      },
    ])
  })

  //do we need to assert expectations on the request that we're making to the client?
  //the test we have won't catch a badly written request, but would testing the request be tied
  //too tightly to the implementation?
})
