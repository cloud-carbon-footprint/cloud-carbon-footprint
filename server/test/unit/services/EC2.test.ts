import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'

import EC2 from '@services/EC2'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

describe('EC2', () => {
  afterEach(() => {
    AWSMock.restore()
  })

  it('gets EC2 usage', async () => {
    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: AWS.CloudWatch.GetMetricDataInput, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual({
          StartTime: new Date('2020-07-11T00:00:00.000Z'),
          EndTime: new Date('2020-07-11T02:00:00.000Z'),
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

        callback(null, {
          ResponseMetadata: {
            RequestId: '202758b8-af64-481d-ac9b-aeeb30dc5532',
          },
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
      },
    )

    const ec2Service = new EC2()

    const result = await ec2Service.getUsage(new Date('2020-07-11T00:00:00Z'), new Date('2020-07-11T02:00:00Z'))

    expect(result).toEqual([
      {
        cpuUtilizationAverage: 54.419230769230765,
        numberOfvCpus: 8.5,
        timestamp: new Date('2020-07-10T00:00:00.000Z'),
      },
      {
        cpuUtilizationAverage: 30.17820512820513,
        numberOfvCpus: 8.333333333333332,
        timestamp: new Date('2020-07-11T00:00:00.000Z'),
      },
    ])
  })
})
