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
  COMPUTE_PROCESSOR_TYPES,
  ComputeUsage,
  CloudConstants,
  getPhysicalChips,
  calculateGigabyteHours,
  MemoryUsage,
} from '@cloud-carbon-footprint/core'
import { RecommendationResult } from '@cloud-carbon-footprint/common'
import { ServiceWrapper } from './ServiceWrapper'
import RightsizingRecommendation from './RightsizingRecommendation'
import {
  EC2_INSTANCE_TYPES,
  INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING,
} from './AWSInstanceTypes'
import {
  AWS_CLOUD_CONSTANTS,
  AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '../domain'

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
        const rightsizingRecommendation = new RightsizingRecommendation(
          recommendation,
        )
        const computeProcessors = INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING[
          rightsizingRecommendation.currentInstanceType
        ] || [COMPUTE_PROCESSOR_TYPES.UNKNOWN]

        const computeUsage: ComputeUsage = {
          cpuUtilizationAverage: AWS_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020,
          numberOfvCpus: rightsizingRecommendation.currentInstanceVcpuHours,
          usesAverageCPUConstant: true,
        }

        const powerUsageEffectiveness: number = AWS_CLOUD_CONSTANTS.getPUE(
          rightsizingRecommendation.region,
        )

        const computeConstants: CloudConstants = {
          minWatts: AWS_CLOUD_CONSTANTS.getMinWatts(computeProcessors),
          maxWatts: AWS_CLOUD_CONSTANTS.getMaxWatts(computeProcessors),
          powerUsageEffectiveness: powerUsageEffectiveness,
        }

        const computeFootprint = this.computeEstimator.estimate(
          [computeUsage],
          rightsizingRecommendation.region,
          AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
          computeConstants,
        )[0]

        const [instanceFamily, instanceSize] =
          rightsizingRecommendation.currentInstanceType.split('.')

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
          moment().daysInMonth() * 24,
        )

        const memoryUsage: MemoryUsage = {
          gigabyteHours: gigabyteHoursForMemoryUsage,
        }
        const memoryConstants: CloudConstants = {
          powerUsageEffectiveness: powerUsageEffectiveness,
        }

        const memoryFootprint = this.memoryEstimator.estimate(
          [memoryUsage],
          rightsizingRecommendation.region,
          AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
          memoryConstants,
        )[0]

        return {
          cloudProvider: 'AWS',
          accountId: rightsizingRecommendation.accountId,
          accountName: rightsizingRecommendation.accountId,
          region: rightsizingRecommendation.region,
          recommendationType: rightsizingRecommendation.type,
          recommendationDetail: `${rightsizingRecommendation.type} instance "${rightsizingRecommendation.currentInstanceName}"`,
          kilowattHourSavings:
            computeFootprint.kilowattHours + memoryFootprint.kilowattHours,
          co2eSavings: computeFootprint.co2e + memoryFootprint.co2e,
          costSavings: rightsizingRecommendation.costSavings,
        }
      },
    )
  }
}
