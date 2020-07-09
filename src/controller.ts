import AwsClient from './AwsClient'
import * as AWS from 'aws-sdk'
import EbsEstimator from './EbsEstimator'
import { FootprintEstimate } from './common'

export default class Controller {
  private readonly client: AwsClient

  constructor(public name: string, client: AwsClient) {
    this.name = name
    this.client = client
  }

  ebsEstimate(start: Date, end: Date): Promise<FootprintEstimate[]> {
    return this.client.getEbsUsage(start, end)
      .then(data => new EbsEstimator(data).estimate())
  }
}
