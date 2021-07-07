/*
 * © 2021 ThoughtWorks, Inc.
 */

import {
  GetRightsizingRecommendationRequest,
  RightsizingRecommendationList,
  RightsizingRecommendation as AwsRightsizingRecommendation,
} from 'aws-sdk/clients/costexplorer'

import {
  ICloudRecommendationsService,
  ComputeEstimator,
  MemoryEstimator,
} from '@cloud-carbon-footprint/core'
import { RecommendationResult } from '@cloud-carbon-footprint/common'
import { ServiceWrapper } from '../ServiceWrapper'
import AWSComputeEstimatesBuilder from '../AWSComputeEstimatesBuilder'
import AWSMemoryEstimatesBuilder from '../AWSMemoryEstimatesBuilder'
import RightsizingCurrentRecommendation from './RightsizingCurrentRecommendation'
import RightsizingTargetRecommendation from './RightsizingTargetRecommendation'

export default class Recommendations implements ICloudRecommendationsService {
  private readonly rightsizingRecommendationsService: string
  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly memoryEstimator: MemoryEstimator,
    private readonly serviceWrapper: ServiceWrapper,
  ) {
    this.rightsizingRecommendationsService = 'AmazonEC2'
  }

  async getRecommendations(): Promise<RecommendationResult[]> {
    const params: GetRightsizingRecommendationRequest = {
      Service: this.rightsizingRecommendationsService,
      Configuration: {
        BenefitsConsidered: false,
        RecommendationTarget: 'SAME_INSTANCE_FAMILY',
      },
    }

    const results =
      await this.serviceWrapper.getRightsizingRecommendationsResponses(params)
    const rightsizingRecommendations: RightsizingRecommendationList =
      results.flatMap(
        ({ RightsizingRecommendations }) => RightsizingRecommendations,
      )
    const recommendationsResult: RecommendationResult[] = []
    rightsizingRecommendations.forEach(
      (recommendation: AwsRightsizingRecommendation) => {
        const rightsizingCurrentRecommendation =
          new RightsizingCurrentRecommendation(recommendation)

        const currentComputeFootprint = new AWSComputeEstimatesBuilder(
          rightsizingCurrentRecommendation,
          this.computeEstimator,
        ).computeFootprint

        const currentMemoryFootprint = new AWSMemoryEstimatesBuilder(
          rightsizingCurrentRecommendation,
          this.memoryEstimator,
        ).memoryFootprint

        let kilowattHourSavings = currentComputeFootprint.kilowattHours
        let co2eSavings = currentComputeFootprint.co2e
        let costSavings = rightsizingCurrentRecommendation.costSavings
        let recommendationDetail = `${rightsizingCurrentRecommendation.type} instance: ${rightsizingCurrentRecommendation.instanceName}`

        if (currentMemoryFootprint.co2e) {
          kilowattHourSavings += currentMemoryFootprint.kilowattHours
          co2eSavings += currentMemoryFootprint.co2e
        }

        if (recommendation.RightsizingType === 'Modify') {
          this.getTargetInstance(recommendation)
          const rightsizingTargetRecommendation =
            new RightsizingTargetRecommendation(recommendation)

          const targetComputeFootprint = new AWSComputeEstimatesBuilder(
            rightsizingTargetRecommendation,
            this.computeEstimator,
          ).computeFootprint

          const targetMemoryFootprint = new AWSMemoryEstimatesBuilder(
            rightsizingTargetRecommendation,
            this.memoryEstimator,
          ).memoryFootprint

          kilowattHourSavings -= targetComputeFootprint.kilowattHours
          co2eSavings -= targetComputeFootprint.co2e
          costSavings = rightsizingTargetRecommendation.costSavings
          recommendationDetail = `${rightsizingCurrentRecommendation.type} instance: ${rightsizingCurrentRecommendation.instanceName}. Update instance type ${rightsizingCurrentRecommendation.instanceType} to ${rightsizingTargetRecommendation.instanceType}`

          if (targetMemoryFootprint.co2e) {
            kilowattHourSavings -= targetMemoryFootprint.kilowattHours
            co2eSavings -= targetMemoryFootprint.co2e
          }
        }

        // if there are no potential savings, do not include recommendation object
        co2eSavings !== 0 &&
          recommendationsResult.push({
            cloudProvider: 'AWS',
            accountId: rightsizingCurrentRecommendation.accountId,
            accountName: rightsizingCurrentRecommendation.accountId,
            region: rightsizingCurrentRecommendation.region,
            recommendationType: rightsizingCurrentRecommendation.type,
            recommendationDetail,
            kilowattHourSavings,
            co2eSavings,
            costSavings,
          })
      },
    )
    return recommendationsResult
  }

  private getTargetInstance(
    rightsizingRecommendationData: AwsRightsizingRecommendation,
  ): void {
    let targetInstance =
      rightsizingRecommendationData.ModifyRecommendationDetail.TargetInstances.pop()
    let savings = 0
    rightsizingRecommendationData.ModifyRecommendationDetail.TargetInstances.map(
      (instance) => {
        if (parseFloat(instance.EstimatedMonthlySavings) >= savings) {
          savings = parseFloat(instance.EstimatedMonthlySavings)
          targetInstance = instance
        }
      },
    )
    rightsizingRecommendationData.ModifyRecommendationDetail.TargetInstances = [
      targetInstance,
    ]
  }
}
