import { ResourceRecommendationBase } from '@azure/arm-advisor'
import { getHoursInMonth } from '@cloud-carbon-footprint/common'
import RightsizingRecommendation from './RightsizingRecommendation'

export default class RightsizingCurrentRecommendation extends RightsizingRecommendation {
  constructor(rightsizingRecommendationData: ResourceRecommendationBase) {
    const recommendationDetails = getRecommendationDetails(
      rightsizingRecommendationData,
    )
    super(recommendationDetails)

    this.region = this.getMappedRegion()
    this.instanceType = this.parseInstanceType()
    this.usageAmount = getHoursInMonth()
    this.vCpuHours = this.getVCpuHours()
  }
}

const getRecommendationDetails = (
  rightsizingRecommendationData: ResourceRecommendationBase,
) => {
  const recommendationDetails: Partial<RightsizingRecommendation> = {
    subscriptionId:
      rightsizingRecommendationData.extendedProperties.subscriptionId,
    type: rightsizingRecommendationData.extendedProperties.recommendationType,
    region: rightsizingRecommendationData.extendedProperties.regionId,
    instanceName: rightsizingRecommendationData.extendedProperties.roleName,
    instanceType: rightsizingRecommendationData.extendedProperties.currentSku,
    resourceId: rightsizingRecommendationData.resourceMetadata.resourceId,
    costSavings:
      parseFloat(
        rightsizingRecommendationData.extendedProperties.savingsAmount,
      ) || 0,
  }
  return recommendationDetails
}
