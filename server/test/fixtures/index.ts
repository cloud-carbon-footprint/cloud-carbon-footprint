import AWS from 'aws-sdk'

export const s3MockResponse: AWS.CloudWatch.GetMetricDataOutput = {
  MetricDataResults: [
    {
      Id: 's3Size',
      Label: 's3Size',
      Timestamps: [new Date('2020-06-27T00:00:00.000Z')],
      Values: [2586032500],
      StatusCode: 'Complete',
      Messages: [],
    },
  ],
}

export const ec2MockResponse: AWS.CloudWatch.GetMetricDataOutput = {
  MetricDataResults: [
    {
      Id: 'cpuUtilization',
      Label: 'AWS/EC2 i-01914bfb56d65a9ae CPUUtilization',
      Timestamps: [new Date('2020-06-27T22:00:00.000Z'), new Date('2020-06-27T23:00:00.000Z')],
      Values: [22.983333333333334, 31.435897435897434],
      StatusCode: 'Complete',
      Messages: [],
    },
    {
      Id: 'cpuUtilization',
      Label: 'AWS/EC2 i-0d1808334c391e056 CPUUtilization',
      Timestamps: [new Date('2020-06-27T22:00:00.000Z'), new Date('2020-06-27T23:00:00.000Z')],
      Values: [11.566666666666666, 24.25],
      StatusCode: 'Complete',
      Messages: [],
    },
    {
      Id: 'vCPUs',
      Label: 'AWS/Usage Standard/OnDemand vCPU EC2 Resource ResourceCount',
      Timestamps: [new Date('2020-06-27T22:00:00.000Z'), new Date('2020-06-27T23:00:00.000Z')],
      Values: [4, 4.5],
      StatusCode: 'Complete',
      Messages: [],
    },
    {
      Id: 'cpuUtilization',
      Label: 'AWS/EC2 i-0d1808334c391e056 CPUUtilization',
      Timestamps: [new Date('2020-06-27T22:00:00.000Z'), new Date('2020-06-27T23:00:00.000Z')],
      Values: [1000000, 9999999],
      StatusCode: 'Complete',
      Messages: [],
    },
  ],
  Messages: [],
}

export const elastiCacheMockResponse: AWS.CloudWatch.GetMetricDataOutput = {
  MetricDataResults: [
    {
      Id: 'cpuUtilization',
      Label: 'AWS/ElastiCache CPUUtilization',
      Timestamps: [new Date('2020-07-19T22:00:00.000Z'), new Date('2020-07-20T23:00:00.000Z')],
      Values: [1.0456, 2.03242],
      StatusCode: 'Complete',
      Messages: [],
    },
  ],
}

export const elastiCacheMockGetCostAndUsageResponse: AWS.CostExplorer.GetCostAndUsageResponse = {
  ResultsByTime: [
    {
      TimePeriod: {
        Start: '2020-07-19',
        End: '2020-07-20',
      },
      Groups: [
        {
          Keys: ['USE2-NodeUsage:cache.t3.medium'],
          Metrics: {
            UsageQuantity: {
              Amount: '1',
            },
          },
        },
        {
          Keys: ['USE2-NodeUsage:cache.t2.micro'],
          Metrics: {
            UsageQuantity: {
              Amount: '1',
            },
          },
        },
      ],
    },
    {
      TimePeriod: {
        Start: '2020-07-20',
        End: '2020-07-21',
      },
      Groups: [
        {
          Keys: ['USE2-NodeUsage:cache.t3.medium'],
          Metrics: {
            UsageQuantity: {
              Amount: '2',
            },
          },
        },
      ],
    },
  ],
}

export const ebsMockResponse: AWS.CostExplorer.GetCostAndUsageResponse = {
  ResultsByTime: [
    {
      Estimated: false,
      Groups: [],
      TimePeriod: {
        End: '2020-06-28',
        Start: '2020-06-27',
      },
      Total: {
        UsageQuantity: {
          Amount: '1.0',
          Unit: 'GB-Month',
        },
      },
    },
    {
      Estimated: false,
      Groups: [],
      TimePeriod: {
        End: '2020-06-29',
        Start: '2020-06-28',
      },
      Total: {
        UsageQuantity: {
          Amount: '2.0',
          Unit: 'GB-Month',
        },
      },
    },
  ],
}

export const rdsCPUUtilizationResponse: AWS.CloudWatch.GetMetricDataOutput = {
  MetricDataResults: [
    {
      Id: 'cpuUtilization',
      Timestamps: [new Date('2020-06-27T22:00:00.000Z'), new Date('2020-06-27T23:00:00.000Z')],
      Values: [22.983333333333334, 31.435897435897434],
    },
    {
      Id: 'cpuUtilization',
      Timestamps: [new Date('2020-06-27T22:00:00.000Z'), new Date('2020-06-27T23:00:00.000Z')],
      Values: [11.566666666666666, 24.25],
    },
  ],
}

export const rdsCPUUsageResponse: AWS.CostExplorer.GetCostAndUsageResponse = {
  ResultsByTime: [
    {
      TimePeriod: {
        Start: '2020-06-27',
        End: '2020-06-28',
      },
      Groups: [
        {
          Keys: ['USW1-InstanceUsage:db.t3.medium'],
          Metrics: {
            UsageQuantity: {
              Amount: '1',
            },
          },
        },
      ],
    },
    {
      TimePeriod: {
        Start: '2020-06-28',
        End: '2020-06-29',
      },
      Groups: [
        {
          Keys: ['USW1-InstanceUsage:db.r5.24xlarge'],
          Metrics: {
            UsageQuantity: {
              Amount: '1',
            },
          },
        },
      ],
    },
  ],
}

export const rdsStorageResponse: AWS.CostExplorer.GetCostAndUsageResponse = {
  ResultsByTime: [
    {
      TimePeriod: {
        Start: '2020-06-27',
        End: '2020-06-28'
      },
      Groups: [
        {
          Keys: ['USW1-RDS:GP2-Storage'],
          Metrics: {
            UsageQuantity: {
              Amount: '1',
            },
          },
        },
      ],
    },
    {
      TimePeriod: {
        Start: '2020-06-28',
        End: '2020-06-29'
      },
      Groups: [
        {
          Keys: ['USW1-RDS:GP2-Storage'],
          Metrics: {
            UsageQuantity: {
              Amount: '1',
            },
          },
        },
      ],
    },
  ],
}
