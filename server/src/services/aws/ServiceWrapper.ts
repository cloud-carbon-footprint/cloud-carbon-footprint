import { CloudWatch, CostExplorer } from 'aws-sdk'
import { path } from 'ramda'
import { GetCostAndUsageRequest, GetCostAndUsageResponse } from 'aws-sdk/clients/costexplorer'
import { GetMetricDataInput, GetMetricDataOutput } from 'aws-sdk/clients/cloudwatch'

export class ServiceWrapper {
  constructor(private readonly cloudWatch: CloudWatch, private readonly costExplorer: CostExplorer) {}
  private async getCostAndUsageResponse(
    params: CostExplorer.GetCostAndUsageRequest,
  ): Promise<CostExplorer.GetCostAndUsageResponse[]> {
    return [await this.costExplorer.getCostAndUsage(params).promise()]
  }

  private async getMetricDataResponse(
    params: CloudWatch.GetMetricDataInput,
  ): Promise<CloudWatch.GetMetricDataOutput[]> {
    return [await this.cloudWatch.getMetricData(params).promise()]
  }

  @enablePagination('NextPageToken')
  public async getCostAndUsageResponses(params: GetCostAndUsageRequest): Promise<GetCostAndUsageResponse[]> {
    return await this.getCostAndUsageResponse(params)
  }

  @enablePagination('NextToken')
  public async getMetricDataResponses(params: GetMetricDataInput): Promise<GetMetricDataOutput[]> {
    return await this.getMetricDataResponse(params)
  }
}

function enablePagination<RequestType, ResponseType>(nextPageProperty: string) {
  return (target: unknown, propertyKey: string, descriptor?: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    descriptor.value = async function (props: RequestType) {
      const responses: ResponseType[] = []

      let latestResponse: ResponseType
      do {
        const args = [
          {
            ...props,
            [nextPageProperty]: path([responses.length, nextPageProperty], responses),
          },
        ]
        latestResponse = (await originalMethod.apply(this, args))[0]
        responses.push(latestResponse)
      } while (path([nextPageProperty], latestResponse))

      return responses
    }

    return descriptor
  }
}
