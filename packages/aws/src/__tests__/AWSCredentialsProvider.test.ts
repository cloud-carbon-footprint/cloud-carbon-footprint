/*
 * © 2021 Thoughtworks, Inc.
 */

import AWSCredentialsProvider from '../application/AWSCredentialsProvider'
import GCPCredentials from '../application/GCPCredentials'
import { setConfig } from '@cloud-carbon-footprint/common'
import {
  ChainableTemporaryCredentials,
  Credentials,
  EC2MetadataCredentials,
  ECSCredentials,
} from 'aws-sdk'
import Mock = jest.Mock

jest.mock('aws-sdk', () => {
  return {
    ChainableTemporaryCredentials: jest.fn(),
    EC2MetadataCredentials: jest.fn(),
    ECSCredentials: jest.fn(),
    Credentials: jest.fn(),
    config: jest.requireActual('aws-sdk').config,
  }
})

function mockChainableTemporaryCredentials(
  targetAccessKeyId: string,
  targetSecretAccessKey: string,
  targetSessionToken: string,
) {
  const chainableTemporaryCredentials =
    ChainableTemporaryCredentials as unknown as Mock
  chainableTemporaryCredentials.mockImplementationOnce(() => {
    return new Credentials(
      targetAccessKeyId,
      targetSecretAccessKey,
      targetSessionToken,
    )
  })
  return chainableTemporaryCredentials
}

function mockEC2MetadataCredentials(options: {
  httpOptions: { timeout: number }
  maxRetries: number
}) {
  const ec2MetadataCredentials = EC2MetadataCredentials as unknown as Mock
  ec2MetadataCredentials.mockImplementationOnce(() => {
    return new EC2MetadataCredentials(options)
  })
  return ec2MetadataCredentials
}

function mockECSCredentials(options: {
  httpOptions: { timeout: number }
  maxRetries: number
}) {
  const ecsCredentials = ECSCredentials as unknown as Mock
  ecsCredentials.mockImplementationOnce(() => {
    return new ECSCredentials(options)
  })
  return ecsCredentials
}

describe('AWSCredentialsProvider', () => {
  const targetRoleName = 'testTargetRoleName'
  const proxyAccountId = '987654321'
  const proxyRoleName = 'testProxyRoleName'

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
    const expectedCredentials = new GCPCredentials(
      accountId,
      targetRoleName,
      proxyAccountId,
      proxyRoleName,
    )

    // when
    const credentials = AWSCredentialsProvider.create(accountId)

    // then
    expect(credentials).toEqual(expectedCredentials)
  })

  it('create returns ChainableTemporaryCredentials', () => {
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
      },
    })
    const mockedChainableTemporaryCredentials =
      mockChainableTemporaryCredentials('', '', '')
    const accountId = '123'
    const params = {
      params: {
        RoleArn: `arn:aws:iam::${accountId}:role/${targetRoleName}`,
        RoleSessionName: `${targetRoleName}`,
      },
    }
    // when
    const credentials = AWSCredentialsProvider.create(accountId)
    // then
    expect(credentials).toBeInstanceOf(Credentials)
    expect(mockedChainableTemporaryCredentials).toHaveBeenCalledWith(params)
  })

  it('create returns EC2MetadataCredentials', () => {
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
    const options = { httpOptions: { timeout: 5000 }, maxRetries: 10 }
    const mockedEC2MetadataCredentials = mockEC2MetadataCredentials(options)
    const accountId = '123'

    // when
    const credentials = AWSCredentialsProvider.create(accountId)
    // then
    expect(credentials).toBeInstanceOf(EC2MetadataCredentials)
    expect(mockedEC2MetadataCredentials).toHaveBeenCalledWith(options)
  })

  it('create returns ECSCredentials', () => {
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
    const options = { httpOptions: { timeout: 5000 }, maxRetries: 10 }
    const mockedECSCredentials = mockECSCredentials(options)
    const accountId = '123'

    // when
    const credentials = AWSCredentialsProvider.create(accountId)
    // then
    expect(credentials).toBeInstanceOf(ECSCredentials)
    expect(mockedECSCredentials).toHaveBeenCalledWith(options)
  })

  it('create returns Credentials by default', () => {
    // given
    setConfig({
      AWS: {
        authentication: {
          mode: undefined,
        },
      },
    })

    const accountId = '123'
    const credentialsOptions = { accessKeyId: '', secretAccessKey: '' }
    const credentialsMock = Credentials as unknown as Mock
    credentialsMock.mockImplementationOnce(() => {
      return new Credentials(credentialsOptions)
    })

    // when
    const credentials = AWSCredentialsProvider.create(accountId)

    // then
    expect(credentials).toBeInstanceOf(Credentials)
    expect(credentialsMock).toHaveBeenCalledWith(credentialsOptions)
  })
})
