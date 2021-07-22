/*
 * © 2021 Thoughtworks, Inc.
 */

import { CostExplorer } from 'aws-sdk'
import { GetCostAndUsageResponse } from 'aws-sdk/clients/costexplorer'
import { Cost } from '@cloud-carbon-footprint/core'
import { ServiceWrapper } from './ServiceWrapper'

export async function getCostFromCostExplorer(
  params: CostExplorer.GetCostAndUsageRequest,
  serviceWrapper: ServiceWrapper,
): Promise<Cost[]> {
  const responses: GetCostAndUsageResponse[] =
    await serviceWrapper.getCostAndUsageResponses(params)
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
