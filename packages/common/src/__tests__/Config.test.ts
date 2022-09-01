/*
 * © 2022 Thoughtworks, Inc.
 */

import fs from 'fs'
import getConfig from '../Config'

describe('Config', () => {
  const withEnvironment = (name: string, value: string, test: () => void) => {
    const existingValue = process.env[name]
    process.env[name] = value

    try {
      test()
    } finally {
      if (existingValue === undefined) {
        delete process.env[name]
      } else {
        process.env[name] = existingValue
      }
    }
  }

  it('get AWS accounts', () => {
    const id = 'b47m4n'
    const name = 'Bruce Wayne'

    withEnvironment(
      'AWS_ACCOUNTS',
      `[{"id": "${id}", "name": "${name}"}]`,
      () => {
        const config = getConfig()
        expect(config.AWS.accounts[0].id).toBe(id)
        expect(config.AWS.accounts[0].name).toBe(name)
      },
    )
  })

  it('loads AWS resource tags from environment variables', () => {
    withEnvironment('AWS_RESOURCE_TAG_NAMES', `["Environment"]`, () => {
      const config = getConfig()
      expect(config.AWS.RESOURCE_TAG_NAMES).toEqual(['Environment'])
    })
  })

  it('get GCP projects', () => {
    const id = 'id'
    const name = 'project'

    withEnvironment(
      'GCP_PROJECTS',
      `[{"id": "${id}", "name": "${name}"}]`,
      () => {
        const config = getConfig()
        expect(config.GCP.projects[0].id).toBe(id)
        expect(config.GCP.projects[0].name).toBe(name)
      },
    )
  })

  it('get environment variable from `process.env`', () => {
    const fsSpy = jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw new Error()
    })

    const billingId = 'ezb1'

    withEnvironment('AWS_BILLING_ACCOUNT_ID', billingId, () => {
      const config = getConfig()
      expect(fsSpy).toBeCalled()
      expect(config.AWS.BILLING_ACCOUNT_ID).toBe(billingId)
    })

    jest.clearAllMocks()
  })
})
