/*
 * © 2021 Thoughtworks, Inc.
 */

import * as common from '../../GuidedInstall/common'
import * as external from '../../GuidedInstall/external'
import { GuidedInstall } from '../../GuidedInstall/runner'

jest.mock('../../GuidedInstall/common')
const mockListPrompt: jest.Mock = common.listPrompt as jest.Mock
const mockConfirmPrompt: jest.Mock = common.confirmPrompt as jest.Mock
const mockInputPrompt: jest.Mock = common.inputPrompt as jest.Mock
const mockCreateEnvFile: jest.Mock = common.createEnvFile as jest.Mock

jest.mock('../../GuidedInstall/external')
const mockLog: jest.Mock = external.log as jest.Mock
const mockRunCmd: jest.Mock = external.runCmd as jest.Mock

describe('GuidedInstall', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Azure', () => {
    beforeEach(() => {
      mockListPrompt.mockResolvedValue('Azure')
      mockConfirmPrompt.mockResolvedValue(true)
      mockInputPrompt
        .mockResolvedValueOnce('client id')
        .mockResolvedValueOnce('client secret')
        .mockResolvedValueOnce('tenant id')
    })

    it('creates an env file for cli and api with the given config', async () => {
      await GuidedInstall()

      const expectedEnv = {
        AZURE_CLIENT_ID: 'client id',
        AZURE_CLIENT_SECRET: 'client secret',
        AZURE_TENANT_ID: 'tenant id',
        AZURE_USE_BILLING_DATA: 'true',
      }
      expect(mockCreateEnvFile).toHaveBeenCalledWith('./', expectedEnv)
      expect(mockCreateEnvFile).toHaveBeenCalledWith('../api/', expectedEnv)
    })

    it('shows the correct confirmation prompts for manual instructions', async () => {
      await GuidedInstall()

      expect(mockConfirmPrompt.mock.calls).toMatchSnapshot()
    })

    it('shows the correct input prompts for collecting env vars', async () => {
      await GuidedInstall()

      expect(mockInputPrompt.mock.calls).toMatchSnapshot()
    })

    it('shows the correct informational messages and documentation references', async () => {
      await GuidedInstall()

      expect(mockLog.mock.calls).toMatchSnapshot()
    })
  })

  describe('GCP', () => {
    beforeEach(() => {
      mockListPrompt.mockResolvedValue('GCP')
      mockConfirmPrompt.mockResolvedValue(true)
      mockInputPrompt
        .mockResolvedValueOnce('private key file path')
        .mockResolvedValueOnce('account id')
        .mockResolvedValueOnce('account name')
        .mockResolvedValueOnce('BIG table')
    })

    it('creates an env file for cli and api with the given config', async () => {
      await GuidedInstall()

      const expectedEnv = {
        GCP_BILLING_PROJECT_ID: 'account id',
        GCP_BILLING_PROJECT_NAME: 'account name',
        GCP_BIG_QUERY_TABLE: 'BIG table',
        GCP_USE_BILLING_DATA: 'true',
        GOOGLE_APPLICATION_CREDENTIALS: 'private key file path',
      }
      expect(mockCreateEnvFile).toHaveBeenCalledWith('./', expectedEnv)
      expect(mockCreateEnvFile).toHaveBeenCalledWith('../api/', expectedEnv)
    })

    it('shows the correct confirmation prompts for manual instructions', async () => {
      await GuidedInstall()

      expect(mockConfirmPrompt.mock.calls).toMatchSnapshot()
    })

    it('shows the correct input prompts for collecting env vars', async () => {
      await GuidedInstall()

      expect(mockInputPrompt.mock.calls).toMatchSnapshot()
    })

    it('shows the correct informational messages and documentation references', async () => {
      await GuidedInstall()

      expect(mockLog.mock.calls).toMatchSnapshot()
    })
  })

  describe('AWS', () => {
    describe('with awscli config', () => {
      beforeEach(() => {
        mockListPrompt.mockResolvedValue('AWS')
        mockConfirmPrompt
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
        mockInputPrompt
          .mockResolvedValueOnce('account id')
          .mockResolvedValueOnce('account name')
          .mockResolvedValueOnce('region')
          .mockResolvedValueOnce('role name')
          .mockResolvedValueOnce('athena db name')
          .mockResolvedValueOnce('athena db table')
          .mockResolvedValueOnce('athena query result location')
          .mockResolvedValueOnce('access key id')
          .mockResolvedValueOnce('secret access key')
          .mockResolvedValueOnce('profile')
      })

      it('creates an env file for cli and api with the given config', async () => {
        await GuidedInstall()

        const expectedEnv = {
          AWS_ATHENA_DB_NAME: 'athena db name',
          AWS_ATHENA_DB_TABLE: 'athena db table',
          AWS_ATHENA_QUERY_RESULT_LOCATION: 'athena query result location',
          AWS_ATHENA_REGION: 'region',
          AWS_BILLING_ACCOUNT_ID: 'account id',
          AWS_BILLING_ACCOUNT_NAME: 'account name',
          AWS_TARGET_ACCOUNT_ROLE_NAME: 'role name',
          AWS_USE_BILLING_DATA: 'true',
        }
        expect(mockCreateEnvFile).toHaveBeenCalledWith('./', expectedEnv)
        expect(mockCreateEnvFile).toHaveBeenCalledWith('../api/', expectedEnv)
      })

      it('shows the correct confirmation prompts for manual instructions', async () => {
        await GuidedInstall()

        expect(mockConfirmPrompt.mock.calls).toMatchSnapshot()
      })

      it('shows the correct input prompts for collecting env vars', async () => {
        await GuidedInstall()

        expect(mockInputPrompt.mock.calls).toMatchSnapshot()
      })

      it('runs `aws configure` commands', async () => {
        await GuidedInstall()

        expect(mockRunCmd.mock.calls).toMatchSnapshot()
      })

      it('shows the correct informational messages and documentation references', async () => {
        await GuidedInstall()

        expect(mockLog.mock.calls).toMatchSnapshot()
      })
    })

    describe('without awscli config', () => {
      beforeEach(() => {
        mockListPrompt.mockResolvedValue('AWS')
        mockConfirmPrompt
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(true)
        mockInputPrompt
          .mockResolvedValueOnce('account id')
          .mockResolvedValueOnce('account name')
          .mockResolvedValueOnce('region')
          .mockResolvedValueOnce('role name')
          .mockResolvedValueOnce('athena db name')
          .mockResolvedValueOnce('athena db table')
          .mockResolvedValueOnce('athena query result location')
      })

      it('creates an env file for cli and api with the given config', async () => {
        await GuidedInstall()

        const expectedEnv = {
          AWS_ATHENA_DB_NAME: 'athena db name',
          AWS_ATHENA_DB_TABLE: 'athena db table',
          AWS_ATHENA_QUERY_RESULT_LOCATION: 'athena query result location',
          AWS_ATHENA_REGION: 'region',
          AWS_BILLING_ACCOUNT_ID: 'account id',
          AWS_BILLING_ACCOUNT_NAME: 'account name',
          AWS_TARGET_ACCOUNT_ROLE_NAME: 'role name',
          AWS_USE_BILLING_DATA: 'true',
        }
        expect(mockCreateEnvFile).toHaveBeenCalledWith('./', expectedEnv)
        expect(mockCreateEnvFile).toHaveBeenCalledWith('../api/', expectedEnv)
      })

      it('shows the correct confirmation prompts for manual instructions', async () => {
        await GuidedInstall()

        expect(mockConfirmPrompt.mock.calls).toMatchSnapshot()
      })

      it('shows the correct input prompts for collecting env vars', async () => {
        await GuidedInstall()

        expect(mockInputPrompt.mock.calls).toMatchSnapshot()
      })

      it('does not run `aws configure` commands', async () => {
        await GuidedInstall()

        expect(mockRunCmd).not.toHaveBeenCalled()
      })

      it('shows the correct informational messages and documentation references', async () => {
        await GuidedInstall()

        expect(mockLog.mock.calls).toMatchSnapshot()
      })
    })
  })
})
