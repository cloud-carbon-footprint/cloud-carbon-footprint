import { CloudWatch, CostExplorer } from 'aws-sdk'
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

export async function getMetricDataResponses(
  params: CloudWatch.GetMetricDataInput,
): Promise<CloudWatch.GetMetricDataOutput[]> {
  const cloudWatch = new CloudWatch()

  let response: CloudWatch.GetMetricDataOutput = {}
  const responses: CloudWatch.GetMetricDataOutput[] = []

  do {
    response = await cloudWatch.getMetricData({ ...params, NextToken: response.NextToken }).promise()
    responses.push(response)
  } while (response.NextToken)

  return responses
}
