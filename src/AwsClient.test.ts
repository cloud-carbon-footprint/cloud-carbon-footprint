import * as AWSMock from "aws-sdk-mock";
import * as AWS from "aws-sdk";

import AwsClient from './AwsClient'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

describe('AwsClient', () => {

  it('gets EBS usage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: Function) => {
        expect(params).toEqual({
          "Filter": {
            "Dimensions": {
              "Key": "USAGE_TYPE",
              "Values": [
                "EBS:VolumeUsage.gp2"
              ]
            }
          },
          "Granularity": "DAILY",
          "Metrics": [
            "UsageQuantity"
          ],
          "TimePeriod": {
            "End": "2020-06-30",
            "Start": "2020-06-27"
          }
        })

        callback(null, 'beep boop')
      }
    )

    const client = new AwsClient(new AWS.CostExplorer())

    const result = await client.getEbsUsage(
      new Date('2020-06-27T00:00:00Z'),
      new Date('2020-06-30T00:00:00Z')
    )

    expect(result).toEqual('beep boop')
  })
})
