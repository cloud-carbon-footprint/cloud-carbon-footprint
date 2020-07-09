import AwsClient from './AwsClient'
import * as AWS from 'aws-sdk'

const SSD_COEFFICIENT = 1.52

interface FootprintEstimate {
  readonly timestamp: Date
  readonly wattage: number
  readonly co2: number
}

interface FootprintEstimator {
  estimate(): FootprintEstimate[]
}

class EbsEstimator implements FootprintEstimator {
  private readonly data: AWS.CostExplorer.GetCostAndUsageResponse

  constructor(data: AWS.CostExplorer.GetCostAndUsageResponse) {
    this.data = data
  }

  estimate(): FootprintEstimate[] {
    return this.data.ResultsByTime
      .map(result => {
        // *NOTE: Assuming all months have 30 days
        const usageGb = Number.parseFloat(result.Total.UsageQuantity.Amount) * 30; 
        //apply formula -> TBh * 24 hrs
        const estimatedWattage = usageGb / 1000 * SSD_COEFFICIENT * 24; 

        return {
          timestamp: new Date(result.TimePeriod.Start),
          wattage: estimatedWattage,
          co2: estimatedWattage * 0.70704 / 1000
        }
      })
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}

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
