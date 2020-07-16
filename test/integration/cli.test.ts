import cli from '@application/cli'
import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'
import { mocked } from 'ts-jest/utils'
import AWSServices from '@application/AWSServices'
import EBS from '@services/EBS'
import S3 from '@services/S3'

jest.mock('@application/AWSServices')
const servicesRegistered = mocked(AWSServices, true)

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

afterAll(() => {
  AWSMock.restore()
})

describe('cli', () => {
  test('ebs & s3', async () => {
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

    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: AWS.CloudWatch.GetMetricDataInput, callback: (a: Error, response: any) => any) => {
        callback(null, {
          MetricDataResults: [
            {
              Id: 's3Size',
              Label: 's3Size',
              Timestamps: ['2020-06-27T00:00:00.000Z'],
              Values: [2586032500],
              StatusCode: 'Complete',
              Messages: [],
            },
          ],
        })
      },
    )

    servicesRegistered.mockReturnValue([new EBS(), new S3()])

    const result = await cli(['executable', 'file', '--startDate', '2020-07-10', '--endDate', '2020-07-13'])

    expect(result).toEqual(
      '| Date (UTC)   | EBS Wattage  | EBS CO2e Emissions     | S3 Wattage   | S3 CO2e Emissions      | EC2 Wattage  | EC2 CO2e Emissions     | Sum Wattage  | Sum CO2e Emissions     \n' +
        '| 2020-06-27   | 0.86 Watts   | 0.000611 Kg CO2e       | 1.25 Watts   | 0.000882 Kg CO2e       | 0.00 Watts   | 0.000000 Kg CO2e       | 2.11 Watts   | 0.001493 Kg CO2e       \n' +
        '| 2020-06-28   | 1.73 Watts   | 0.001222 Kg CO2e       | 0.00 Watts   | 0.000000 Kg CO2e       | 0.00 Watts   | 0.000000 Kg CO2e       | 1.73 Watts   | 0.001222 Kg CO2e       \n' +
        '| Total        | 2.59 Watts   | 0.001833 Kg CO2e       | 1.25 Watts   | 0.000882 Kg CO2e       | 0.00 Watts   | 0.000000 Kg CO2e       | 3.84 Watts   | 0.002715 Kg CO2e       ',
    )
  })

  test('s3', async () => {
    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: AWS.CloudWatch.GetMetricDataInput, callback: (a: Error, response: any) => any) => {
        callback(null, {
          MetricDataResults: [
            {
              Id: 's3Size',
              Label: 's3Size',
              Timestamps: ['2020-06-27T00:00:00.000Z'],
              Values: [2586032500],
              StatusCode: 'Complete',
              Messages: [],
            },
          ],
        })
      },
    )

    servicesRegistered.mockReturnValue([new S3()])

    const result = await cli(['executable', 'file', '--startDate', '2020-06-27', '--endDate', '2020-06-28'])

    expect(result).toContain(
      '2020-06-27   | 0.00 Watts   | 0.000000 Kg CO2e       | 1.25 Watts   | 0.000882 Kg CO2e       | 0.00 Watts   | 0.000000 Kg CO2e       | 1.25 Watts   | 0.000882 Kg CO2e',
    )
  })
})
