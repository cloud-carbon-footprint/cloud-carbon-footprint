/*
 * © 2021 Thoughtworks, Inc.
 */
import {
  AWS_DEFAULT_RECOMMENDATIONS_SERVICE,
  AWS_RECOMMENDATIONS_SERVICES,
  AWS_RECOMMENDATIONS_TARGETS,
  configLoader,
  Logger,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'
import {
  ComputeEstimator,
  MemoryEstimator,
  StorageEstimator,
} from '@cloud-carbon-footprint/core'
import {
  ComputeOptimizerRecommendations,
  RightsizingRecommendations,
} from './index'
import { AWS_CLOUD_CONSTANTS } from '../../domain'
import { ServiceWrapper } from '../ServiceWrapper'

export default class Recommendations {
  static async getRecommendations(
    recommendationTarget: AWS_RECOMMENDATIONS_TARGETS,
    serviceWrapper: ServiceWrapper,
  ): Promise<RecommendationResult[]> {
    const recommendationData: RecommendationResult[] = []

    let recommendationService = configLoader().AWS.RECOMMENDATIONS_SERVICE
    if (!recommendationService) {
      const configLogger = new Logger('AWSRecommendations')
      configLogger.warn(
        'No AWS recommendations service was specified in env config. Retrieving only Rightsizing recommendations by default. The default service option may become "all" services in the future.',
      )
      recommendationService = AWS_DEFAULT_RECOMMENDATIONS_SERVICE
    }

    if (recommendationService !== AWS_RECOMMENDATIONS_SERVICES.RightSizing) {
      const computeOptimizerRecommendations =
        await Recommendations.getComputeOptimizer(serviceWrapper)
      recommendationData.push(...computeOptimizerRecommendations)
    }

    if (
      recommendationService !== AWS_RECOMMENDATIONS_SERVICES.ComputeOptimizer
    ) {
      const rightsizingRecommendations = await Recommendations.getRightsizing(
        serviceWrapper,
        recommendationTarget,
      )
      recommendationData.push(...rightsizingRecommendations)
    }

    return recommendationService === AWS_RECOMMENDATIONS_SERVICES.All
      ? Recommendations.getUniquesWithHighestSavings(recommendationData)
      : recommendationData
  }

  private static async getComputeOptimizer(
    serviceWrapper: ServiceWrapper,
  ): Promise<RecommendationResult[]> {
    const computeOptimizerRecommendations = new ComputeOptimizerRecommendations(
      new ComputeEstimator(),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      serviceWrapper,
    )
    return await computeOptimizerRecommendations.getRecommendations(
      configLoader().AWS.COMPUTE_OPTIMIZER_BUCKET,
    )
  }

  private static async getRightsizing(
    serviceWrapper: ServiceWrapper,
    recommendationTarget: AWS_RECOMMENDATIONS_TARGETS,
  ): Promise<RecommendationResult[]> {
    const rightsizingRecommendations = new RightsizingRecommendations(
      new ComputeEstimator(),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      serviceWrapper,
    )
    return await rightsizingRecommendations.getRecommendations(
      recommendationTarget,
    )
  }

  // Potential Refactor: Skip all Compute Optimizer recommendations that aren't EC2
  private static getUniquesWithHighestSavings(
    recommendationData: RecommendationResult[],
  ): RecommendationResult[] {
    const uniqueRecommendationData: RecommendationResult[] = []
    const mappedResources: { [resourceId: string]: RecommendationResult[] } = {}
    recommendationData.forEach((recommendation) => {
      if (mappedResources[recommendation.resourceId])
        mappedResources[recommendation.resourceId].push(recommendation)
      else mappedResources[recommendation.resourceId] = [recommendation]
    })

    for (const resource in mappedResources) {
      const resourceRecommendations = mappedResources[resource]
      if (resourceRecommendations.length > 1)
        uniqueRecommendationData.push(
          getHighestSavings(resourceRecommendations),
        )
      else uniqueRecommendationData.push(resourceRecommendations[0])
    }
    return uniqueRecommendationData
  }
}

function getHighestSavings(recommendations: RecommendationResult[]) {
  const [recommendationOne, recommendationTwo] = recommendations
  if (recommendationTwo.co2eSavings > recommendationOne.co2eSavings)
    return recommendationTwo
  if (recommendationTwo.co2eSavings === recommendationOne.co2eSavings)
    return getHighestCostSavings(recommendations)
  return recommendations[0]
}

function getHighestCostSavings(recommendations: RecommendationResult[]) {
  const [recommendationOne, recommendationTwo] = recommendations
  return recommendationTwo.costSavings > recommendationOne.costSavings
    ? recommendationTwo
    : recommendationOne
}
