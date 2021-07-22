/* © 2021 Thoughtworks, Inc.
 */
import AWSMock from 'aws-sdk-mock'
import { CloudWatch } from 'aws-sdk'

const mockAWSCloudWatchGetMetricDataCall = (
  start: Date,
  end: Date,
  response: any,
  metricDataQueries: Array<any>,
) => {
  AWSMock.mock(
    'CloudWatch',
    'getMetricData',
    (
      params: CloudWatch.GetMetricDataInput,
      callback: (a: Error, response: any) => any,
    ) => {
      expect(params).toEqual({
        StartTime: start,
        EndTime: end,
        MetricDataQueries: metricDataQueries,
        ScanBy: 'TimestampAscending',
      })

      callback(null, response)
    },
  )
}

export default mockAWSCloudWatchGetMetricDataCall
