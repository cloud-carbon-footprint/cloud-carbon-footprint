import { CostExplorer } from 'aws-sdk'
import { GetCostAndUsageResponse } from 'aws-sdk/clients/costexplorer'
import { AWSDecorator } from '@services/AWSDecorator'
import Cost from '@domain/Cost'

export async function getCostFromCostExplorer(
  params: CostExplorer.GetCostAndUsageRequest,
  region: string,
): Promise<Cost[]> {
  const responses: GetCostAndUsageResponse[] = await new AWSDecorator(region).getCostAndUsageResponses(params)

  return responses
    .map((response) => {
      return response.ResultsByTime.map((result) => {
        const timestampString = result.TimePeriod.Start
        return result.Groups.map((group) => {
          const amount = Number.parseFloat(group.Metrics.AmortizedCost.Amount)
          const currency = group.Metrics.AmortizedCost.Unit
          return {
            amount,
            currency,
            timestamp: new Date(timestampString),
          }
        })
      })
    })
    .flat()
    .flat()
}
