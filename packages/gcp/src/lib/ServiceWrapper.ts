/*
 * © 2021 Thoughtworks, Inc.
 */
import R from 'ramda'
import {
  ProjectsClient,
  protos as googleResource,
} from '@google-cloud/resource-manager'
import { RecommenderClient } from '@google-cloud/recommender'
import Compute, { protos as googleCompute } from '@google-cloud/compute'
import Project = googleResource.google.cloud.resourcemanager.v3.IProject
import { GoogleAuthClient, Logger, wait } from '@cloud-carbon-footprint/common'
import { InstanceData } from '../__tests__/fixtures/googleapis.fixtures'
import {
  ActiveProject,
  RecommenderRecommendations,
} from './RecommendationsTypes'
import Instance = googleCompute.google.cloud.compute.v1.Instance
import MachineType = googleCompute.google.cloud.compute.v1.MachineType
import Disk = googleCompute.google.cloud.compute.v1.Disk
import Image = googleCompute.google.cloud.compute.v1.Image
import Address = googleCompute.google.cloud.compute.v1.Address
import InstancesScopedList = googleCompute.google.cloud.compute.v1.InstancesScopedList
import DisksScopedList = googleCompute.google.cloud.compute.v1.DisksScopedList
import AddressesScopedList = googleCompute.google.cloud.compute.v1.AddressesScopedList

const RETRY_AFTER = 10

type Zone = [
  string,
  InstancesScopedList | DisksScopedList | AddressesScopedList,
]

export default class ServiceWrapper {
  private readonly serviceWrapperLogger: Logger
  private readonly noResultsOnPageMessage = 'NO_RESULTS_ON_PAGE'
  constructor(
    private readonly googleProjectsClient: ProjectsClient,
    private readonly googleAuthClient: GoogleAuthClient,
    private readonly googleComputeClient: typeof Compute,
    private readonly googleRecommenderClient: RecommenderClient,
  ) {
    this.serviceWrapperLogger = new Logger('GCP Service Wrapper')
  }

  async getActiveProjectsAndZones(): Promise<ActiveProject[]> {
    const projects = await this.getProjects()
    const activeProjects = projects.filter(
      (project) => project.state === 'ACTIVE',
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
    const [projects] = await this.googleProjectsClient.searchProjects()
    return projects
  }

  private async getZonesForProject(
    project: Project,
  ): Promise<ActiveProject | []> {
    try {
      const computeEngineRequest = {
        project: project.projectId,
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
        id: project.projectId,
        name: project.displayName,
        zones: R.uniq([
          ...instanceZones,
          ...addressesZones,
          ...diskZones,
          'global',
        ]),
      }
    } catch (e) {
      this.serviceWrapperLogger.warn(
        `Failed to get active zones for project: ${project.projectId}. Error: ${e.message} `,
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
  ): Promise<Instance> {
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
  ): Promise<MachineType> {
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
  ): Promise<Disk> {
    const diskDetailsRequest = {
      project: projectId,
      zone: zone,
      disk: diskId,
      auth: this.googleAuthClient,
    }
    const result = await this.googleComputeClient.disks.get(diskDetailsRequest)
    return result.data
  }

  async getImageDetails(projectId: string, imageId: string): Promise<Image> {
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
  ): Promise<Address> {
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
