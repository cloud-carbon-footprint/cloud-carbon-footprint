/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import {
  GetRightsizingRecommendationRequest,
  RightsizingRecommendation as AwsRightsizingRecommendation,
  RightsizingRecommendationList,
} from 'aws-sdk/clients/costexplorer'
import {
  ComputeEstimator,
  ICloudRecommendationsService,
  MemoryEstimator,
} from '@cloud-carbon-footprint/core'
import {
  AWS_RECOMMENDATIONS_SERVICES,
  AWS_RECOMMENDATIONS_TARGETS,
  configLoader,
  Logger,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'
import { ServiceWrapper } from '../ServiceWrapper'
import AWSComputeEstimatesBuilder from '../AWSComputeEstimatesBuilder'
import AWSMemoryEstimatesBuilder from '../AWSMemoryEstimatesBuilder'
import {
  RightsizingCurrentRecommendation,
  RightsizingRecommendation,
  RightsizingTargetRecommendation,
} from './Rightsizing'
import {
  EBSComputeOptimizerRecommendation,
  EC2ComputeOptimizerRecommendation,
  GetComputeOptimizerRecommendationsRequest,
  LambdaComputeOptimizerRecommendation,
} from './ComputeOptimizer'

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
    const computeOptimizerParams = {
      Bucket: configLoader().AWS.COMPUTE_OPTIMIZER_BUCKET,
    }

    const rightSizingParams: GetRightsizingRecommendationRequest = {
      Service: this.rightsizingRecommendationsService,
      Configuration: {
        BenefitsConsidered: false,
        RecommendationTarget: recommendationTarget,
      },
    }

    if (
      configLoader().AWS.RECOMMENDATIONS_SERVICE ===
      AWS_RECOMMENDATIONS_SERVICES.ComputeOptimizer
    ) {
      return await this.getComputerOptimizerRecommendations(
        computeOptimizerParams,
      )
    } else if (
      configLoader().AWS.RECOMMENDATIONS_SERVICE ===
      AWS_RECOMMENDATIONS_SERVICES.RightSizing
    ) {
      return await this.getRightsizingRecommendations(rightSizingParams)
    }

    const rightSizingRecommendations: RecommendationResult[] =
      await this.getRightsizingRecommendations(rightSizingParams)

    const computeOptimizerRecommendations: RecommendationResult[] =
      await this.getComputerOptimizerRecommendations(computeOptimizerParams)

    return rightSizingRecommendations.concat(computeOptimizerRecommendations)
  }

  private async getComputerOptimizerRecommendations(
    params: GetComputeOptimizerRecommendationsRequest,
  ) {
    try {
      const bucketObjectsList = await this.serviceWrapper.listBucketObjects(
        params,
      )

      const recommendationsResult: RecommendationResult[] = []
      const includedRecommendationTypes = ['OVER_PROVISIONED', 'NOTOPTIMIZED']
      const optimalPerformanceRiskLevel = 3

      for (const recommendationsData of bucketObjectsList.Contents) {
        const recommendationDate = new Date(
          recommendationsData.Key.match(
            /[0-9]{4}-[0-9]{2}-[0-9]{2}/g,
          )[0].toString(),
        )

        const isFromPreviousDay =
          moment.utc(recommendationDate) >= moment.utc().subtract(1, 'days')
        const isIncludedService = !recommendationsData.Key.includes('asg')
        const service: string = recommendationsData.Key.split('/')[1]

        if (isFromPreviousDay && isIncludedService) {
          const params = {
            Bucket: bucketObjectsList.Name,
            Key: recommendationsData.Key,
          }

          const parsedRecommendations =
            await this.serviceWrapper.getComputeOptimizerRecommendationsResponse(
              params,
            )

          parsedRecommendations.forEach((recommendation) => {
            const recommendationType = recommendation.finding

            if (
              includedRecommendationTypes.includes(
                recommendationType.toUpperCase(),
              )
            ) {
              const computeOptimizerRecommendationServices: {
                [service: string]: any
              } = {
                ec2: EC2ComputeOptimizerRecommendation,
                ebs: EBSComputeOptimizerRecommendation,
                lambda: LambdaComputeOptimizerRecommendation,
              }

              const computeOptimizerRecommendation =
                new computeOptimizerRecommendationServices[service](
                  recommendation,
                )

              let recommendationOption =
                computeOptimizerRecommendation.recommendationOptions[0]
              if (service != 'lambda') {
                recommendationOption =
                  computeOptimizerRecommendation.recommendationOptions.find(
                    (recommendation: any) =>
                      recommendation.performanceRisk <=
                      optimalPerformanceRiskLevel,
                  )
              }

              const recommendationOptionServiceType: {
                [service: string]: any
              } = {
                ec2: 'instanceType',
                ebs: 'volumeType',
                lambda: 'memorySize',
              }

              recommendationsResult.push({
                cloudProvider: 'AWS',
                accountId: computeOptimizerRecommendation.accountId,
                accountName: computeOptimizerRecommendation.accountId,
                instanceName: computeOptimizerRecommendation?.instanceName,
                region: computeOptimizerRecommendation.region,
                recommendationType: computeOptimizerRecommendation.type,
                resourceId: computeOptimizerRecommendation.resourceId,
                recommendationDetail:
                  recommendationOption?.[
                    recommendationOptionServiceType[service]
                  ],
                costSavings: parseFloat(recommendationOption.costSavings),
                co2eSavings: 0,
                kilowattHourSavings: 0,
              })
            }
          })
        }
      }
      return recommendationsResult
    } catch (e) {
      throw new Error(
        `Failed to grab AWS Compute Optimizer recommendations. Reason: ${e.message}`,
      )
    }
  }

  private async getRightsizingRecommendations(
    params: GetRightsizingRecommendationRequest,
  ) {
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
