import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'

import EBS from '@services/EBS'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

describe('Ebs', () => {
  afterEach(() => {
    AWSMock.restore()
  })

  it('gets EBS usage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual({
          Filter: {
            Dimensions: {
              Key: 'USAGE_TYPE',
              Values: ['EBS:VolumeUsage.gp2'],
            },
          },
          Granularity: 'DAILY',
          Metrics: ['UsageQuantity'],
          TimePeriod: {
            End: '2020-06-30',
            Start: '2020-06-27',
          },
        })

        callback(null, {
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
                  Amount: '1.2120679',
                  Unit: 'GB-Month',
                },
              },
            },
          ],
        })
      },
    )

    const ebsService = new EBS()

    const result = await ebsService.getUsage(new Date('2020-06-27T00:00:00Z'), new Date('2020-06-30T00:00:00Z'))

    expect(result).toEqual([
      {
        sizeGb: 1.2120679,
        timestamp: new Date('2020-06-27T00:00:00Z'),
      },
    ])
  })

  it('filters out results with no usage', async () => {
    // for valid date ranges, getCostAndUsage API will always return results for the date range, but with all zero usages
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, {
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
                  Amount: '0',
                  Unit: 'GB-Month',
                },
              },
            },
            {
              Estimated: false,
              Groups: [],
              TimePeriod: {
                End: '2020-06-28',
                Start: '2020-06-27',
              },
              Total: {
                UsageQuantity: {
                  Amount: '1.2120679',
                  Unit: 'GB-Month',
                },
              },
            },
          ],
        })
      },
    )

    const ebsService = new EBS()

    const result = await ebsService.getUsage(new Date('2020-01-27T00:00:00Z'), new Date('2020-01-30T00:00:00Z'))

    expect(result).toEqual([
      {
        sizeGb: 1.2120679,
        timestamp: new Date('2020-06-27T00:00:00Z'),
      },
    ])
  })

  it('returns empty list when no ResultsByTime', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, {})
      },
    )

    const ebsService = new EBS()

    const result = await ebsService.getUsage(new Date('2020-01-27T00:00:00Z'), new Date('2020-01-30T00:00:00Z'))

    expect(result).toEqual([])
  })

  it('returns empty list when empty ResultsByTime', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, {
          ResultsByTime: [],
        })
      },
    )

    const ebsService = new EBS()

    const result = await ebsService.getUsage(new Date('2020-01-27T00:00:00Z'), new Date('2020-01-30T00:00:00Z'))

    expect(result).toEqual([])
  })

  it('filters out results with no TimePeriod', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, {
          ResultsByTime: [
            {
              Estimated: false,
              Groups: [],
              Total: {
                UsageQuantity: {
                  Amount: '0',
                  Unit: 'GB-Month',
                },
              },
            },
            {
              Estimated: false,
              Groups: [],
              TimePeriod: {
                End: '2020-06-28',
                Start: '2020-06-27',
              },
              Total: {
                UsageQuantity: {
                  Amount: '1.2120679',
                  Unit: 'GB-Month',
                },
              },
            },
          ],
        })
      },
    )

    const ebsService = new EBS()

    const result = await ebsService.getUsage(new Date('2020-01-27T00:00:00Z'), new Date('2020-01-30T00:00:00Z'))

    expect(result).toEqual([
      {
        sizeGb: 1.2120679,
        timestamp: new Date('2020-06-27T00:00:00Z'),
      },
    ])
  })

  it('filters out results with no StartDate', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, {
          ResultsByTime: [
            {
              Estimated: false,
              Groups: [],
              TimePeriod: {
                End: '2020-06-28',
              },
              Total: {
                UsageQuantity: {
                  Amount: '0',
                  Unit: 'GB-Month',
                },
              },
            },
            {
              Estimated: false,
              Groups: [],
              TimePeriod: {
                End: '2020-06-28',
                Start: '2020-06-27',
              },
              Total: {
                UsageQuantity: {
                  Amount: '1.2120679',
                  Unit: 'GB-Month',
                },
              },
            },
          ],
        })
      },
    )

    const ebsService = new EBS()

    const result = await ebsService.getUsage(new Date('2020-01-27T00:00:00Z'), new Date('2020-01-30T00:00:00Z'))

    expect(result).toEqual([
      {
        sizeGb: 1.2120679,
        timestamp: new Date('2020-06-27T00:00:00Z'),
      },
    ])
  })

  it('filters out results with no Total', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, {
          ResultsByTime: [
            {
              Estimated: false,
              Groups: [],
              TimePeriod: {
                End: '2020-06-28',
                Start: '2020-06-27',
              },
            },
            {
              Estimated: false,
              Groups: [],
              TimePeriod: {
                End: '2020-06-28',
                Start: '2020-06-27',
              },
              Total: {
                UsageQuantity: {
                  Amount: '1.2120679',
                  Unit: 'GB-Month',
                },
              },
            },
          ],
        })
      },
    )

    const ebsService = new EBS()

    const result = await ebsService.getUsage(new Date('2020-01-27T00:00:00Z'), new Date('2020-01-30T00:00:00Z'))

    expect(result).toEqual([
      {
        sizeGb: 1.2120679,
        timestamp: new Date('2020-06-27T00:00:00Z'),
      },
    ])
  })

  it('filters out results with no UsageQuantity', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, {
          ResultsByTime: [
            {
              Estimated: false,
              Groups: [],
              TimePeriod: {
                End: '2020-06-28',
                Start: '2020-06-27',
              },
              Total: {},
            },
            {
              Estimated: false,
              Groups: [],
              TimePeriod: {
                End: '2020-06-28',
                Start: '2020-06-27',
              },
              Total: {
                UsageQuantity: {
                  Amount: '1.2120679',
                  Unit: 'GB-Month',
                },
              },
            },
          ],
        })
      },
    )

    const ebsService = new EBS()

    const result = await ebsService.getUsage(new Date('2020-01-27T00:00:00Z'), new Date('2020-01-30T00:00:00Z'))

    expect(result).toEqual([
      {
        sizeGb: 1.2120679,
        timestamp: new Date('2020-06-27T00:00:00Z'),
      },
    ])
  })

  it('filters out results with no Amount', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, {
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
                  Unit: 'GB-Month',
                },
              },
            },
            {
              Estimated: false,
              Groups: [],
              TimePeriod: {
                End: '2020-06-28',
                Start: '2020-06-27',
              },
              Total: {
                UsageQuantity: {
                  Amount: '1.2120679',
                  Unit: 'GB-Month',
                },
              },
            },
          ],
        })
      },
    )

    const ebsService = new EBS()

    const result = await ebsService.getUsage(new Date('2020-01-27T00:00:00Z'), new Date('2020-01-30T00:00:00Z'))

    expect(result).toEqual([
      {
        sizeGb: 1.2120679,
        timestamp: new Date('2020-06-27T00:00:00Z'),
      },
    ])
  })
})
