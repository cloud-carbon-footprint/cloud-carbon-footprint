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

  getUsage(startDate: Date, endDate: Date): Promise<StorageUsage[]> {
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

    return this.costExplorer
      .getCostAndUsage(params)
      .promise()
      .then(() => [
        {
          sizeGb: 1.2120679, //todo - remember to parseFloat
          timestamp: new Date('2020-06-27T00:00:00Z'),
        },
      ])
  }
}

export default EbsDatasource
