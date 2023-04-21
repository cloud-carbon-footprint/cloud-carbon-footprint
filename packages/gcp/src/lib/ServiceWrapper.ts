/*
 * © 2021 Thoughtworks, Inc.
 */
import R from 'ramda'
import {
  ProjectsClient,
  protos as googleResource,
} from '@google-cloud/resource-manager'
import { RecommenderClient } from '@google-cloud/recommender'
import {
  protos as googleCompute,
  InstancesClient,
  DisksClient,
  AddressesClient,
  ImagesClient,
  MachineTypesClient,
} from '@google-cloud/compute'
import { GoogleAuthClient, Logger, wait } from '@cloud-carbon-footprint/common'
import {
  ActiveProject,
  RecommenderRecommendations,
} from './RecommendationsTypes'
// Interfaces
import Project = googleResource.google.cloud.resourcemanager.v3.IProject
import Instance = googleCompute.google.cloud.compute.v1.IInstance
import MachineType = googleCompute.google.cloud.compute.v1.IMachineType
import Disk = googleCompute.google.cloud.compute.v1.IDisk
import Image = googleCompute.google.cloud.compute.v1.IImage
import Address = googleCompute.google.cloud.compute.v1.IAddress
import { IterableScopedList } from './ServiceWrapperTypes'

const RETRY_AFTER = 10

export default class ServiceWrapper {
  private readonly serviceWrapperLogger: Logger
  private readonly noResultsOnPageMessage = 'NO_RESULTS_ON_PAGE'
  constructor(
    private readonly projectsClient: ProjectsClient,
    private readonly authClient: GoogleAuthClient,
    private readonly instancesClient: InstancesClient,
    private readonly disksClient: DisksClient,
    private readonly addressesClient: AddressesClient,
    private readonly imagesClient: ImagesClient,
    private readonly machineTypesClient: MachineTypesClient,
    private readonly recommenderClient: RecommenderClient,
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
    const [projects] = await this.projectsClient.searchProjects()
    return projects
  }

  private async getZonesForProject(
    project: Project,
  ): Promise<ActiveProject | []> {
    try {
      const computeEngineRequest = {
        project: project.projectId,
        auth: this.authClient,
      }
      const instancesResult = await this.instancesClient.aggregatedListAsync(
        computeEngineRequest,
      )
      const disksResult = await this.disksClient.aggregatedListAsync(
        computeEngineRequest,
      )
      const addressesResult = await this.addressesClient.aggregatedListAsync(
        computeEngineRequest,
      )

      const instanceZones = await this.extractZones(instancesResult)
      const diskZones = await this.extractZones(disksResult)
      const addressesZones = await this.extractZones(addressesResult)

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

  private async extractZones(results: IterableScopedList): Promise<string[]> {
    const items = []
    for await (const [zone, result] of results) {
      if (result.warning?.code !== this.noResultsOnPageMessage) {
        const formattedZone = zone.replace('zones/', '').replace('regions/', '')
        items.push(formattedZone)
      }
    }
    return items
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
            await this.recommenderClient.listRecommendations({
              parent: this.recommenderClient.projectLocationRecommenderPath(
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
      auth: this.authClient,
    }
    const [instanceDetails] = await this.instancesClient.get(
      computeEngineRequest,
    )
    return instanceDetails
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
      auth: this.authClient,
    }
    const [machineTypeDetails] = await this.machineTypesClient.get(
      machineTypeRequest,
    )
    return machineTypeDetails
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
      auth: this.authClient,
    }
    const [diskDetails] = await this.disksClient.get(diskDetailsRequest)
    return diskDetails
  }

  async getImageDetails(projectId: string, imageId: string): Promise<Image> {
    const imageDetailsRequest = {
      project: projectId,
      image: imageId,
      auth: this.authClient,
    }
    const [imageDetails] = await this.imagesClient.get(imageDetailsRequest)
    return imageDetails
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
      auth: this.authClient,
    }
    const [addressDetails] = await this.addressesClient.get(
      AddressDetailsRequest,
    )
    return addressDetails
  }
}
