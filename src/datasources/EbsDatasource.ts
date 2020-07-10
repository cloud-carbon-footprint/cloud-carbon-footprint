import * as AWS from 'aws-sdk'
import StorageUsage from '../domain/StorageUsage'
import StorageDatasource from '../domain/StorageDatasource'

class EbsDatasource implements StorageDatasource {
  private readonly costExplorer: AWS.CostExplorer

  constructor() {
    this.costExplorer = new AWS.CostExplorer({
      region: 'us-east-1',
    })
  }

  async getUsage(startDate: Date, endDate: Date): Promise<StorageUsage[]> {
    const params = {
      TimePeriod: {
        /* required */ Start: startDate.toISOString().substr(0, 10) /* required */,
        End: endDate.toISOString().substr(0, 10) /* required */,
      },
      Filter: {
        Dimensions: {
          Key: 'USAGE_TYPE',
          Values: ['EBS:VolumeUsage.gp2'],
        },
      },
      Granularity: 'DAILY',
      Metrics: [
        'UsageQuantity',
        /* more items */
      ],
      // NextPageToken: 'STRING_VALUE'
    }

    const response = await this.costExplorer.getCostAndUsage(params).promise()

    return (
      response.ResultsByTime?.map((result) => {
        const sizeGb = Number.parseFloat(result?.Total?.UsageQuantity?.Amount)
        const timestampString = result?.TimePeriod?.Start
        return {
          sizeGb,
          timestamp: new Date(timestampString),
        }
      }).filter((r: StorageUsage) => r.sizeGb && r.timestamp) || []
    )
  }
}

export default EbsDatasource
