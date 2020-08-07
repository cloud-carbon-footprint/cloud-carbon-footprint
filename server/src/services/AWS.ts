import { CostExplorer } from 'aws-sdk'
import { AWS_REGIONS } from './AWSRegions'

export async function getCostAndUsageResponses(
  params: CostExplorer.GetCostAndUsageRequest,
): Promise<CostExplorer.GetCostAndUsageResponse[]> {
  const costExplorer = new CostExplorer({
    region: AWS_REGIONS.US_EAST_1, //must be us-east-1 to work
  })

  let response: CostExplorer.GetCostAndUsageResponse = {}
  const responses: CostExplorer.GetCostAndUsageResponse[] = []

  do {
    response = await costExplorer.getCostAndUsage({ ...params, NextPageToken: response.NextPageToken }).promise()
    responses.push(response)
  } while (response.NextPageToken)
  return responses
}
