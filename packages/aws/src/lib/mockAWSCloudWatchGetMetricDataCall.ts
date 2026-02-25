/* © 2021 Thoughtworks, Inc.
 */
import { mockClient } from 'aws-sdk-client-mock'
import {
  CloudWatchClient,
  GetMetricDataCommand,
  GetMetricDataCommandInput,
  GetMetricDataCommandOutput,
} from '@aws-sdk/client-cloudwatch'

const cloudWatchMock = mockClient(CloudWatchClient)

const mockAWSCloudWatchGetMetricDataCall = (
  start: Date,
  end: Date,
  response: GetMetricDataCommandOutput,
  metricDataQueries: GetMetricDataCommandInput['MetricDataQueries'],
) => {
  cloudWatchMock.reset()
  cloudWatchMock.on(GetMetricDataCommand).callsFake((input) => {
    expect(input).toEqual({
      StartTime: start,
      EndTime: end,
      MetricDataQueries: metricDataQueries,
      ScanBy: 'TimestampAscending',
    })
    return Promise.resolve(response)
  })
  return cloudWatchMock
}

export default mockAWSCloudWatchGetMetricDataCall
