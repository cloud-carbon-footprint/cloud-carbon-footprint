/*
 * © 2021 ThoughtWorks, Inc.
 */

import R from 'ramda'
import { google as recommenderPrototypes } from '@google-cloud/recommender/build/protos/protos'
import IMoney = recommenderPrototypes.type.IMoney
import IRecommendation = recommenderPrototypes.cloud.recommender.v1.IRecommendation
import {
  COMPUTE_PROCESSOR_TYPES,
  ComputeEstimator,
  FootprintEstimate,
  ICloudRecommendationsService,
  StorageEstimator,
  StorageUsage,
} from '@cloud-carbon-footprint/core'
import {
  getHoursInMonth,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'
import {
  GCP_CLOUD_CONSTANTS,
  GCP_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '../domain'
import { INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING } from './MachineTypes'
import { ActiveProject, RECOMMENDATION_TYPES } from './RecommendationsTypes'
import ServiceWrapper from './ServiceWrapper'

export default class Recommendations implements ICloudRecommendationsService {
  readonly RECOMMENDER_IDS: string[] = [
    // 'google.accounts.security.SecurityKeyRecommender',
    // 'google.compute.commitment.UsageCommitmentRecommender',
    // 'google.iam.policy.Recommender',
    // 'google.cloudsql.instance.OutOfDiskRecommender'
    'google.compute.image.IdleResourceRecommender',
    'google.compute.address.IdleResourceRecommender',
    'google.compute.disk.IdleResourceRecommender',
    'google.compute.instance.IdleResourceRecommender',
    'google.compute.instance.MachineTypeRecommender',
    'google.compute.instanceGroupManager.MachineTypeRecommender',
    'google.logging.productSuggestion.ContainerRecommender',
    'google.monitoring.productSuggestion.ComputeRecommender',
  ]

  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly hddStorageEstimator: StorageEstimator,
    private readonly ssdStorageEstimator: StorageEstimator,
    private readonly googleServiceWrapper: ServiceWrapper,
  ) {}

  async getRecommendations(): Promise<RecommendationResult[]> {
    const activeProjectsAndZones =
      await this.googleServiceWrapper.getActiveProjectsAndZones()

    return await this.getRecommendationsForProjects(activeProjectsAndZones)
  }

  private async getRecommendationsForProjects(
    projects: ActiveProject[],
  ): Promise<RecommendationResult[]> {
    return R.flatten(
      await Promise.all(
        projects.map(async (project: ActiveProject) => {
          return await this.getFilteredRecommendations(project)
        }),
      ),
    )
  }

  private async getFilteredRecommendations(
    project: ActiveProject,
  ): Promise<RecommendationResult[]> {
    const recommendationsByIds = await Promise.all(
      project.zones.map(async (zone) => {
        return await this.googleServiceWrapper.getRecommendationsForRecommenderIds(
          project.id,
          zone,
          this.RECOMMENDER_IDS,
        )
      }),
    )
    const nonEmptyRecommendations = recommendationsByIds
      .flat()
      .filter((recommendationId) => recommendationId.recommendations.length > 0)
    if (nonEmptyRecommendations.length > 0) {
      return Promise.all(
        R.flatten(
          nonEmptyRecommendations.map(({ zone, recommendations }) =>
            recommendations.map(async (rec) => {
              const estimatedCO2eSavings = await this.getEstimatedCO2eSavings(
                project.id,
                zone,
                rec,
              )
              return {
                cloudProvider: 'GCP',
                accountId: project.id,
                accountName: project.name,
                region: zone === 'global' ? zone : zone.slice(0, -2),
                recommendationType: rec.recommenderSubtype,
                recommendationDetail: rec.description,
                costSavings: this.getEstimatedCostSavings(
                  rec.primaryImpact.costProjection.cost,
                ),
                co2eSavings: estimatedCO2eSavings.co2e,
                kilowattHourSavings: estimatedCO2eSavings.kilowattHours,
              }
            }),
          ),
        ),
      )
    }
    return []
  }

  private async getEstimatedCO2eSavings(
    projectId: string,
    zone: string,
    recommendation: IRecommendation,
  ): Promise<FootprintEstimate> {
    try {
      switch (recommendation.recommenderSubtype) {
        case RECOMMENDATION_TYPES.STOP_VM:
          const instanceId = recommendation.description.split("'")[1]
          const instanceDetails =
            await this.googleServiceWrapper.getInstanceDetails(
              projectId,
              zone,
              instanceId,
            )
          const machineType = instanceDetails.machineType.split('/').pop()
          const machineTypeDetails =
            await this.googleServiceWrapper.getMachineTypeDetails(
              projectId,
              zone,
              machineType,
            )

          const region = zone.slice(0, -2)
          const computeCO2eEstimatedSavings = this.estimateComputeCO2eSavings(
            machineType.split('-')[0],
            machineTypeDetails.guestCpus,
            region,
          )
          const storageFootprintEstimates = instanceDetails.disks.map(
            (disk) => {
              const storageType =
                this.googleServiceWrapper.getStorageTypeFromDiskName(
                  disk.deviceName,
                )
              return this.estimateStorageCO2eSavings(
                storageType,
                parseFloat(disk.diskSizeGb),
                region,
              )
            },
          )
          const storageKilowattHoursSavings = R.sum(
            storageFootprintEstimates.map((estimate) => estimate.kilowattHours),
          )
          const storageCo2eSavings = R.sum(
            storageFootprintEstimates.map((estimate) => estimate.co2e),
          )

          return {
            co2e: computeCO2eEstimatedSavings.co2e + storageCo2eSavings,
            kilowattHours:
              computeCO2eEstimatedSavings.kilowattHours +
              storageKilowattHoursSavings,
            timestamp: undefined,
          }

        default:
          console.log(
            `Unknown/unsupported Recommender Type: ${recommendation.recommenderSubtype}`,
          )
      }
    } catch (err) {
      console.log(
        `Unable to Estimate C02e Savings for Recommendations: ${recommendation.name}. Returning 0`,
      )
      console.log(`Error: ${err}`)
      return { timestamp: undefined, kilowattHours: 0, co2e: 0 }
    }
  }

  private estimateComputeCO2eSavings(
    machineTypeFamily: string,
    vCpus: number,
    region: string,
  ): FootprintEstimate {
    const vCpuHours = vCpus * getHoursInMonth()

    const computeUsage = {
      cpuUtilizationAverage: GCP_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020,
      numberOfvCpus: vCpuHours,
      usesAverageCPUConstant: true,
    }

    const computeProcessors = INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING[
      machineTypeFamily
    ] || [COMPUTE_PROCESSOR_TYPES.UNKNOWN]

    const computeConstants = {
      minWatts: GCP_CLOUD_CONSTANTS.getMinWatts(computeProcessors),
      maxWatts: GCP_CLOUD_CONSTANTS.getMaxWatts(computeProcessors),
      powerUsageEffectiveness: GCP_CLOUD_CONSTANTS.getPUE(region),
    }

    return this.computeEstimator.estimate(
      [computeUsage],
      region,
      GCP_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
      computeConstants,
    )[0]
  }

  private estimateStorageCO2eSavings(
    storageType: string,
    storageGigabytes: number,
    region: string,
  ): FootprintEstimate {
    const storageUsage: StorageUsage = {
      terabyteHours: getHoursInMonth() * storageGigabytes,
    }
    const storageConstants = {
      powerUsageEffectiveness: GCP_CLOUD_CONSTANTS.getPUE(region),
    }

    const storageEstimator =
      storageType === 'SSD'
        ? this.ssdStorageEstimator
        : this.hddStorageEstimator

    return {
      usesAverageCPUConstant: false,
      ...storageEstimator.estimate(
        [storageUsage],
        region,
        GCP_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
        storageConstants,
      )[0],
    }
  }

  /* Refer to GCP Documentation for explanation of Money object:
   * https://cloud.google.com/recommender/docs/reference/rest/Shared.Types/Money
   */
  private getEstimatedCostSavings(money: IMoney): number {
    return (parseInt(<string>money.units) + money.nanos / 1000000000) * -1
  }
}
