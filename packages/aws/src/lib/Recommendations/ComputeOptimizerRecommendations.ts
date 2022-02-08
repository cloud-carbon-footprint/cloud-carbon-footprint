/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import {
  ComputeEstimator,
  ICloudRecommendationsService,
  MemoryEstimator,
} from '@cloud-carbon-footprint/core'
import { Logger, RecommendationResult } from '@cloud-carbon-footprint/common'
import { ServiceWrapper } from '../ServiceWrapper'
import {
  EBSComputeOptimizerRecommendation,
  EC2ComputeOptimizerRecommendation,
  LambdaComputeOptimizerRecommendation,
} from './ComputeOptimizer'

export default class ComputeOptimizerRecommendations
  implements ICloudRecommendationsService
{
  private readonly recommendationsLogger: Logger
  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly memoryEstimator: MemoryEstimator,
    private readonly serviceWrapper: ServiceWrapper,
  ) {
    this.recommendationsLogger = new Logger('AWSRecommendations')
  }

  async getRecommendations(centralComputeOptimizerBucket: string) {
    const params = {
      Bucket: centralComputeOptimizerBucket,
    }
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
}
