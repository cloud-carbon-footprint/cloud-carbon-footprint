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
  EBSTargetComputeOptimizerRecommendation,
  EC2CurrentComputeOptimizerRecommendation,
  EC2TargetComputeOptimizerRecommendation,
  LambdaCurrentComputeOptimizerRecommendation,
  LambdaTargetComputeOptimizerRecommendation,
} from './ComputeOptimizer'
import AWSComputeEstimatesBuilder from '../AWSComputeEstimatesBuilder'
import AWSStorageEstimatesBuilder from '../AWSStorageEstimatesBuilder'
import AWSMemoryEstimatesBuilder from '../AWSMemoryEstimatesBuilder'
import { SSD_USAGE_TYPES } from '../CostAndUsageTypes'
import ComputeOptimizerRecommendation from './ComputeOptimizer/ComputeOptimizerRecommendation'

export default class ComputeOptimizerRecommendations
  implements ICloudRecommendationsService
{
  private readonly recommendationsLogger: Logger
  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly memoryEstimator: MemoryEstimator,
    private readonly ssdStorageEstimator: StorageEstimator,
    private readonly hddStorageEstimator: StorageEstimator,
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

              if (targetComputeOptimizerRecommendation.costSavings) {
                let kilowattHourSavings = 0
                let co2eSavings = 0

                if (service === 'ebs') {
                  const currentStorageFootprint =
                    this.getStorageFootprintEstimate(
                      currentComputeOptimizerRecommendation,
                    )

                  const targetStorageFootprint =
                    this.getStorageFootprintEstimate(
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

                  if (
                    currentMemoryFootprint.co2e ||
                    targetMemoryFootprint.co2e
                  ) {
                    kilowattHourSavings +=
                      currentMemoryFootprint.kilowattHours -
                      targetMemoryFootprint.kilowattHours
                    co2eSavings +=
                      currentMemoryFootprint.co2e - targetMemoryFootprint.co2e
                  }
                }

                recommendationsResult.push({
                  cloudProvider: 'AWS',
                  accountId: currentComputeOptimizerRecommendation.accountId,
                  accountName: currentComputeOptimizerRecommendation.accountId,
                  instanceName:
                    currentComputeOptimizerRecommendation?.instanceName,
                  region: currentComputeOptimizerRecommendation.region,
                  recommendationType:
                    currentComputeOptimizerRecommendation.type,
                  resourceId: currentComputeOptimizerRecommendation.resourceId,
                  recommendationDetail: this.getRecommendationDetail(
                    service,
                    currentComputeOptimizerRecommendation,
                    targetComputeOptimizerRecommendation,
                  ),
                  costSavings:
                    parseFloat(
                      targetComputeOptimizerRecommendation.costSavings,
                    ) || 0,
                  co2eSavings,
                  kilowattHourSavings,
                })
              }
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

  private getRecommendationDetail(
    service: string,
    currentRecommendation: ComputeOptimizerRecommendation,
    targetRecommendation: ComputeOptimizerRecommendation,
  ): string {
    type ServiceDetail = { [service: string]: string }
    const modifyType: ServiceDetail = {
      ec2: 'instance type',
      ebs: 'volume type',
      lambda: 'configuration memory size',
    }

    return `Save cost by changing ${modifyType[service]} from ${currentRecommendation.description} to ${targetRecommendation.description}.`
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

  private getStorageFootprintEstimate(
    computeOptimizerRecommendation: EBSCurrentComputeOptimizerRecommendation,
  ) {
    let storageEstimator = this.hddStorageEstimator
    if (this.volumeTypeIsSSD(computeOptimizerRecommendation.volumeType)) {
      storageEstimator = this.ssdStorageEstimator
    }
    return new AWSStorageEstimatesBuilder(
      computeOptimizerRecommendation,
      storageEstimator,
    ).storageFootprint
  }

  private volumeTypeIsSSD(volumeType: string) {
    return SSD_USAGE_TYPES.some((type) => type.includes(volumeType))
  }
}
