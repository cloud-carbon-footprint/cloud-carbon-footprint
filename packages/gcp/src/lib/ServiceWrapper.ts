/*
 * © 2021 ThoughtWorks, Inc.
 */
import R from 'ramda'
import { Project, Resource } from '@google-cloud/resource-manager'
import { Logger, wait } from '@cloud-carbon-footprint/common'
import {
  ActiveProject,
  RecommenderRecommendations,
} from './RecommendationsTypes'
import { compute_v1 } from 'googleapis'
import Schema$Instance = compute_v1.Schema$Instance
import Schema$MachineType = compute_v1.Schema$MachineType
import Schema$Disk = compute_v1.Schema$Disk
import Schema$Image = compute_v1.Schema$Image
import { APIEndpoint } from 'googleapis-common'
import { RecommenderClient } from '@google-cloud/recommender'
import {
  Compute,
  JWT,
  UserRefreshClient,
  BaseExternalAccountClient,
} from 'google-auth-library'

const RETRY_AFTER = 10

//TODO: move this to the common package to be used by multiple packages
export type GoogleAuthClient =
  | Compute
  | JWT
  | UserRefreshClient
  | BaseExternalAccountClient

export default class ServiceWrapper {
  private readonly serviceWrapperLogger: Logger
  constructor(
    private readonly resourceManagerClient: Resource,
    private readonly googleAuthClient: GoogleAuthClient,
    private readonly googleComputeClient: APIEndpoint,
    private readonly googleRecommenderClient: RecommenderClient,
  ) {
    this.serviceWrapperLogger = new Logger('GCP Service Wrapper')
  }

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
      this.serviceWrapperLogger.warn(
        `Failed to get active zones for project: ${project.id}. Error: ${e.message} `,
      )
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
      return []
    }
  }

  async getRecommendationsForRecommenderIds(
    projectId: string,
    zone: string,
    recommenderIds: string[],
  ): Promise<RecommenderRecommendations[]> {
    const recommendationByRecommenderIds = []
    for (const recommenderId of recommenderIds) {
      let inProcess = true
      while (inProcess) {
        try {
          const [recommendations] =
            await this.googleRecommenderClient.listRecommendations({
              parent:
                this.googleRecommenderClient.projectLocationRecommenderPath(
                  projectId,
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
            this.serviceWrapperLogger.warn(
              `GCP Recommendations API quota exceeded. Retrying after ${RETRY_AFTER} seconds.`,
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

  getStorageTypeFromDiskName(diskName: string): string {
    // TODO: Need to validate whether this is always true
    return diskName.includes('ssd') ? 'SSD' : 'HDD'
  }

  async getDiskDetails(
    projectId: string,
    zone: string,
    diskId: string,
  ): Promise<Schema$Disk> {
    const diskDetailsRequest = {
      project: projectId,
      zone: zone,
      disk: diskId,
      auth: this.googleAuthClient,
    }
    const result = await this.googleComputeClient.disks.get(diskDetailsRequest)
    return result.data
  }

  async getImageDetails(
    projectId: string,
    imageId: string,
  ): Promise<Schema$Image> {
    const ImageDetailsRequest = {
      project: projectId,
      image: imageId,
      auth: this.googleAuthClient,
    }
    const result = await this.googleComputeClient.images.get(
      ImageDetailsRequest,
    )
    return result.data
  }
}
