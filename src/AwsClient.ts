import * as AWS from 'aws-sdk'

class AwsClient {
  private readonly costExplorer: AWS.CostExplorer

  constructor(costExplorer: AWS.CostExplorer) {
    this.costExplorer = costExplorer
  }

  getEbsUsage(startDate: Date, endDate: Date): Promise<AWS.CostExplorer.GetCostAndUsageResponse> {
    var params = {
      TimePeriod: { /* required */
          Start: startDate.toISOString().substr(0, 10), /* required */
          End: endDate.toISOString().substr(0, 10) /* required */
      },
      Filter: {
          "Dimensions": {
              "Key": "USAGE_TYPE",
              "Values": [
                  "EBS:VolumeUsage.gp2"
              ]
          }
      },
      Granularity: "DAILY",
      Metrics: [
          'UsageQuantity',
          /* more items */
      ],
      // NextPageToken: 'STRING_VALUE'
    };

    return this.costExplorer
      .getCostAndUsage(params)
      .promise()
  }
}

export default AwsClient
