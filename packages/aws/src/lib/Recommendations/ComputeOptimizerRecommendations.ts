/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import {
  ComputeEstimator,
  ICloudRecommendationsService,
  MemoryEstimator,
  StorageEstimator,
} from '@cloud-carbon-footprint/core'
import { Logger, RecommendationResult } from '@cloud-carbon-footprint/common'
import { ServiceWrapper } from '../ServiceWrapper'
import {
  EBSCurrentComputeOptimizerRecommendation,
  EC2CurrentComputeOptimizerRecommendation,
  LambdaCurrentComputeOptimizerRecommendation,
} from './ComputeOptimizer'
import AWSComputeEstimatesBuilder from '../AWSComputeEstimatesBuilder'
import AWSStorageEstimatesBuilder from '../AWSStorageEstimatesBuilder'
import EC2TargetComputeOptimizerRecommendation from './ComputeOptimizer/EC2TargetComputeOptimizerRecommendation'
import AWSMemoryEstimatesBuilder from '../AWSMemoryEstimatesBuilder'
import EBSTargetComputeOptimizerRecommendation from './ComputeOptimizer/EBSTargetComputeOptimizerRecommendation'
import LambdaTargetComputeOptimizerRecommendation from './ComputeOptimizer/LambdaTargetComputeOptimizerRecommendation'

export default class ComputeOptimizerRecommendations
  implements ICloudRecommendationsService
{
  private readonly recommendationsLogger: Logger
  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly memoryEstimator: MemoryEstimator,
    private readonly storageEstimator: StorageEstimator,
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
                ec2: [
                  EC2CurrentComputeOptimizerRecommendation,
                  EC2TargetComputeOptimizerRecommendation,
                ],
                ebs: [
                  EBSCurrentComputeOptimizerRecommendation,
                  EBSTargetComputeOptimizerRecommendation,
                ],
                lambda: [
                  LambdaCurrentComputeOptimizerRecommendation,
                  LambdaTargetComputeOptimizerRecommendation,
                ],
              }

              const currentComputeOptimizerRecommendation =
                new computeOptimizerRecommendationServices[service][0](
                  recommendation,
                )

              const targetComputeOptimizerRecommendation =
                new computeOptimizerRecommendationServices[service][1](
                  recommendation,
                )

              let kilowattHourSavings = 0
              let co2eSavings = 0

              if (service === 'ebs') {
                const currentStorageFootprint =
                  this.getStorageFootprintEstimates(
                    currentComputeOptimizerRecommendation,
                  )

                const targetStorageFootprint =
                  this.getStorageFootprintEstimates(
                    targetComputeOptimizerRecommendation,
                  )

                kilowattHourSavings =
                  currentStorageFootprint.kilowattHours -
                  targetStorageFootprint.kilowattHours
                co2eSavings =
                  currentStorageFootprint.co2e - targetStorageFootprint.co2e
              } else {
                const [currentComputeFootprint, currentMemoryFootprint] =
                  this.getComputeAndMemoryFootprintEstimates(
                    currentComputeOptimizerRecommendation,
                  )

                const [targetComputeFootprint, targetMemoryFootprint] =
                  this.getComputeAndMemoryFootprintEstimates(
                    targetComputeOptimizerRecommendation,
                  )

                kilowattHourSavings =
                  currentComputeFootprint.kilowattHours -
                  targetComputeFootprint.kilowattHours
                co2eSavings =
                  currentComputeFootprint.co2e - targetComputeFootprint.co2e

                if (currentMemoryFootprint.co2e || targetMemoryFootprint.co2e) {
                  kilowattHourSavings +=
                    currentMemoryFootprint.kilowattHours -
                    targetMemoryFootprint.kilowattHours
                  co2eSavings +=
                    currentMemoryFootprint.co2e - targetMemoryFootprint.co2e
                }
              }

              const recommendationDetailServiceType: {
                [service: string]: string
              } = {
                ebs: 'volumeType',
                ec2: 'instanceType',
                lambda: 'memorySize',
              }

              recommendationsResult.push({
                cloudProvider: 'AWS',
                accountId: currentComputeOptimizerRecommendation.accountId,
                accountName: currentComputeOptimizerRecommendation.accountId,
                instanceName:
                  currentComputeOptimizerRecommendation?.instanceName,
                region: currentComputeOptimizerRecommendation.region,
                recommendationType: currentComputeOptimizerRecommendation.type,
                resourceId: currentComputeOptimizerRecommendation.resourceId,
                recommendationDetail:
                  targetComputeOptimizerRecommendation[
                    recommendationDetailServiceType[service]
                  ],
                costSavings: parseFloat(
                  targetComputeOptimizerRecommendation.costSavings,
                ),
                co2eSavings,
                kilowattHourSavings,
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

  private getComputeAndMemoryFootprintEstimates(
    computeOptimizerRecommendation: EC2CurrentComputeOptimizerRecommendation,
  ) {
    const computeFootprint = new AWSComputeEstimatesBuilder(
      computeOptimizerRecommendation,
      this.computeEstimator,
    ).computeFootprint

    const memoryFootprint = new AWSMemoryEstimatesBuilder(
      computeOptimizerRecommendation,
      this.memoryEstimator,
    ).memoryFootprint

    return [computeFootprint, memoryFootprint]
  }

  private getStorageFootprintEstimates(
    computeOptimizerRecommendation: EBSCurrentComputeOptimizerRecommendation,
  ) {
    return new AWSStorageEstimatesBuilder(
      computeOptimizerRecommendation,
      this.storageEstimator,
    ).storageFootprint
  }
}
