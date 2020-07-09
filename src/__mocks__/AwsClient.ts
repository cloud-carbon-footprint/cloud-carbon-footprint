export default class MockAwsClient {
  getEbsUsage(startDate: Date, endDate: Date): Promise<AWS.CostExplorer.GetCostAndUsageResponse> {
    return Promise.resolve({
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
        {
          Estimated: false,
          Groups: [],
          TimePeriod: {
            End: '2020-06-29',
            Start: '2020-06-28',
          },
          Total: {
            UsageQuantity: {
              Amount: '0.8331728386',
              Unit: 'GB-Month',
            },
          },
        },
        {
          Estimated: false,
          Groups: [],
          TimePeriod: {
            End: '2020-06-30',
            Start: '2020-06-29',
          },
          Total: {
            UsageQuantity: {
              Amount: '0.7519876538',
              Unit: 'GB-Month',
            },
          },
        },
      ],
    })
  }
}
