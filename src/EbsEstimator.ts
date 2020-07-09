import { FootprintEstimator, FootprintEstimate, SSD_COEFFICIENT } from './common'
import * as AWS from 'aws-sdk'

export default class EbsEstimator implements FootprintEstimator {
  private readonly data: AWS.CostExplorer.GetCostAndUsageResponse

  constructor(data: AWS.CostExplorer.GetCostAndUsageResponse) {
    this.data = data
  }

  estimate(): FootprintEstimate[] {
    return this.data.ResultsByTime
      .map(result => {
        const amount = Number.parseFloat(result.Total.UsageQuantity.Amount)
        // *NOTE: Assuming all months have 30 days
        const usageGb = amount * 30; 
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

