/*
 * © 2022 Thoughtworks, Inc.
 */

import fs from 'fs'
import getConfig from '../Config'

describe('Config', () => {
  it('get AWS accounts', () => {
    const id = 'b47m4n'
    const name = 'Bruce Wayne'
    process.env.AWS_ACCOUNTS = `[{"id": "${id}", "name": "${name}"}]`
    const config = getConfig()
    expect(config.AWS.accounts[0].id).toBe(id)
    expect(config.AWS.accounts[0].name).toBe(name)
    // Avoid side effects
    delete process.env.AWS_ACCOUNTS
  })

  it('get GCP projects', () => {
    const id = 'id'
    const name = 'project'
    process.env.GCP_PROJECTS = `[{"id": "${id}", "name": "${name}"}]`
    const config = getConfig()
    expect(config.GCP.projects[0].id).toBe(id)
    expect(config.GCP.projects[0].name).toBe(name)
    // Avoid side effects
    delete process.env.GCP_PROJECTS
  })

  it('get environment variable from `process.env`', () => {
    const fsSpy = jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw new Error()
    })
    const billingId = 'ezb1'
    process.env.AWS_BILLING_ACCOUNT_ID = billingId
    const config = getConfig()
    expect(fsSpy).toBeCalled()
    expect(config.AWS.BILLING_ACCOUNT_ID).toBe(billingId)
    // Avoid side effects
    delete process.env.AWS_BILLING_ACCOUNT_ID
    jest.clearAllMocks()
  })
})
