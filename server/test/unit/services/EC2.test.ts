import EC2 from '@services/EC2'
import { buildCostExplorerGetCostResponse } from '@builders'
import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

describe('EC2', () => {
  afterEach(() => {
    AWSMock.restore()
  })

  it('gets EC2 usage', async () => {
    mockAwsCloudWatchGetMetricDataCall(new Date('2020-07-11T00:00:00.000Z'), new Date('2020-07-11T02:00:00.000Z'), {
      MetricDataResults: [
        {
          Id: 'cpuUtilization',
          Label: 'AWS/EC2 i-01914bfb56d65a9ae CPUUtilization',
          Timestamps: ['2020-07-10T22:00:00.000Z', '2020-07-10T23:00:00.000Z'],
          Values: [22.983333333333334, 31.435897435897434],
          StatusCode: 'Complete',
          Messages: [],
        },
        {
          Id: 'cpuUtilization',
          Label: 'AWS/EC2 i-0462587efbbf601c5 CPUUtilization',
          Timestamps: ['2020-07-10T23:00:00.000Z', '2020-07-11T00:00:00.000Z', '2020-07-11T01:00:00.000Z'],
          Values: [11.576923076923077, 9.716666666666667, 20.46153846153846],
          StatusCode: 'Complete',
          Messages: [],
        },
        {
          Id: 'cpuUtilization',
          Label: 'AWS/EC2 i-0489a00f5a4835dc8 CPUUtilization',
          Timestamps: ['2020-07-10T23:00:00.000Z', '2020-07-11T00:00:00.000Z', '2020-07-11T01:00:00.000Z'],
          Values: [9.63265306122449, 13.083333333333334, 32.44444444444444],
          StatusCode: 'Complete',
          Messages: [],
        },
        {
          Id: 'cpuUtilization',
          Label: 'AWS/EC2 i-057b1d36294c2ff23 CPUUtilization',
          Timestamps: ['2020-07-11T01:00:00.000Z'],
          Values: [10.26923076923077],
          StatusCode: 'Complete',
          Messages: [],
        },
        {
          Id: 'cpuUtilization',
          Label: 'AWS/EC2 i-0990709d4aafe0be8 CPUUtilization',
          Timestamps: ['2020-07-11T01:00:00.000Z'],
          Values: [9.75],
          StatusCode: 'Complete',
          Messages: [],
        },
        {
          Id: 'cpuUtilization',
          Label: 'AWS/EC2 i-0d1808334c391e056 CPUUtilization',
          Timestamps: ['2020-07-10T22:00:00.000Z', '2020-07-10T23:00:00.000Z'],
          Values: [11.566666666666666, 24.25],
          StatusCode: 'Complete',
          Messages: [],
        },
        {
          Id: 'vCPUs',
          Label: 'AWS/Usage Standard/OnDemand vCPU EC2 Resource ResourceCount',
          Timestamps: [
            '2020-07-10T22:00:00.000Z',
            '2020-07-10T23:00:00.000Z',
            '2020-07-11T00:00:00.000Z',
            '2020-07-11T01:00:00.000Z',
          ],
          Values: [4, 4.5, 4, 4.333333333333333],
          StatusCode: 'Complete',
          Messages: [],
        },
      ],
      Messages: [],
    })

    const ec2Service = new EC2()

    const result = await ec2Service.getUsage(
      new Date('2020-07-11T00:00:00Z'),
      new Date('2020-07-11T02:00:00Z'),
      'us-east-1',
    )

    expect(result).toEqual([
      {
        cpuUtilizationAverage: (22.983333333333334 + 11.566666666666666) / 2, //should be the average of CPUUtilization accross vcpus per hour
        numberOfvCpus: 4,
        timestamp: new Date('2020-07-10T22:00:00.000Z'),
      },
      {
        cpuUtilizationAverage: (31.435897435897434 + 11.576923076923077 + 9.63265306122449 + 24.25) / 4,
        numberOfvCpus: 4.5,
        timestamp: new Date('2020-07-10T23:00:00.000Z'),
      },
      {
        cpuUtilizationAverage: (9.716666666666667 + 13.083333333333334) / 2,
        numberOfvCpus: 4,
        timestamp: new Date('2020-07-11T00:00:00.000Z'),
      },
      {
        cpuUtilizationAverage: (20.46153846153846 + 32.44444444444444 + 10.26923076923077 + 9.75) / 4,
        numberOfvCpus: 4.333333333333333,
        timestamp: new Date('2020-07-11T01:00:00.000Z'),
      },
    ])
  })

  it('does not produce NaN when usage is 0', async () => {
    mockAwsCloudWatchGetMetricDataCall(new Date('2020-07-12T00:00:00.000Z'), new Date('2020-07-12T02:00:00.000Z'), {
      MetricDataResults: [
        {
          Id: 'cpuUtilization',
          Timestamps: ['2020-07-12T01:00:00.000Z'],
          Values: [],
        },
        {
          Id: 'vCPUs',
          Timestamps: ['2020-07-12T01:00:00.000Z'],
          Values: [0],
        },
      ],
    })

    const ec2Service = new EC2()

    const result = await ec2Service.getUsage(
      new Date('2020-07-12T00:00:00Z'),
      new Date('2020-07-12T02:00:00Z'),
      'us-east-1',
    )

    expect(result).toEqual([
      {
        cpuUtilizationAverage: 0,
        numberOfvCpus: 0,
        timestamp: new Date('2020-07-12T01:00:00.000Z'),
      },
    ])
  })

  it('should set numberOfvCpus to 0 if no vCPU data is provided for a given timestamp', async () => {
    mockAwsCloudWatchGetMetricDataCall(new Date('2020-07-12T00:00:00.000Z'), new Date('2020-07-12T02:00:00.000Z'), {
      MetricDataResults: [
        {
          Id: 'cpuUtilization',
          Timestamps: ['2020-07-12T00:00:00.000Z'],
          Values: [0],
        },
        {
          Id: 'cpuUtilization',
          Timestamps: ['2020-07-12T01:00:00.000Z'],
          Values: [1],
        },
        {
          Id: 'vCPUs',
          Timestamps: ['2020-07-12T01:00:00.000Z'],
          Values: [1],
        },
      ],
    })

    const ec2Service = new EC2()

    const result = await ec2Service.getUsage(
      new Date('2020-07-12T00:00:00Z'),
      new Date('2020-07-12T02:00:00Z'),
      'us-east-1',
    )

    expect(result).toEqual([
      {
        cpuUtilizationAverage: 0,
        numberOfvCpus: 0,
        timestamp: new Date('2020-07-12T00:00:00.000Z'),
      },
      {
        cpuUtilizationAverage: 1,
        numberOfvCpus: 1,
        timestamp: new Date('2020-07-12T01:00:00.000Z'),
      },
    ])
  })

  it('should return an empty array if no vCPUs', async () => {
    mockAwsCloudWatchGetMetricDataCall(new Date('2020-07-12T00:00:00.000Z'), new Date('2020-07-12T02:00:00.000Z'), {
      MetricDataResults: [
        {
          Id: 'cpuUtilization',
          Timestamps: [],
          Values: [],
        },
      ],
    })

    const ec2Service = new EC2()

    const result = await ec2Service.getUsage(
      new Date('2020-07-12T00:00:00Z'),
      new Date('2020-07-12T02:00:00Z'),
      'us-east-1',
    )

    expect(result).toEqual([])
  })

  it('gets ec2 cost', async () => {
    const start = '2020-07-01'
    const end = '2020-07-04'
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetCostResponse([
            { start: start, amount: 100.0, keys: ['EC2: Running Hours'] },
            { start: end, amount: 50.0, keys: ['test'] },
          ]),
        )
      },
    )

    const ec2Service = new EC2()
    const ec2Costs = await ec2Service.getCosts(new Date(start), new Date(end), 'us-east-1')

    expect(ec2Costs).toEqual([
      { amount: 100.0, currency: 'USD', timestamp: new Date(start) },
      { amount: 50.0, currency: 'USD', timestamp: new Date(end) },
    ])
  })

  function mockAwsCloudWatchGetMetricDataCall(startDate: Date, endDate: Date, response: any) {
    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: AWS.CloudWatch.GetMetricDataInput, callback: (err: Error, res: any) => any) => {
        expect(params).toEqual({
          StartTime: startDate,
          EndTime: endDate,
          MetricDataQueries: [
            {
              Id: 'cpuUtilizationWithEmptyValues',
              Expression: "SEARCH('{AWS/EC2,InstanceId} MetricName=\"CPUUtilization\"', 'Average', 3600)",
              ReturnData: false,
            },
            {
              Id: 'cpuUtilization',
              Expression: 'REMOVE_EMPTY(cpuUtilizationWithEmptyValues)',
            },
            {
              Id: 'vCPUs',
              Expression:
                'SEARCH(\'{AWS/Usage,Resource,Type,Service,Class } Resource="vCPU" MetricName="ResourceCount"\', \'Average\', 3600)',
            },
          ],
          ScanBy: 'TimestampAscending',
        })

        callback(null, response)
      },
    )
  }
})
