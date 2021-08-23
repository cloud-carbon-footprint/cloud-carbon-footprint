/*
 * © 2021 Thoughtworks, Inc.
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
import {
  RecommendationResult,
  Logger,
  AWS_RECOMMENDATIONS_TARGETS,
} from '@cloud-carbon-footprint/common'
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

  async getRecommendations(
    recommendationTarget: AWS_RECOMMENDATIONS_TARGETS,
  ): Promise<RecommendationResult[]> {
    const params: GetRightsizingRecommendationRequest = {
      Service: this.rightsizingRecommendationsService,
      Configuration: {
        BenefitsConsidered: false,
        RecommendationTarget: recommendationTarget,
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
          let recommendationDetail = this.getRecommendationDetail(
            rightsizingCurrentRecommendation,
          )

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
            recommendationDetail = this.getRecommendationDetail(
              rightsizingCurrentRecommendation,
              rightsizingTargetRecommendation,
            )

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
            resourceId: rightsizingCurrentRecommendation.resourceId,
            instanceName: rightsizingCurrentRecommendation.instanceName,
            co2eSavings,
            costSavings,
          })
        },
      )
      return recommendationsResult
    } catch (e) {
      throw new Error(
        `Failed to grab AWS Rightsizing recommendations. Reason: ${e.message}`,
      )
    }
  }

  private getRecommendationDetail(
    rightsizingCurrentRecommendation: RightsizingCurrentRecommendation,
    rightsizingTargetRecommendation?: RightsizingTargetRecommendation,
  ): string {
    const modifyDetail = `Update instance type ${rightsizingCurrentRecommendation.instanceType} to ${rightsizingTargetRecommendation?.instanceType}`
    let defaultDetail = `${rightsizingCurrentRecommendation.type} instance: ${rightsizingCurrentRecommendation.instanceName}.`
    if (!rightsizingCurrentRecommendation.instanceName) {
      defaultDetail = `${rightsizingCurrentRecommendation.type} instance with Resource ID: ${rightsizingCurrentRecommendation.resourceId}.`
    }
    const recommendationTypes: { [key: string]: string } = {
      Terminate: defaultDetail,
      Modify: `${defaultDetail} ${modifyDetail}`,
    }
    return recommendationTypes[rightsizingCurrentRecommendation.type]
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
