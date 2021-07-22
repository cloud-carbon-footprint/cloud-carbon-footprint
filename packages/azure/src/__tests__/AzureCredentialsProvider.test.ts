/*
 * © 2021 Thoughtworks, Inc.
 */

import { google } from '@google-cloud/secret-manager/build/protos/protos'
import { loginWithServicePrincipalSecret } from '@azure/ms-rest-nodeauth'
import IAccessSecretVersionResponse = google.cloud.secretmanager.v1.IAccessSecretVersionResponse

import { configLoader as config } from '@cloud-carbon-footprint/common'

import AzureCredentialsProvider from '../application/AzureCredentialsProvider'

const mockSecretAccessVersion = jest.fn()

jest.mock('@google-cloud/secret-manager', () => {
  return {
    SecretManagerServiceClient: jest.fn().mockImplementation(() => {
      return {
        accessSecretVersion: mockSecretAccessVersion,
      }
    }),
  }
})
jest.mock('@cloud-carbon-footprint/common')
jest.mock('@azure/ms-rest-nodeauth')
const mockLoginWithServicePrincipalSecret =
  loginWithServicePrincipalSecret as jest.Mock

describe('Azure Credentials Provider', () => {
  beforeEach(() => {
    ;(config as jest.Mock).mockReturnValue({
      AZURE: {
        authentication: {
          mode: 'GCP',
        },
      },
      GCP: {
        BILLING_PROJECT_NAME: 'test-account',
      },
    })
  })

  it('Provides Credentials for GCP', async () => {
    const azureClientId = 'some-client-id'
    const azureClientSecret = 'some-secret-version'
    const azureTenantId = 'some-tenant-id'

    const mockSecretClientId = buildMockSecretResponse(azureClientId)
    const mockSecretVersion = buildMockSecretResponse(azureClientSecret)
    const mockSecretTenantId = buildMockSecretResponse(azureTenantId)

    const expectedCredentials = {
      clientId: azureClientId,
      secret: azureClientSecret,
      domain: azureTenantId,
    }

    mockSecretAccessVersion.mockResolvedValueOnce(mockSecretClientId)
    mockSecretAccessVersion.mockResolvedValueOnce(mockSecretVersion)
    mockSecretAccessVersion.mockResolvedValueOnce(mockSecretTenantId)
    mockLoginWithServicePrincipalSecret.mockResolvedValue(expectedCredentials)

    const credentials = await AzureCredentialsProvider.create()

    expect(mockLoginWithServicePrincipalSecret).toHaveBeenCalledWith(
      azureClientId,
      azureClientSecret,
      azureTenantId,
    )
    expect(credentials).toEqual(expectedCredentials)
  })

  function buildMockSecretResponse(
    secret: string,
  ): IAccessSecretVersionResponse[] {
    const secretBuffer = Buffer.from(secret)
    return [
      {
        name: 'some-secret',
        payload: {
          data: secretBuffer,
        },
      },
    ]
  }
})
