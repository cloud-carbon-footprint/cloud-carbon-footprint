/*
 * © 2022 Thoughtworks, Inc.
 */

import fs from 'fs'
import getConfig from '../Config'
import { AccountDetails } from '../Types'

describe('Config', () => {
  const withEnvironment = (name: string, value: string, test: () => void) => {
    const existingValue = process.env[name]
    process.env[name] = value

    try {
      test()
    } finally {
      if (!existingValue) {
        delete process.env[name]
      } else {
        process.env[name] = existingValue
      }
    }
  }

  it('get environment variable from `process.env`', () => {
    const fsSpy = jest.spyOn(fs, 'readFileSync')
    const billingId = 'ezb1'

    withEnvironment('AWS_BILLING_ACCOUNT_ID', billingId, () => {
      const config = getConfig()
      expect(fsSpy).toBeCalled()
      expect(config.AWS.BILLING_ACCOUNT_ID).toBe(billingId)
    })

    jest.clearAllMocks()
  })

  describe('AWS', () => {
    it('loads list of AWS accounts with names and ids from environment variables', () => {
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

    it('loads list of AWS accounts with only ids from the environment variables', () => {
      const id = 'b47m4n'
      const idTwo = 'cl4rk'

      withEnvironment('AWS_ACCOUNTS', `["${id}", "${idTwo}"]`, () => {
        const config = getConfig()
        expect(config.AWS.accounts[0]).toBe(id)
        expect(config.AWS.accounts[1]).toBe(idTwo)
      })
    })

    it('loads AWS resource tags from environment variables', () => {
      withEnvironment('AWS_RESOURCE_TAG_NAMES', `["Environment"]`, () => {
        const config = getConfig()
        expect(config.AWS.RESOURCE_TAG_NAMES).toEqual(['Environment'])
      })
    })
  })

  describe('Google Cloud', () => {
    it('loads list of GCP Projects with names and ids from environment variables', () => {
      const id = 'id'
      const secondId = 'id2'
      const name = 'project'

      withEnvironment(
        'GCP_PROJECTS',
        `[{"id": "${id}", "name": "${name}"}, {"id": "${secondId}"}]`,
        () => {
          const configuredProjects = getConfig().GCP
            .projects as AccountDetails[]
          expect(configuredProjects[0].id).toBe(id)
          expect(configuredProjects[0].name).toBe(name)
          expect(configuredProjects[1].id).toBe(secondId)
          expect(configuredProjects[1].name).toBeUndefined()
        },
      )
    })

    it('loads list of GCP Projects with only ids from the environment variables', () => {
      const id = 'id'
      const secondId = 'id2'

      withEnvironment('GCP_PROJECTS', `["${id}", "${secondId}"]`, () => {
        const configuredProjects = getConfig().GCP.projects as string[]
        expect(configuredProjects[0]).toBe(id)
        expect(configuredProjects[1]).toBe(secondId)
      })
    })

    it('loads Google Cloud tags from environment variables', () => {
      withEnvironment('GCP_RESOURCE_TAG_NAMES', `["Environment"]`, () => {
        const config = getConfig()
        expect(config.GCP.RESOURCE_TAG_NAMES).toEqual(['Environment'])
      })
    })
  })

  describe('Azure', () => {
    it('loads Azure tags from environment variables', () => {
      withEnvironment('AZURE_RESOURCE_TAG_NAMES', `["Environment"]`, () => {
        const config = getConfig()
        expect(config.AZURE.RESOURCE_TAG_NAMES).toEqual(['Environment'])
      })
    })

    it('loads list of Azure subscriptions from environment variables', () => {
      withEnvironment('AZURE_SUBSCRIPTIONS', `["sub-1", "sub-2"]`, () => {
        const config = getConfig()
        expect(config.AZURE.SUBSCRIPTIONS).toEqual(['sub-1', 'sub-2'])
      })
    })
  })

  describe('INCLUDE_ESTIMATES', () => {
    const cloudProviders = ['AWS', 'GCP', 'AZURE', 'ALI'] as const
    cloudProviders.forEach((provider) => {
      it.each([
        [true, 'true'],
        [false, 'false'],
        [true, ''],
      ])(
        `sets ${provider}_INCLUDE_ESTIMATES to %s for INCLUDE_ESTIMATES=%s`,
        (expected: boolean, value: string) => {
          withEnvironment(`${provider}_INCLUDE_ESTIMATES`, value, () => {
            const config = getConfig()
            expect(config[provider].INCLUDE_ESTIMATES).toBe(expected)
          })
        },
      )
    })
  })
})
