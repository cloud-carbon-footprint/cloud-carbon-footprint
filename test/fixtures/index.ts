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
