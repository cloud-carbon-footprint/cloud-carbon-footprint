import * as AWSMock from 'aws-sdk-mock'
import * as AWS from 'aws-sdk'

import EbsDatasource from './EbsDatasource'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

describe('EbsDatasource', () => {
  it('gets EBS usage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: null, response: any) => any) => {
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

    const datasource = new EbsDatasource()

    const result = await datasource.getUsage(new Date('2020-06-27T00:00:00Z'), new Date('2020-06-30T00:00:00Z'))

    expect(result).toEqual([
      {
        sizeGb: 1.2120679, //todo
        timestamp: new Date('2020-06-27T00:00:00Z'),
      },
    ])
  })
})
