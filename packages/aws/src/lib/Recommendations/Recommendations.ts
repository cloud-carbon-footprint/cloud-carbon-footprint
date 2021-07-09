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
import { RecommendationResult, Logger } from '@cloud-carbon-footprint/common'
import { ServiceWrapper } from '../ServiceWrapper'
import AWSComputeEstimatesBuilder from '../AWSComputeEstimatesBuilder'
import AWSMemoryEstimatesBuilder from '../AWSMemoryEstimatesBuilder'
import RightsizingCurrentRecommendation from './RightsizingCurrentRecommendation'
import RightsizingTargetRecommendation from './RightsizingTargetRecommendation'
import RightsizingRecommendation from './RightsizingRecommendation'

export default class Recommendations implements ICloudRecommendationsService {
  private readonly rightsizingRecommendationsService: string
  private readonly recommendationsLogger: Logger
  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly memoryEstimator: MemoryEstimator,
    private readonly serviceWrapper: ServiceWrapper,
  ) {
    this.rightsizingRecommendationsService = 'AmazonEC2'
    this.recommendationsLogger = new Logger('AWSRecommendations')
  }

  async getRecommendations(): Promise<RecommendationResult[]> {
    const params: GetRightsizingRecommendationRequest = {
      Service: this.rightsizingRecommendationsService,
      Configuration: {
        BenefitsConsidered: false,
        RecommendationTarget: 'SAME_INSTANCE_FAMILY',
      },
    }

    try {
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

          const [currentComputeFootprint, currentMemoryFootprint] =
            this.getFootprintEstimates(rightsizingCurrentRecommendation)

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

            const [targetComputeFootprint, targetMemoryFootprint] =
              this.getFootprintEstimates(rightsizingTargetRecommendation)

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
    } catch (e) {
      this.recommendationsLogger.warn(
        'Failed to grab AWS Rightsizing recommendations',
      )
    }
  }

  private getFootprintEstimates(
    rightsizingRecommendation: RightsizingRecommendation,
  ) {
    const computeFootprint = new AWSComputeEstimatesBuilder(
      rightsizingRecommendation,
      this.computeEstimator,
    ).computeFootprint

    const memoryFootprint = new AWSMemoryEstimatesBuilder(
      rightsizingRecommendation,
      this.memoryEstimator,
    ).memoryFootprint

    return [computeFootprint, memoryFootprint]
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
