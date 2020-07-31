import AWS from 'aws-sdk'
import AWSMock from 'aws-sdk-mock'
import { RDSStorage } from '@services/RDSStorage'

function buildCostExplorerGetUsageHoursResponse(data: { start: string; value: number }[]) {
  return {
    GroupDefinitions: [
      {
        Type: 'DIMENSION',
        Key: 'USAGE_TYPE',
      },
    ],
    ResultsByTime: data.map(({ start, value }) => {
      return {
        TimePeriod: {
          Start: start,
        },
        Groups: [
          {
            Keys: ['USW1-RDS:GP2-Storage'],
            Metrics: {
              UsageQuantity: {
                Amount: value.toString(),
              },
            },
          },
        ],
      }
    }),
  }
}

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

describe('RDSStorage', () => {
  afterEach(() => {
    AWSMock.restore()
  })

  it('calculates GB-Month usage', async () => {
    const startDate = '2020-07-24'
    const endDate = '2020-07-26'
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetUsageHoursResponse([
            { start: '2020-07-24', value: 1 },
            { start: '2020-07-25', value: 2 },
          ]),
        )
      },
    )

    const rdsStorage = new RDSStorage()

    const result = await rdsStorage.getUsage(new Date(startDate), new Date(endDate))

    expect(result).toEqual([
      {
        sizeGb: 31,
        timestamp: new Date('2020-07-24'),
      },
      {
        sizeGb: 62,
        timestamp: new Date('2020-07-25'),
      },
    ])
  })

  it('calculates GB-Month for shorter months', async () => {
    const startDate = '2020-06-24'
    const endDate = '2020-06-26'
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, buildCostExplorerGetUsageHoursResponse([{ start: '2020-06-24', value: 1.0 }]))
      },
    )

    const rdsStorage = new RDSStorage()

    const result = await rdsStorage.getUsage(new Date(startDate), new Date(endDate))

    expect(result).toEqual([
      {
        sizeGb: 30,
        timestamp: new Date('2020-06-24'),
      },
    ])
  })

  it('filters 0 gb of usage', async () => {
    const startDate = '2020-06-24'
    const endDate = '2020-06-25'
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, buildCostExplorerGetUsageHoursResponse([{ start: '2020-06-24', value: 0 }]))
      },
    )

    const rdsStorage = new RDSStorage()

    const result = await rdsStorage.getUsage(new Date(startDate), new Date(endDate))

    expect(result).toEqual([])
  })

  it('should filter gp2 storage', async () => {
    const startDate = '2020-06-24'
    const endDate = '2020-06-25'
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, {
          ResultsByTime: [
            {
              TimePeriod: {
                Start: startDate,
              },
              Groups: [
                {
                  Keys: ['regionless-RDS:magnetic-Storage'],
                  Metrics: {
                    UsageQuantity: {
                      Amount: 5,
                    },
                  },
                },
                {
                  Keys: ['USW1-RDS:GP2-Storage'],
                  Metrics: {
                    UsageQuantity: {
                      Amount: 1,
                    },
                  },
                },
              ],
            },
          ],
        })
      },
    )

    const rdsStorage = new RDSStorage()
    const result = await rdsStorage.getUsage(new Date(startDate), new Date(endDate))

    expect(result).toEqual([
      {
        sizeGb: 30,
        timestamp: new Date('2020-06-24'),
      },
    ])
  })

  it('should query for the specified region', async () => {
    const startDate = '2020-06-24'
    const endDate = '2020-06-25'
    const expectedRegion = 'my-region'
    AWS.config.update({ region: expectedRegion })

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        expect(params.Filter.And).toContainEqual({
          Dimensions: {
            Key: 'REGION',
            Values: [expectedRegion],
          },
        })
        callback(null, buildCostExplorerGetUsageHoursResponse([{ start: '2020-06-24', value: 0 }]))
      },
    )

    const rdsStorage = new RDSStorage()
    await rdsStorage.getUsage(new Date(startDate), new Date(endDate))
  })
})
