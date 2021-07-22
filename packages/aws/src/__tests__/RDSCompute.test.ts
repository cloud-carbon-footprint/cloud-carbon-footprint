/*
 * © 2021 Thoughtworks, Inc.
 */

import AWSMock from 'aws-sdk-mock'
import AWS, { CloudWatch, CloudWatchLogs, CostExplorer } from 'aws-sdk'
import RDSComputeService from '../lib/RDSCompute'
import { ServiceWrapper } from '../lib/ServiceWrapper'
import mockAWSCloudWatchGetMetricDataCall from '../lib/mockAWSCloudWatchGetMetricDataCall'
import {
  buildCostExplorerGetCostRequest,
  buildCostExplorerGetCostResponse,
  buildCostExplorerGetUsageResponse,
} from './fixtures/builders'
import { AWS_CLOUD_CONSTANTS } from '../domain'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

describe('RDS Compute', function () {
  afterEach(() => {
    AWSMock.restore()
  })

  const metricDataQueries = [
    {
      Id: 'cpuUtilizationWithEmptyValues',
      Expression:
        "SEARCH('{AWS/RDS} MetricName=\"CPUUtilization\"', 'Average', 3600)",
      ReturnData: false,
    },
    {
      Id: 'cpuUtilization',
      Expression: 'REMOVE_EMPTY(cpuUtilizationWithEmptyValues)',
    },
  ]
  const getServiceWrapper = () =>
    new ServiceWrapper(
      new CloudWatch(),
      new CloudWatchLogs(),
      new CostExplorer(),
    )

  it('should get RDS CPU utilization for two hours of different days', async () => {
    const start_date_string = '2020-01-25T00:00:00.000Z'
    const end_date_string = '2020-01-27T00:00:00.000Z'

    const cloudwatchResponse = buildCloudwatchCPUUtilizationResponse(
      [
        new Date('2020-01-25T05:00:00.000Z'),
        new Date('2020-01-26T23:00:00.000Z'),
      ],
      [32.34, 12.65],
    )
    mockAWSCloudWatchGetMetricDataCall(
      new Date(start_date_string),
      new Date(end_date_string),
      cloudwatchResponse,
      metricDataQueries,
    )

    const costExplorerRequest = buildRdsCostExplorerGetUsageRequest(
      start_date_string.substr(0, 10),
      end_date_string.substr(0, 10),
      'us-east-1',
    )
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (
        params: AWS.CostExplorer.GetCostAndUsageRequest,
        callback: (a: Error, response: any) => any,
      ) => {
        expect(params).toEqual(costExplorerRequest)

        callback(
          null,
          buildCostExplorerGetUsageResponse([
            {
              start: '2020-01-25',
              amount: 1,
              keys: ['USW1-InstanceUsage:db.t3.medium'],
            },
            {
              start: '2020-01-26',
              amount: 1,
              keys: ['USW1-InstanceUsage:db.r5.24xlarge'],
            },
          ]),
        )
      },
    )

    const rdsService = new RDSComputeService(getServiceWrapper())

    const usageByHour = await rdsService.getUsage(
      new Date(start_date_string),
      new Date(end_date_string),
      'us-east-1',
    )

    expect(usageByHour).toEqual([
      {
        cpuUtilizationAverage: 32.34,
        numberOfvCpus: 2,
        timestamp: new Date('2020-01-25T00:00:00.000Z'),
        usesAverageCPUConstant: false,
      },
      {
        cpuUtilizationAverage: 12.65,
        numberOfvCpus: 96,
        timestamp: new Date('2020-01-26T00:00:00.000Z'),
        usesAverageCPUConstant: false,
      },
    ])
  })

  it('uses the cpu utilization constant for missing cpu utilization data', async () => {
    const start_date_string = '2020-01-25T00:00:00.000Z'
    const end_date_string = '2020-01-27T00:00:00.000Z'

    const cloudwatchResponse = buildCloudwatchCPUUtilizationResponse(
      [new Date('2020-01-25T05:00:00.000Z')],
      [32.34],
    )

    mockAWSCloudWatchGetMetricDataCall(
      new Date(start_date_string),
      new Date(end_date_string),
      cloudwatchResponse,
      metricDataQueries,
    )

    const costExplorerRequest = buildRdsCostExplorerGetUsageRequest(
      start_date_string.substr(0, 10),
      end_date_string.substr(0, 10),
      'us-east-1',
    )
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (
        params: AWS.CostExplorer.GetCostAndUsageRequest,
        callback: (a: Error, response: any) => any,
      ) => {
        expect(params).toEqual(costExplorerRequest)

        callback(
          null,
          buildCostExplorerGetUsageResponse([
            {
              start: '2020-01-25',
              amount: 1,
              keys: ['USW1-InstanceUsage:db.t3.medium'],
            },
            {
              start: '2020-01-26',
              amount: 1,
              keys: ['USW1-InstanceUsage:db.r5.24xlarge'],
            },
          ]),
        )
      },
    )

    const rdsService = new RDSComputeService(getServiceWrapper())

    const usageByHour = await rdsService.getUsage(
      new Date(start_date_string),
      new Date(end_date_string),
      'us-east-1',
    )

    expect(usageByHour).toEqual([
      {
        cpuUtilizationAverage: 32.34,
        numberOfvCpus: 2,
        timestamp: new Date('2020-01-25T00:00:00.000Z'),
        usesAverageCPUConstant: false,
      },
      {
        cpuUtilizationAverage: AWS_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020,
        numberOfvCpus: 96,
        timestamp: new Date('2020-01-26T00:00:00.000Z'),
        usesAverageCPUConstant: true,
      },
    ])
  })

  it('returns an empty list when there is no usage', async () => {
    const start_date_string = '2020-01-25T00:00:00.000Z'
    const end_date_string = '2020-01-27T00:00:00.000Z'

    mockAWSCloudWatchGetMetricDataCall(
      new Date(start_date_string),
      new Date(end_date_string),
      { MetricDataResults: [] },
      metricDataQueries,
    )

    const costExplorerRequest = buildRdsCostExplorerGetUsageRequest(
      start_date_string.substr(0, 10),
      end_date_string.substr(0, 10),
      'us-east-1',
    )
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (
        params: AWS.CostExplorer.GetCostAndUsageRequest,
        callback: (a: Error, response: any) => any,
      ) => {
        expect(params).toEqual(costExplorerRequest)

        callback(null, {
          ResultsByTime: [
            {
              TimePeriod: {
                Start: start_date_string,
                End: end_date_string,
              },
              Total: {
                UsageQuantity: {
                  Amount: 0,
                },
              },
              Groups: [],
            },
          ],
        })
      },
    )

    const rdsService = new RDSComputeService(getServiceWrapper())

    const usageByHour = await rdsService.getUsage(
      new Date(start_date_string),
      new Date(end_date_string),
      'us-east-1',
    )

    expect(usageByHour).toEqual([])
  })

  it('should throw PartialData error when AWS returns PartialData', async () => {
    const start_date_string = '2020-01-25T00:00:00.000Z'
    const end_date_string = '2020-01-27T00:00:00.000Z'

    const cloudwatchResponse = buildCloudwatchCPUUtilizationResponse(
      [new Date('2020-01-25T05:00:00.000Z')],
      [32.34],
      'PartialData',
    )

    mockAWSCloudWatchGetMetricDataCall(
      new Date(start_date_string),
      new Date(end_date_string),
      cloudwatchResponse,
      metricDataQueries,
    )

    const costExplorerRequest = buildRdsCostExplorerGetUsageRequest(
      start_date_string.substr(0, 10),
      end_date_string.substr(0, 10),
      'us-east-1',
    )
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (
        params: AWS.CostExplorer.GetCostAndUsageRequest,
        callback: (a: Error, response: any) => any,
      ) => {
        expect(params).toEqual(costExplorerRequest)

        callback(null, {
          ResultsByTime: [
            {
              TimePeriod: {
                Start: start_date_string,
                End: end_date_string,
              },
              Total: {
                UsageQuantity: {
                  Amount: 0,
                },
              },
              Groups: [],
            },
          ],
        })
      },
    )
    const rdsService = new RDSComputeService(getServiceWrapper())
    const getUsageByHour = async () =>
      await rdsService.getUsage(
        new Date(start_date_string),
        new Date(end_date_string),
        'us-east-1',
      )

    await expect(getUsageByHour).rejects.toThrow(
      'Partial Data Returned from AWS',
    )
  })

  it('should get rds cost', async () => {
    const start = '2020-01-25T00:00:00.000Z'
    const end = '2020-01-27T00:00:00.000Z'

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (
        params: AWS.CostExplorer.GetCostAndUsageRequest,
        callback: (a: Error, response: any) => any,
      ) => {
        expect(params).toEqual(
          buildCostExplorerGetCostRequest(
            start.substr(0, 10),
            end.substr(0, 10),
            'us-east-1',
            ['RDS: Running Hours'],
          ),
        )
        callback(
          null,
          buildCostExplorerGetCostResponse([
            {
              start: '2020-01-25',
              amount: 2.3081821243,
              keys: ['USW1-InstanceUsage:db.t3.medium'],
            },
            {
              start: '2020-01-26',
              amount: 2.3081821243,
              keys: ['USW1-InstanceUsage:db.t3.medium'],
            },
          ]),
        )
      },
    )

    const rdsService = new RDSComputeService(getServiceWrapper())

    const rdsCosts = await rdsService.getCosts(
      new Date(start),
      new Date(end),
      'us-east-1',
    )

    expect(rdsCosts).toEqual([
      {
        amount: 2.3081821243,
        currency: 'USD',
        timestamp: new Date('2020-01-25T00:00:00.000Z'),
      },
      {
        amount: 2.3081821243,
        currency: 'USD',
        timestamp: new Date('2020-01-26T00:00:00.000Z'),
      },
    ])
  })
})

function buildCloudwatchCPUUtilizationResponse(
  timestamps: Date[],
  values: number[],
  statusCode = 'Complete',
) {
  return {
    MetricDataResults: [
      {
        Id: 'cpuUtilization',
        Timestamps: timestamps,
        Values: values,
        StatusCode: statusCode,
      },
    ],
  }
}

function buildRdsCostExplorerGetUsageRequest(
  startDate: string,
  endDate: string,
  region: string,
) {
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
