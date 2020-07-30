import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'
import { RDSService } from '@services/RDS'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

function buildCloudwatchCPUUtilizationRequest(startTimestamp: string, endTimestamp: string) {
  return {
    StartTime: new Date(startTimestamp),
    EndTime: new Date(endTimestamp),
    MetricDataQueries: [
      {
        Id: 'cpuUtilizationWithEmptyValues',
        Expression: "SEARCH('{AWS/RDS} MetricName=\"CPUUtilization\"', 'Average', 3600)",
        ReturnData: false,
      },
      {
        Id: 'cpuUtilization',
        Expression: 'REMOVE_EMPTY(cpuUtilizationWithEmptyValues)',
      },
    ],
    ScanBy: 'TimestampAscending',
  }
}

function buildCloudwatchCPUUtilizationResponse(timestamps: Date[], values: number[]) {
  return {
    MetricDataResults: [
      {
        Id: 'cpuUtilization',
        Timestamps: timestamps,
        Values: values,
      },
    ],
  }
}

function buildRDSCostExplorerRequest(startDate: string, endDate: string, region: string) {
  return {
    TimePeriod: {
      Start: startDate,
      End: endDate,
    },
    Filter: {
      And: [
        { Dimensions: { Key: 'REGION', Values: [region] } },
        {
          Dimensions: {
            Key: 'USAGE_TYPE_GROUP',
            Values: ['RDS: Running Hours'],
          },
        },
      ],
    },
    Granularity: 'DAILY',
    GroupBy: [
      {
        Key: 'USAGE_TYPE',
        Type: 'DIMENSION',
      },
    ],
    Metrics: ['UsageQuantity'],
  }
}

describe('RDS', function () {
  afterEach(() => {
    AWSMock.restore()
  })

  it('should get RDS CPU utilization for two hours of different days', async () => {
    const start_date_string = '2020-01-25T00:00:00.000Z'
    const end_date_string = '2020-01-27T00:00:00.000Z'

    const cloudwatchResponse = buildCloudwatchCPUUtilizationResponse(
      [new Date('2020-01-25T05:00:00.000Z'), new Date('2020-01-26T23:00:00.000Z')],
      [32.34, 12.65],
    )
    const cwMock = AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: AWS.CloudWatch.GetMetricDataInput, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(buildCloudwatchCPUUtilizationRequest(start_date_string, end_date_string))
        callback(null, cloudwatchResponse)
      },
    )

    const costExplorerRequest = buildRDSCostExplorerRequest(
      start_date_string.substr(0, 10),
      end_date_string.substr(0, 10),
      'us-west-1',
    )
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(costExplorerRequest)

        callback(null, {
          ResultsByTime: [
            {
              TimePeriod: {
                Start: '2020-01-25',
                End: '2020-01-26',
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
                Start: '2020-01-26',
                End: '2020-01-27',
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
        })
      },
    )

    const rdsService = new RDSService()

    const usageByHour = await rdsService.getUsage(new Date(start_date_string), new Date(end_date_string))

    expect(usageByHour).toEqual([
      { cpuUtilizationAverage: 32.34, numberOfvCpus: 2, timestamp: new Date('2020-01-25T00:00:00.000Z') },
      { cpuUtilizationAverage: 12.65, numberOfvCpus: 96, timestamp: new Date('2020-01-26T00:00:00.000Z') },
    ])
  })
})
