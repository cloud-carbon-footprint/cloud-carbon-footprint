import cli from '../../src/application/cli'
import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)

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
      })
    },
  )
})

afterAll(() => {
  AWSMock.restore()
})

describe('cli', () => {
  test('cli integration test', async () => {
    const result = await cli(['executable', 'file', '--startDate', '2020-07-10', '--endDate', '2020-07-13'])

    expect(result).toEqual(
      '| Date (UTC)        | EBS Wattage       | EBS CO2e Emissions          \n' +
        '| 2020-06-27        | 0.86 Watts        | 0.000611 Kg CO2e            \n' +
        '| 2020-06-28        | 1.73 Watts        | 0.001222 Kg CO2e            \n' +
        '| Total             | 2.59 Watts        | 0.001833 Kg CO2e            ',
    )
  })
})
