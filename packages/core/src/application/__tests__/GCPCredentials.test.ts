/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import GCPCredentials from '../GCPCredentials'
import { ChainableTemporaryCredentials, WebIdentityCredentials } from 'aws-sdk'
import Mock = jest.Mock

const Credentials = jest.requireActual('aws-sdk').Credentials
jest.mock('aws-sdk', () => {
  return {
    ChainableTemporaryCredentials: jest.fn(),
    WebIdentityCredentials: jest.fn(),
    Credentials: jest.requireActual('aws-sdk').Credentials,
  }
})

function mockChainableTemporaryCredentials(
  targetAccessKeyId: string,
  targetSecretAccessKey: string,
  targetSessionToken: string,
) {
  const chainableTemporaryCredentials = (ChainableTemporaryCredentials as unknown) as Mock
  chainableTemporaryCredentials.mockImplementationOnce(() => {
    return new Credentials(targetAccessKeyId, targetSecretAccessKey, targetSessionToken)
  })
  return chainableTemporaryCredentials
}

function mockWebIdentityCredentials(
  targetAccessKeyId: string,
  targetSecretAccessKey: string,
  targetSessionToken: string,
) {
  const webIdentityCredentials = (WebIdentityCredentials as unknown) as Mock
  const credentials = new Credentials(targetAccessKeyId, targetSecretAccessKey, targetSessionToken)
  webIdentityCredentials.mockImplementationOnce(() => {
    return credentials
  })
  return { webIdentityCredentials, webIdentityReturnedCredentials: credentials }
}

let credentials: any
let mockedGetTokenId: any

describe('GCPCredentials instance', () => {
  beforeEach(() => {
    const accountId = '1233452012'
    const targetRoleSessionName = 'mySessionName'
    const proxyAccountId = '11111'
    const proxyRoleName = 'proxyRoleName'
    const token = '0000'
    credentials = new GCPCredentials(accountId, targetRoleSessionName, proxyAccountId, proxyRoleName)

    mockedGetTokenId = jest.spyOn(credentials, 'getTokenId').mockImplementation(async () => {
      return token
    })
  })

  afterEach(() => {
    mockedGetTokenId.mockRestore()
  })

  it('should set credentials when calling get()', async () => {
    //given
    const targetAccessKeyId = 'alsorandomchars'
    const targetSecretAccessKey = 'verylongstringwithrandomchars'
    const targetSessionToken = 'hi'

    mockChainableTemporaryCredentials(targetAccessKeyId, targetSecretAccessKey, targetSessionToken)

    //when
    await credentials.getPromise()

    //then
    expect(credentials.accessKeyId).toEqual(targetAccessKeyId)
    expect(credentials.secretAccessKey).toEqual(targetSecretAccessKey)
    expect(credentials.sessionToken).toEqual(targetSessionToken)
    expect(credentials.expireTime).toBeInstanceOf(Date)
  })

  it('should create ChainableTemporaryCredentials with expected options', async () => {
    //given
    const chainableTemporaryCredentials = mockChainableTemporaryCredentials('', '', '')
    const { webIdentityReturnedCredentials } = mockWebIdentityCredentials('a', 'b', 'c')

    const accountId = '1233452012'
    const targetRoleSessionName = 'mySessionName'
    const chainableTemporaryCredentialsOptions = {
      params: {
        RoleArn: `arn:aws:iam::${accountId}:role/${targetRoleSessionName}`,
        RoleSessionName: targetRoleSessionName,
      },
      masterCredentials: webIdentityReturnedCredentials,
    }

    //when
    await credentials.getPromise()

    //then
    expect(chainableTemporaryCredentials).toHaveBeenCalledWith(chainableTemporaryCredentialsOptions)
  })

  it('should create WebIdentityCredentials with expected options', async () => {
    //given
    mockChainableTemporaryCredentials('', '', '')
    const { webIdentityCredentials } = mockWebIdentityCredentials('a', 'b', 'c')

    const proxyAccountId = '11111'
    const proxyRoleName = 'proxyRoleName'
    const token = '0000'

    const webOptions = {
      RoleArn: `arn:aws:iam::${proxyAccountId}:role/${proxyRoleName}`,
      RoleSessionName: proxyRoleName,
      WebIdentityToken: token,
    }

    //when
    await credentials.getPromise()

    //then
    expect(webIdentityCredentials).toHaveBeenCalledWith(webOptions)
    mockedGetTokenId.mockRestore()
  })
})
