/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

const dayOneHourOne = new Date('2020-07-01T22:00:00.000Z')
const dayOneHourTwo = new Date('2020-07-01T23:00:00.000Z')
const dayOneHourOneInMilliSecs = dayOneHourOne.getTime() / 1000
const dayOneHourTwoInMilliSecs = dayOneHourTwo.getTime() / 1000

export const mockCpuUtilizationTimeSeries = [
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

export const mockVCPUTimeSeries = [
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
