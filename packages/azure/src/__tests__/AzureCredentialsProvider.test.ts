/*
 * © 2021 Thoughtworks, Inc.
 */

import { google } from '@google-cloud/secret-manager/build/protos/protos'
import IAccessSecretVersionResponse = google.cloud.secretmanager.v1.IAccessSecretVersionResponse
import { ClientSecretCredential } from '@azure/identity'

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

jest.mock('@azure/identity', () => {
  return {
    ClientSecretCredential: jest.fn(),
  }
})

function mockClientSecretCredential(
  targetTenantId: string,
  targetClientId: string,
  targetClientSecret: string,
) {
  const clientSecretCredential = ClientSecretCredential as unknown as Mock
  clientSecretCredential.mockImplementationOnce(() => {
    return new ClientSecretCredential(
      targetTenantId,
      targetClientId,
      targetClientSecret,
    )
  })
  return clientSecretCredential
}

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

    const mockCredentials = mockClientSecretCredential(
      azureTenantId,
      azureClientId,
      azureClientSecret,
    )

    mockSecretAccessVersion.mockResolvedValueOnce(mockSecretClientId)
    mockSecretAccessVersion.mockResolvedValueOnce(mockSecretVersion)
    mockSecretAccessVersion.mockResolvedValueOnce(mockSecretTenantId)

    const credentials: ClientSecretCredential =
      await AzureCredentialsProvider.create()

    expect(mockCredentials).toHaveBeenCalledWith(
      azureTenantId,
      azureClientId,
      azureClientSecret,
    )
    expect(credentials).toBeInstanceOf(ClientSecretCredential)
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
