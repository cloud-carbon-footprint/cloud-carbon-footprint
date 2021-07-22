/*
 * © 2021 Thoughtworks, Inc.
 */

import { CloudWatch } from 'aws-sdk'

const dayOne = '2020-07-01'
const hourOne = 'T22:00:00.000Z'
const hourTwo = 'T23:00:00.000Z'

export const ec2MockGetMetricDataResponse: CloudWatch.GetMetricDataOutput = {
  MetricDataResults: [
    {
      Id: 'cpuUtilization',
      Label: 'AWS/EC2 i-01914bfb56d65a9ae CPUUtilization',
      Timestamps: [new Date(dayOne + hourOne), new Date(dayOne + hourTwo)],
      Values: [22.983333333333334, 31.435897435897434],
      StatusCode: 'Complete',
      Messages: [],
    },
    {
      Id: 'cpuUtilization',
      Label: 'AWS/EC2 i-0d1808334c391e056 CPUUtilization',
      Timestamps: [new Date(dayOne + hourOne), new Date(dayOne + hourTwo)],
      Values: [11.566666666666666, 24.25],
      StatusCode: 'Complete',
      Messages: [],
    },
    {
      Id: 'vCPUs',
      Label: 'AWS/Usage Standard/OnDemand vCPU EC2 Resource ResourceCount',
      Timestamps: [new Date(dayOne + hourOne), new Date(dayOne + hourTwo)],
      Values: [4000, 4500],
      StatusCode: 'Complete',
      Messages: [],
    },
    {
      Id: 'cpuUtilization',
      Label: 'AWS/EC2 i-0d1808334c391e056 CPUUtilization',
      Timestamps: [new Date(dayOne + hourOne), new Date(dayOne + hourTwo)],
      Values: [100, 99.99999],
      StatusCode: 'Complete',
      Messages: [],
    },
  ],
  Messages: [],
}

export const elastiCacheMockGetMetricDataResponse: CloudWatch.GetMetricDataOutput =
  {
    MetricDataResults: [
      {
        Id: 'cpuUtilization',
        Label: 'AWS/ElastiCache CPUUtilization',
        Timestamps: [new Date(dayOne + hourOne), new Date(dayOne + hourTwo)],
        Values: [1.0456, 2.03242],
        StatusCode: 'Complete',
        Messages: [],
      },
    ],
  }

export const s3MockGetMetricDataResponse: CloudWatch.GetMetricDataOutput = {
  MetricDataResults: [
    {
      Id: 's3Size',
      Label: 's3Size',
      Timestamps: [new Date(dayOne)],
      Values: [2586032500000],
      StatusCode: 'Complete',
      Messages: [],
    },
  ],
}

export const rdsMockComputeGetMetricDataResponse: CloudWatch.GetMetricDataOutput =
  {
    MetricDataResults: [
      {
        Id: 'cpuUtilization',
        Timestamps: [new Date(dayOne + hourOne), new Date(dayOne + hourTwo)],
        Values: [22.983333333333334, 31.435897435897434],
      },
      {
        Id: 'cpuUtilization',
        Timestamps: [new Date(dayOne + hourOne), new Date(dayOne + hourTwo)],
        Values: [11.566666666666666, 24.25],
      },
    ],
  }
