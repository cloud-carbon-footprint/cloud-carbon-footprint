/*
 * © 2021 ThoughtWorks, Inc.
 */

import R from 'ramda'
import { google as recommenderPrototypes } from '@google-cloud/recommender/build/protos/protos'
import { compute_v1 } from 'googleapis'
import IMoney = recommenderPrototypes.type.IMoney
import IRecommendation = recommenderPrototypes.cloud.recommender.v1.IRecommendation
import Schema$Instance = compute_v1.Schema$Instance
import Schema$MachineType = compute_v1.Schema$MachineType
import {
  COMPUTE_PROCESSOR_TYPES,
  ComputeEstimator,
  FootprintEstimate,
  ICloudRecommendationsService,
  StorageEstimator,
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
  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly hddStorageEstimator: StorageEstimator,
    private readonly ssdStorageEstimator: StorageEstimator,
    private readonly googleAuthClient: any,
    private readonly googleComputeClient: any,
    private readonly googleRecommenderClient: any,
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
        return await this.googleServiceWrapper.getRecommendationsByRecommenderIds(
          project,
          zone,
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
          const instanceDetails = await this.getInstanceDetails(
            projectId,
            zone,
            instanceId,
          )
          const machineType = instanceDetails.machineType.split('/').pop()
          const machineTypeDetails = await this.getMachineTypeDetails(
            projectId,
            zone,
            machineType,
          )
          const computeCO2eEstimatedSavings = this.estimateComputeCO2eSavings(
            machineType.split('-')[0],
            machineTypeDetails.guestCpus,
            zone.slice(0, -2),
          )
          return computeCO2eEstimatedSavings
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

  private async getInstanceDetails(
    projectId: string,
    zone: string,
    instanceId: string,
  ): Promise<Schema$Instance> {
    const computeEngineRequest = {
      project: projectId,
      zone: zone,
      instance: instanceId,
      auth: this.googleAuthClient,
    }
    const result = await this.googleComputeClient.instances.get(
      computeEngineRequest,
    )
    return result.data
  }

  private async getMachineTypeDetails(
    projectId: string,
    zone: string,
    machineType: string,
  ): Promise<Schema$MachineType> {
    const machineTypeRequest = {
      project: projectId,
      zone: zone,
      machineType: machineType,
      auth: this.googleAuthClient,
    }
    const result = await this.googleComputeClient.machineTypes.get(
      machineTypeRequest,
    )
    return result.data
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

  /* Refer to GCP Documentation for explanation of Money object:
   * https://cloud.google.com/recommender/docs/reference/rest/Shared.Types/Money
   */
  private getEstimatedCostSavings(money: IMoney): number {
    return (parseInt(<string>money.units) + money.nanos / 1000000000) * -1
  }
}
