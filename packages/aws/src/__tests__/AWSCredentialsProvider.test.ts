/*
 * © 2021 Thoughtworks, Inc.
 */

import AWSCredentialsProvider from '../application/AWSCredentialsProvider'
import GCPCredentials from '../application/GCPCredentials'
import { setConfig } from '@cloud-carbon-footprint/common'
import {
  fromContainerMetadata,
  fromInstanceMetadata,
  fromNodeProviderChain,
  fromTemporaryCredentials,
} from '@aws-sdk/credential-providers'
import type { AwsCredentialIdentity, Provider } from '@aws-sdk/types'

jest.mock('@aws-sdk/credential-providers', () => ({
  fromTemporaryCredentials: jest.fn(),
  fromInstanceMetadata: jest.fn(),
  fromContainerMetadata: jest.fn(),
  fromNodeProviderChain: jest.fn(),
}))

jest.mock('../application/GCPCredentials', () => ({
  __esModule: true,
  default: jest.fn(),
}))

type Mock = jest.Mock

describe('AWSCredentialsProvider', () => {
  const targetRoleName = 'testTargetRoleName'
  const proxyAccountId = '987654321'
  const proxyRoleName = 'testProxyRoleName'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('create returns GCPCredentialsProvider', () => {
    // given
    setConfig({
      AWS: {
        authentication: {
          mode: 'GCP',
          options: {
            targetRoleName: targetRoleName,
            proxyAccountId: proxyAccountId,
            proxyRoleName: proxyRoleName,
          },
        },
      },
    })
    const accountId = '12345678910'
    const expectedProvider: Provider<AwsCredentialIdentity> = async () => ({
      accessKeyId: 'test',
      secretAccessKey: 'test',
      sessionToken: 'test',
    })

    const getProviderMock = jest.fn().mockReturnValue(expectedProvider)
    ;(GCPCredentials as unknown as Mock).mockImplementationOnce(() => ({
      getProvider: getProviderMock,
    }))

    // when
    const credentials = AWSCredentialsProvider.create(accountId)

    // then
    expect(credentials).toBe(expectedProvider)
    expect(GCPCredentials).toHaveBeenCalledWith(
      accountId,
      targetRoleName,
      proxyAccountId,
      proxyRoleName,
    )
    expect(getProviderMock).toHaveBeenCalled()
  })

  it('create returns fromTemporaryCredentials provider', () => {
    // given
    setConfig({
      AWS: {
        authentication: {
          mode: 'AWS',
          options: {
            targetRoleName: targetRoleName,
            proxyAccountId: proxyAccountId,
            proxyRoleName: proxyRoleName,
          },
        },
        IS_AWS_GLOBAL: true,
      },
    })
    const accountId = '123'
    const params = {
      params: {
        RoleArn: `arn:aws:iam::${accountId}:role/${targetRoleName}`,
        RoleSessionName: `${targetRoleName}`,
      },
    }
    const expectedProvider: Provider<AwsCredentialIdentity> = async () => ({
      accessKeyId: 'test',
      secretAccessKey: 'test',
    })
    ;(fromTemporaryCredentials as unknown as Mock).mockReturnValueOnce(
      expectedProvider,
    )

    // when
    const credentials = AWSCredentialsProvider.create(accountId)
    // then
    expect(credentials).toBe(expectedProvider)
    expect(fromTemporaryCredentials).toHaveBeenCalledWith(params)
  })

  it('create returns fromInstanceMetadata provider', () => {
    // given
    setConfig({
      AWS: {
        authentication: {
          mode: 'EC2-METADATA',
          options: {
            targetRoleName: targetRoleName,
          },
        },
      },
    })
    const options = { timeout: 5000, maxRetries: 10 }
    const expectedProvider: Provider<AwsCredentialIdentity> = async () => ({
      accessKeyId: 'test',
      secretAccessKey: 'test',
    })
    ;(fromInstanceMetadata as unknown as Mock).mockReturnValueOnce(
      expectedProvider,
    )
    const accountId = '123'

    // when
    const credentials = AWSCredentialsProvider.create(accountId)
    // then
    expect(credentials).toBe(expectedProvider)
    expect(fromInstanceMetadata).toHaveBeenCalledWith(options)
  })

  it('create returns fromContainerMetadata provider', () => {
    // given
    setConfig({
      AWS: {
        authentication: {
          mode: 'ECS-METADATA',
          options: {
            targetRoleName: targetRoleName,
          },
        },
      },
    })
    const options = { timeout: 5000, maxRetries: 10 }
    const expectedProvider: Provider<AwsCredentialIdentity> = async () => ({
      accessKeyId: 'test',
      secretAccessKey: 'test',
    })
    ;(fromContainerMetadata as unknown as Mock).mockReturnValueOnce(
      expectedProvider,
    )
    const accountId = '123'

    // when
    const credentials = AWSCredentialsProvider.create(accountId)
    // then
    expect(credentials).toBe(expectedProvider)
    expect(fromContainerMetadata).toHaveBeenCalledWith(options)
  })

  it('create returns fromNodeProviderChain provider by default', () => {
    // given
    setConfig({
      AWS: {
        authentication: {} as any,
      },
    })

    const accountId = '123'
    const expectedProvider: Provider<AwsCredentialIdentity> = async () => ({
      accessKeyId: 'test',
      secretAccessKey: 'test',
    })
    ;(fromNodeProviderChain as unknown as Mock).mockReturnValueOnce(
      expectedProvider,
    )

    // when
    const credentials = AWSCredentialsProvider.create(accountId)

    // then
    expect(credentials).toBe(expectedProvider)
    expect(fromNodeProviderChain).toHaveBeenCalled()
  })
})
