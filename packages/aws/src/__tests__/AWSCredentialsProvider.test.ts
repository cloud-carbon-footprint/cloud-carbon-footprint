/*
 * © 2021 Thoughtworks, Inc.
 */

import AWSCredentialsProvider from '../application/AWSCredentialsProvider'
import GCPCredentials from '../application/GCPCredentials'
import { Config as mockConfig } from '@cloud-carbon-footprint/common'
import { ChainableTemporaryCredentials, Credentials } from 'aws-sdk'
import Mock = jest.Mock

jest.mock('aws-sdk', () => {
  return {
    ChainableTemporaryCredentials: jest.fn(),
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

describe('AWSCredentialsProvider', () => {
  const targetRoleName = 'testTargetRoleName'
  const proxyAccountId = '987654321'
  const proxyRoleName = 'testProxyRoleName'
  beforeAll(() => {
    mockConfig.AWS = {
      CURRENT_REGIONS: [],
      CURRENT_SERVICES: [],
      NAME: '',
      authentication: {
        mode: 'GCP',
        options: {
          targetRoleName: targetRoleName,
          proxyAccountId: proxyAccountId,
          proxyRoleName: proxyRoleName,
        },
      },
    }
  })
  it('create returns GCPCredentialsProvider', () => {
    // given
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
    mockConfig.AWS.authentication.mode = 'AWS'
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

  it('create returns Credentials by default', () => {
    // given
    mockConfig.AWS.authentication.mode = undefined
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
