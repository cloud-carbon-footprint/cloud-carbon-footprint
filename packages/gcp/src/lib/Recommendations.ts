/*
 * © 2021 ThoughtWorks, Inc.
 */

import {
  ComputeEstimator,
  ICloudRecommendationsService,
  StorageEstimator,
} from '@cloud-carbon-footprint/core'
import { Project, Resource } from '@google-cloud/resource-manager'
import { RecommendationResult } from '@cloud-carbon-footprint/common'
import R from 'ramda'
import { google } from 'googleapis'

const compute = google.compute('v1')

type ActiveProject = {
  id: string
  name: string
  zones: string[]
}

export default class Recommendations implements ICloudRecommendationsService {
  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly hddStorageEstimator: StorageEstimator,
    private readonly ssdStorageEstimator: StorageEstimator,
    private readonly googleAuthClient: any,
  ) {}

  async getRecommendations(): Promise<RecommendationResult[]> {
    const resource = new Resource()

    const [projects] = await resource.getProjects()
    // console.log(projects[0])

    const activeProjectsAndZones = await this.getActiveProjectsAndZones(
      projects,
    )
    console.log(activeProjectsAndZones)
    return []
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
      const instancesResult = await compute.instances.aggregatedList(
        computeEngineRequest,
      )
      const disksResult = await compute.disks.aggregatedList(
        computeEngineRequest,
      )
      const addressesResult = await compute.addresses.aggregatedList(
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
}
