/*
 * © 2021 Thoughtworks, Inc.
 */
import R from 'ramda'
import { Project, Resource } from '@google-cloud/resource-manager'
import { APIEndpoint } from 'googleapis-common'
import { RecommenderClient } from '@google-cloud/recommender'
import { compute_v1 } from 'googleapis'
import Schema$Instance = compute_v1.Schema$Instance
import Schema$MachineType = compute_v1.Schema$MachineType
import Schema$Disk = compute_v1.Schema$Disk
import Schema$Image = compute_v1.Schema$Image
import Schema$Address = compute_v1.Schema$Address
import Schema$InstancesScopedList = compute_v1.Schema$InstancesScopedList
import Schema$DisksScopedList = compute_v1.Schema$DisksScopedList
import Schema$AddressesScopedList = compute_v1.Schema$AddressesScopedList
import { GoogleAuthClient, Logger, wait } from '@cloud-carbon-footprint/common'
import { InstanceData } from '../__tests__/fixtures/googleapis.fixtures'
import {
  ActiveProject,
  RecommenderRecommendations,
} from './RecommendationsTypes'

const RETRY_AFTER = 10

type Zone = [
  string,
  (
    | Schema$InstancesScopedList
    | Schema$DisksScopedList
    | Schema$AddressesScopedList
  ),
]

export default class ServiceWrapper {
  private readonly serviceWrapperLogger: Logger
  private readonly noResultsOnPageMessage = 'NO_RESULTS_ON_PAGE'
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

  private extractZones(items: InstanceData): string[] {
    if (!items) return []
    return Object.entries(items)
      .filter((zone: Zone) => {
        return zone[1].warning?.code !== this.noResultsOnPageMessage
      })
      .map((zone) => zone[0].replace('zones/', '').replace('regions/', ''))
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
    instanceId: string,
    zone: string,
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
    machineType: string,
    zone: string,
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
    return diskName.includes('ssd') ? 'SSD' : 'HDD'
  }

  async getDiskDetails(
    projectId: string,
    diskId: string,
    zone: string,
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

  async getAddressDetails(
    projectId: string,
    addressId: string,
    zone: string,
  ): Promise<Schema$Address> {
    const AddressDetailsRequest = {
      project: projectId,
      region: zone,
      address: addressId,
      auth: this.googleAuthClient,
    }
    const result = await this.googleComputeClient.addresses.get(
      AddressDetailsRequest,
    )
    return result.data
  }
}
