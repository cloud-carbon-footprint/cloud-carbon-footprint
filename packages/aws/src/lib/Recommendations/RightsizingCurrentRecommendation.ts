/*
 * © 2021 ThoughtWorks, Inc.
 */

import moment from 'moment'
import { RightsizingRecommendation as AwsRightsizingRecommendation } from 'aws-sdk/clients/costexplorer'
import RightsizingRecommendation from './RightsizingRecommendation'

export default class RightsizingCurrentRecommendation extends RightsizingRecommendation {
  constructor(rightsizingRecommendationData: AwsRightsizingRecommendation) {
    super(rightsizingRecommendationData)

    this.accountId = rightsizingRecommendationData.AccountId
    this.type = rightsizingRecommendationData.RightsizingType
    this.region = this.getMappedRegion(
      rightsizingRecommendationData.CurrentInstance.ResourceDetails
        .EC2ResourceDetails.Region,
    )
    this.instanceName =
      rightsizingRecommendationData.CurrentInstance.InstanceName
    this.instanceType =
      rightsizingRecommendationData.CurrentInstance.ResourceDetails.EC2ResourceDetails.InstanceType
    this.vCpuHours = this.getVCpuHours(
      rightsizingRecommendationData.CurrentInstance.ResourceDetails
        .EC2ResourceDetails,
    )
    this.costSavings = parseFloat(
      rightsizingRecommendationData.TerminateRecommendationDetail
        ?.EstimatedMonthlySavings || '0',
    )
    this.usageAmount = moment().utc().daysInMonth() * 24
  }
}
