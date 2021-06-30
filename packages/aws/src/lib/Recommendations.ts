/*
 * © 2021 ThoughtWorks, Inc.
 */

import moment from 'moment'

import {
  GetRightsizingRecommendationRequest,
  RightsizingRecommendationList,
  RightsizingRecommendation as AwsRightsizingRecommendation,
} from 'aws-sdk/clients/costexplorer'

import {
  ICloudRecommendationsService,
  ComputeEstimator,
  MemoryEstimator,
  CloudConstants,
  getPhysicalChips,
  calculateGigabyteHours,
  MemoryUsage,
  COMPUTE_PROCESSOR_TYPES,
} from '@cloud-carbon-footprint/core'
import { RecommendationResult } from '@cloud-carbon-footprint/common'
import { ServiceWrapper } from './ServiceWrapper'
import {
  EC2_INSTANCE_TYPES,
  INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING,
} from './AWSInstanceTypes'
import {
  AWS_CLOUD_CONSTANTS,
  AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '../domain'
import AWSComputeEstimatesBuilder from './AWSComputeEstimatesBuilder'
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

    return rightsizingRecommendations.map(
      (recommendation: AwsRightsizingRecommendation) => {
        const rightsizingCurrentRecommendation =
          new RightsizingCurrentRecommendation(recommendation)

        const currentComputeFootprint = new AWSComputeEstimatesBuilder(
          rightsizingCurrentRecommendation,
          this.computeEstimator,
        ).computeFootprint

        let kilowattHourSavings = currentComputeFootprint.kilowattHours
        let co2eSavings = currentComputeFootprint.co2e
        let costSavings = rightsizingCurrentRecommendation.costSavings

        if (recommendation.RightsizingType === 'Modify') {
          this.getTargetInstance(recommendation)
          const rightsizingTargetRecommendation =
            new RightsizingTargetRecommendation(recommendation)

          const targetComputeFootprint = new AWSComputeEstimatesBuilder(
            rightsizingTargetRecommendation,
            this.computeEstimator,
          ).computeFootprint

          kilowattHourSavings -= targetComputeFootprint.kilowattHours
          co2eSavings -= targetComputeFootprint.co2e
          costSavings = rightsizingTargetRecommendation.costSavings
        }

        const computeProcessors = INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING[
          rightsizingCurrentRecommendation.instanceType
        ] || [COMPUTE_PROCESSOR_TYPES.UNKNOWN]

        const powerUsageEffectiveness: number = AWS_CLOUD_CONSTANTS.getPUE(
          rightsizingCurrentRecommendation.region,
        )

        const [instanceFamily, instanceSize] =
          rightsizingCurrentRecommendation.instanceType.split('.')

        const processorMemoryGigabytesPerPhysicalChip =
          AWS_CLOUD_CONSTANTS.getMemory(computeProcessors)
        const instanceTypeMemory =
          EC2_INSTANCE_TYPES[instanceFamily]?.[instanceSize]?.[1]

        const familyInstanceTypes: number[][] = Object.values(
          EC2_INSTANCE_TYPES[instanceFamily],
        )

        const [largestInstanceTypevCpus, largestInstanceTypeMemory] =
          familyInstanceTypes[familyInstanceTypes.length - 1]

        // there are special cases for instance families m5zn and z1d where they are always 2
        const physicalChips = ['m5zn', 'z1d'].includes(instanceFamily)
          ? 2
          : getPhysicalChips(largestInstanceTypevCpus)

        const gigabyteHoursForMemoryUsage = calculateGigabyteHours(
          physicalChips,
          largestInstanceTypeMemory,
          processorMemoryGigabytesPerPhysicalChip,
          instanceTypeMemory,
          moment().utc().daysInMonth() * 24,
        )

        const memoryUsage: MemoryUsage = {
          gigabyteHours: gigabyteHoursForMemoryUsage,
        }
        const memoryConstants: CloudConstants = {
          powerUsageEffectiveness: powerUsageEffectiveness,
        }

        const memoryFootprint = this.memoryEstimator.estimate(
          [memoryUsage],
          rightsizingCurrentRecommendation.region,
          AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
          memoryConstants,
        )[0]

        if (gigabyteHoursForMemoryUsage) {
          kilowattHourSavings =
            currentComputeFootprint.kilowattHours +
            memoryFootprint.kilowattHours
          co2eSavings = currentComputeFootprint.co2e + memoryFootprint.co2e
        }

        return {
          cloudProvider: 'AWS',
          accountId: rightsizingCurrentRecommendation.accountId,
          accountName: rightsizingCurrentRecommendation.accountId,
          region: rightsizingCurrentRecommendation.region,
          recommendationType: rightsizingCurrentRecommendation.type,
          recommendationDetail: `${rightsizingCurrentRecommendation.type} instance "${rightsizingCurrentRecommendation.instanceName}"`,
          kilowattHourSavings,
          co2eSavings,
          costSavings,
        }
      },
    )
  }

  private getTargetInstance(
    rightsizingRecommendationData: AwsRightsizingRecommendation,
  ): void {
    let targetInstance =
      rightsizingRecommendationData.ModifyRecommendationDetail
        ?.TargetInstances[0]
    let savings = 0
    rightsizingRecommendationData.ModifyRecommendationDetail?.TargetInstances.map(
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
