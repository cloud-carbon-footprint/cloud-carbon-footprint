import AwsClient from './AwsClient'
import * as AWS from 'aws-sdk'

export default class Controller {
  private readonly client: AwsClient

  constructor(public name: string, client: AwsClient) {
    this.name = name
    this.client = client
  }

  productionReady(): Promise<string> {
    return this.client.getEbsUsage(new Date('1992'), new Date('2020'))
      .then(r => r.ResultsByTime[0].Total.UsageQuantity.Amount)
      .catch(() => 'shucks')
  }
}
