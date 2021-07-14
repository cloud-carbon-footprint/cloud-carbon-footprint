/*
 * © 2021 ThoughtWorks, Inc.
 */
import R from 'ramda'
import { Project, Resource } from '@google-cloud/resource-manager'
import { wait } from '@cloud-carbon-footprint/common'
import {
  ActiveProject,
  RecommenderRecommendations,
} from './RecommendationsTypes'
import { compute_v1 } from 'googleapis'
import Schema$Instance = compute_v1.Schema$Instance
import Schema$MachineType = compute_v1.Schema$MachineType

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

export default class ServiceWrapper {
  constructor(
    private readonly resourceManagerClient: Resource,
    private readonly googleAuthClient: any,
    private readonly googleComputeClient: any,
    private readonly googleRecommenderClient: any,
  ) {}

  async getActiveProjectsAndZones(): Promise<ActiveProject[]> {
    const projects = await this.getProjects()
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

  private async getProjects(): Promise<Project[]> {
    const [projects] = await this.resourceManagerClient.getProjects()
    return projects
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

  async getRecommendationsByRecommenderIds(
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

  async getInstanceDetails(
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

  async getMachineTypeDetails(
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
}
