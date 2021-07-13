/*
 * © 2021 ThoughtWorks, Inc.
 */
import { Project, Resource } from '@google-cloud/resource-manager'

export default class ServiceWrapper {
  constructor(private readonly resourceManagerClient: Resource) {}

  async getProjects(): Promise<Project[]> {
    const [projects] = await this.resourceManagerClient.getProjects()
    return projects
  }
}
