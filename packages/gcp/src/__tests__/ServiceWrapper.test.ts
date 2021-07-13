/*
 * © 2021 ThoughtWorks, Inc.
 */

import { Resource } from '@google-cloud/resource-manager'
import { mockedProjects } from './fixtures/resourceManager.fixtures'
import ServiceWrapper from '../lib/ServiceWrapper'

jest.mock('@google-cloud/resource-manager', () => ({
  Resource: jest.fn().mockImplementation(() => ({
    getProjects: jest.fn().mockResolvedValue(mockedProjects),
  })),
}))

describe('GCP Service Wrapper', () => {
  it('gets projects', async () => {
    const serviceWrapper = new ServiceWrapper(new Resource())

    const projects = await serviceWrapper.getProjects()

    expect(projects.length).toEqual(1)
    expect(projects[0].id).toEqual('project')
  })
})
