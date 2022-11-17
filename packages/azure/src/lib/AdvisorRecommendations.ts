import {
  AdvisorManagementClient,
  ResourceRecommendationBase,
} from '@azure/arm-advisor'
import {
  calculateGigabyteHours,
  COMPUTE_PROCESSOR_TYPES,
  ComputeEstimator,
  getPhysicalChips,
  ICloudRecommendationsService,
  MemoryEstimator,
} from '@cloud-carbon-footprint/core'
import {
  containsAny,
  Logger,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'
import RightsizingCurrentRecommendation from './RightsizingCurrentRecommendation'
import {
  GPU_VIRTUAL_MACHINE_TYPE_PROCESSOR_MAPPING,
  GPU_VIRTUAL_MACHINE_TYPES,
  INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING,
  VIRTUAL_MACHINE_TYPE_SERIES_MAPPING,
} from './VirtualMachineTypes'
import RightsizingRecommendation from './RightsizingRecommendation'
import RightsizingTargetRecommendation from './RightsizingTargetRecommendation'
import {
  AZURE_CLOUD_CONSTANTS,
  AZURE_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '../domain'

export default class AdvisorRecommendations
  implements ICloudRecommendationsService
{
  private readonly recommendationsLogger: Logger
  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly memoryEstimator: MemoryEstimator,
    private readonly advisorManagementClient: AdvisorManagementClient,
  ) {
    this.recommendationsLogger = new Logger('AzureRecommendations')
  }

  async pageThroughRows(): Promise<ResourceRecommendationBase[]> {
    const recommendationsList = []
    const recommendations = this.advisorManagementClient.recommendations.list({
      filter: `Category eq 'Cost'`,
    })
    for await (const recommendation of recommendations) {
      recommendationsList.push(recommendation)
    }
    return recommendationsList
  }

  async getRecommendations(): Promise<RecommendationResult[]> {
    try {
      const recommendations = await this.pageThroughRows()
      const filteredRecommendations = recommendations
        .flat()
        .filter((recs) =>
          recs.shortDescription.solution.includes('underutilized'),
        )
      const recommendationsResult: RecommendationResult[] = []
      filteredRecommendations.forEach(
        (recommendation: ResourceRecommendationBase) => {
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

          if (
            recommendation.extendedProperties.recommendationType ===
            'Right-size'
          ) {
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

          recommendationsResult.push({
            cloudProvider: 'AZURE',
            accountId: rightsizingCurrentRecommendation.subscriptionId,
            accountName: rightsizingCurrentRecommendation.subscriptionId,
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
        `Failed to grab Azure Advisor recommendations. Reason: ${e}`,
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
      Shutdown: defaultDetail,
      'Right-size': `${defaultDetail} ${modifyDetail}`,
    }
    return recommendationTypes[rightsizingCurrentRecommendation.type]
  }

  private getFootprintEstimates(
    rightsizingRecommendation: RightsizingRecommendation,
  ) {
    const computeFootprint = this.getComputeFootprint(rightsizingRecommendation)
    const memoryFootprint = this.getMemoryFootprint(rightsizingRecommendation)

    return [computeFootprint, memoryFootprint]
  }

  private getComputeFootprint(
    rightsizingRecommendation: RightsizingRecommendation,
  ) {
    const computeUsage = {
      cpuUtilizationAverage: AZURE_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020,
      vCpuHours: rightsizingRecommendation.vCpuHours,
      usesAverageCPUConstant: true,
    }

    const computeConstants = {
      minWatts: AZURE_CLOUD_CONSTANTS.getMinWatts(
        this.getComputeProcessors(rightsizingRecommendation),
      ),
      maxWatts: AZURE_CLOUD_CONSTANTS.getMaxWatts(
        this.getComputeProcessors(rightsizingRecommendation),
      ),
      powerUsageEffectiveness: AZURE_CLOUD_CONSTANTS.getPUE(
        rightsizingRecommendation.region,
      ),
    }

    const computeEstimate = this.computeEstimator.estimate(
      [computeUsage],
      rightsizingRecommendation.region,
      AZURE_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
      computeConstants,
    )[0]

    if (this.isGpuInstance(rightsizingRecommendation.instanceType)) {
      const gpuComputeUsage = {
        cpuUtilizationAverage: AZURE_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020,
        vCpuHours:
          GPU_VIRTUAL_MACHINE_TYPES[rightsizingRecommendation.instanceType] *
            rightsizingRecommendation.usageAmount || 0, // TODO - explain object key
        usesAverageCPUConstant: true,
      }

      const gpuConstants = {
        minWatts: AZURE_CLOUD_CONSTANTS.getMinWatts(
          this.getGPUComputeProcessors(rightsizingRecommendation),
        ),
        maxWatts: AZURE_CLOUD_CONSTANTS.getMaxWatts(
          this.getGPUComputeProcessors(rightsizingRecommendation),
        ),
        powerUsageEffectiveness: AZURE_CLOUD_CONSTANTS.getPUE(
          rightsizingRecommendation.region,
        ),
      }

      const gpuComputeEstimate = this.computeEstimator.estimate(
        [gpuComputeUsage],
        rightsizingRecommendation.region,
        AZURE_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
        gpuConstants,
      )[0]

      computeEstimate.kilowattHours += gpuComputeEstimate.kilowattHours
      computeEstimate.co2e += gpuComputeEstimate.co2e
      return computeEstimate
    }

    return computeEstimate
  }

  private isGpuInstance(instanceType: string): boolean {
    return containsAny(Object.keys(GPU_VIRTUAL_MACHINE_TYPES), instanceType)
  }

  private getMemoryFootprint(
    rightsizingRecommendation: RightsizingRecommendation,
  ) {
    const memoryUsage = {
      gigabyteHours: this.getGigabyteHoursFromInstanceTypeAndProcessors(
        rightsizingRecommendation,
      ),
    }

    const memoryConstants = {
      powerUsageEffectiveness: AZURE_CLOUD_CONSTANTS.getPUE(
        rightsizingRecommendation.region,
      ),
    }

    return this.memoryEstimator.estimate(
      [memoryUsage],
      rightsizingRecommendation.region,
      AZURE_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
      memoryConstants,
    )[0]
  }

  public getComputeProcessors(
    rightsizingRecommendation: RightsizingRecommendation,
  ): string[] {
    return (
      INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING[
        rightsizingRecommendation.instanceType
      ] || [COMPUTE_PROCESSOR_TYPES.UNKNOWN]
    )
  }

  public getGPUComputeProcessors(
    rightsizingRecommendation: RightsizingRecommendation,
  ): string[] {
    return (
      GPU_VIRTUAL_MACHINE_TYPE_PROCESSOR_MAPPING[
        rightsizingRecommendation.instanceType
      ] || [COMPUTE_PROCESSOR_TYPES.UNKNOWN]
    )
  }

  public getGigabyteHoursFromInstanceTypeAndProcessors(
    rightsizingRecommendation: RightsizingRecommendation,
  ): number {
    const seriesName = rightsizingRecommendation.getSeriesFromInstanceType()
    const instanceTypeMemory =
      VIRTUAL_MACHINE_TYPE_SERIES_MAPPING[seriesName]?.[
        rightsizingRecommendation.instanceType
      ]?.[1]

    const { isValidInstanceType } = this.checkInstanceTypes(seriesName)
    if (!isValidInstanceType || !instanceTypeMemory) return 0

    const processors = this.getComputeProcessors(rightsizingRecommendation)
    const processorMemory = AZURE_CLOUD_CONSTANTS.getMemory(processors)

    const seriesInstanceTypes: number[][] = Object.values(
      VIRTUAL_MACHINE_TYPE_SERIES_MAPPING[seriesName],
    )

    const [largestInstanceTypevCpus, largestInstanceTypeMemory] =
      seriesInstanceTypes[seriesInstanceTypes.length - 1]

    return calculateGigabyteHours(
      getPhysicalChips(largestInstanceTypevCpus),
      largestInstanceTypeMemory,
      processorMemory,
      instanceTypeMemory,
      rightsizingRecommendation.usageAmount,
    )
  }

  private checkInstanceTypes(seriesName: string) {
    const isValidInstanceType = Object.keys(
      VIRTUAL_MACHINE_TYPE_SERIES_MAPPING,
    ).includes(seriesName)
    return { isValidInstanceType }
  }
}
