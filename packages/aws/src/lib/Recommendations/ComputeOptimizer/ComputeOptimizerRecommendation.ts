/*
 * © 2021 Thoughtworks, Inc.
 */
import { ComputeOptimizerRecommendationOption } from '@cloud-carbon-footprint/common'
import { EC2ComputeOptimizerRecommendationData } from './ComputeOptimizerRecommendationData'

export default class ComputeOptimizerRecommendation {
  public accountId: string
  public accountName: string
  public region: string
  public type: string
  public resourceId: string
  public recommendationOptions: ComputeOptimizerRecommendationOption[]

  protected constructor(init: Partial<EC2ComputeOptimizerRecommendationData>) {
    Object.assign(this, init)

    this.accountName = this.accountId
    this.type = init.finding
  }

  public getRegion(resourceArn: string) {
    return resourceArn.split(':')[3]
  }

  public getResourceId(resourceArn: string) {
    return resourceArn.split('/').pop()
  }
}
