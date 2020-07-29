import AWSMock from "aws-sdk-mock";
import AWS from "aws-sdk";
import {RDSService} from "@services/RDS";

beforeAll(() => {
    AWSMock.setSDKInstance(AWS)
})


function cloudwatchCPUUtilizationRequest(startTimestamp: string, endTimestamp: string) {
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

function RDSMockResponseFactory (startTimeStamp: string, endTimeStamp: string) {
    return {
        MetricDataResults: [
            {
                Id: 'cpuUtilization',
                Timestamps: [new Date(startTimeStamp), new Date(endTimeStamp)],
                Values: [1.0456, 2.03242],
            },
        ],
    }
}

describe('RDS', function () {
    afterEach(() => {
        AWSMock.restore()
    })

    it('should get RDS CPU utilization', async () => {
        const start_date_string = '2020-01-25T00:00:00.000Z'
        const end_date_string = '2020-01-26T00:00:00.000Z'

        AWSMock.mock(
            'CloudWatch',
            'getMetricData',
            (params: AWS.CloudWatch.GetMetricDataInput, callback: (a: Error, response: any) => any) => {
                expect(params).toEqual(cloudwatchCPUUtilizationRequest(start_date_string, end_date_string))
                callback(null, RDSMockResponseFactory(start_date_string, end_date_string))
            },
        )

        const rdsService = new RDSService()

        const usageByHour = await rdsService.getUsage(
            new Date(start_date_string),
            new Date(end_date_string),
        )

        expect(usageByHour).toEqual([
            { cpuUtilizationAverage: 1.0456, numberOfvCpus: 4, timestamp: new Date(start_date_string) },
            { cpuUtilizationAverage: 2.03242, numberOfvCpus: 4, timestamp: new Date(end_date_string) },
        ])
    });
});
