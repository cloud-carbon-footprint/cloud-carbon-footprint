/*
 * © 2021 ThoughtWorks, Inc.
 */

import {
  ComputeEstimator,
  COMPUTE_PROCESSOR_TYPES,
  FootprintEstimate,
  ICloudRecommendationsService,
  StorageEstimator,
} from '@cloud-carbon-footprint/core'
import { Project, Resource } from '@google-cloud/resource-manager'
import {
  getHoursInMonth,
  RecommendationResult,
  wait,
} from '@cloud-carbon-footprint/common'
import R from 'ramda'
import { google as recommenderPrototypes } from '@google-cloud/recommender/build/protos/protos'
import IMoney = recommenderPrototypes.type.IMoney
import IRecommendation = recommenderPrototypes.cloud.recommender.v1.IRecommendation
import { compute_v1 } from 'googleapis'
import Schema$Instance = compute_v1.Schema$Instance
import Schema$MachineType = compute_v1.Schema$MachineType
import {
  GCP_CLOUD_CONSTANTS,
  GCP_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '../domain'
import { INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING } from './MachineTypes'

type ActiveProject = {
  id: string
  name: string
  zones: string[]
}

type RecommenderRecommendations = {
  id: string
  zone: string
  recommendations: IRecommendation[]
}

enum RECOMMENDATION_TYPES {
  STOP_VM = 'STOP_VM',
  SNAPSHOT_AND_DELETE_DISK = 'SNAPSHOT_AND_DELETE_DISK',
  CHANGE_MACHINE_TYPE = 'CHANGE_MACHINE_TYPE',
  DELETE_DISK = 'DELETE_DISK',
  DELETE_ADDRESS = 'DELETE_ADDRESS',
  DELETE_IMAGE = 'DELETE_IMAGE',
}

const RECOMMENDER_IDS: string[] = [
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

const RETRY_AFTER = 10
export default class Recommendations implements ICloudRecommendationsService {
  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly hddStorageEstimator: StorageEstimator,
    private readonly ssdStorageEstimator: StorageEstimator,
    private readonly googleAuthClient: any,
    private readonly googleComputeClient: any,
    private readonly googleRecommenderClient: any,
  ) {}

  async getRecommendations(): Promise<RecommendationResult[]> {
    const resource = new Resource()

    const [projects] = await resource.getProjects()

    const activeProjectsAndZones = await this.getActiveProjectsAndZones(
      projects,
    )

    const projectRecommendations = await this.getRecommendationsForProjects(
      activeProjectsAndZones,
    )

    return projectRecommendations
  }

  private async getActiveProjectsAndZones(
    projects: Project[],
  ): Promise<ActiveProject[]> {
    const activeProjects = projects.filter(
      (project) => project.metadata.lifecycleState === 'ACTIVE',
    )
    const activeProjectsAndZones = []
    const projectChunks = R.splitEvery(150, activeProjects)
    for (const projectChunk of projectChunks) {
      const projectZonesForChunk = await Promise.all(
        projectChunk.map(async (project) => {
          return await this.getZonesForProject(project)
        }),
      )
      activeProjectsAndZones.push(projectZonesForChunk)
    }
    return R.flatten(activeProjectsAndZones)
  }

  private async getZonesForProject(
    project: Project,
  ): Promise<ActiveProject | []> {
    try {
      const computeEngineRequest = {
        project: project.id,
        auth: this.googleAuthClient,
      }
      const instancesResult =
        await this.googleComputeClient.instances.aggregatedList(
          computeEngineRequest,
        )
      const disksResult = await this.googleComputeClient.disks.aggregatedList(
        computeEngineRequest,
      )
      const addressesResult =
        await this.googleComputeClient.addresses.aggregatedList(
          computeEngineRequest,
        )

      const instanceZones = this.extractZones(instancesResult.data.items)
      const diskZones = this.extractZones(disksResult.data.items)
      const addressesZones = this.extractZones(addressesResult.data.items)

      return {
        id: project.id,
        name: project.metadata.name,
        zones: R.uniq([
          ...instanceZones,
          ...addressesZones,
          ...diskZones,
          'global',
        ]),
      }
    } catch (e) {
      console.log(e.message)
      return []
    }
  }

  private extractZones(items: any) {
    if (!items) return []
    try {
      return Object.entries(items)
        .filter((zone: any) => {
          return zone[1]?.warning?.code !== 'NO_RESULTS_ON_PAGE'
        })
        .map((zone) => zone[0].replace('zones/', '').replace('regions/', ''))
    } catch (e) {
      console.log(e.message)
      return []
    }
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
        return await this.getRecommendationsByRecommenderIds(project, zone)
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

  private async getRecommendationsByRecommenderIds(
    project: ActiveProject,
    zone: string,
  ): Promise<RecommenderRecommendations[]> {
    const recommendationByRecommenderIds = []
    for (const recommenderId of RECOMMENDER_IDS) {
      let inProcess = true
      while (inProcess) {
        try {
          const [recommendations] =
            await this.googleRecommenderClient.listRecommendations({
              parent:
                this.googleRecommenderClient.projectLocationRecommenderPath(
                  project.id,
                  zone,
                  recommenderId,
                ),
            })
          inProcess = false
          recommendationByRecommenderIds.push({
            id: recommenderId,
            zone: zone,
            recommendations,
          })
        } catch (err) {
          if (err.details?.includes('Quota exceeded')) {
            console.log(
              `Rate limit hit. Retrying after ${RETRY_AFTER} seconds.`,
            )
            await wait(RETRY_AFTER * 1000)
          }
        }
      }
    }
    return recommendationByRecommenderIds
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
