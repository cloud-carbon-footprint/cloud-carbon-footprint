/*
 * © 2021 Thoughtworks, Inc.
 */

import GCPCredentials from '../application/GCPCredentials'
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

const authClientMock = { email: 'test@test.com' }
const mockToken = 'some-token'

jest.mock('google-auth-library', () => {
  return {
    GoogleAuth: jest.fn().mockImplementation(() => ({
      getClient: jest.fn().mockResolvedValue(authClientMock),
      getProjectId: jest.fn().mockResolvedValue('test-project.id'),
    })),
  }
})

jest.mock('@google-cloud/iam-credentials', () => {
  return {
    IAMCredentialsClient: jest.fn().mockImplementation(() => ({
      generateIdToken: jest.fn().mockResolvedValue([{ token: mockToken }]),
    })),
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

function mockWebIdentityCredentials(
  targetAccessKeyId: string,
  targetSecretAccessKey: string,
  targetSessionToken: string,
) {
  const webIdentityCredentials = WebIdentityCredentials as unknown as Mock
  const credentials = new Credentials(
    targetAccessKeyId,
    targetSecretAccessKey,
    targetSessionToken,
  )
  webIdentityCredentials.mockImplementationOnce(() => {
    return credentials
  })
  return { webIdentityCredentials, webIdentityReturnedCredentials: credentials }
}

let credentials: any

describe('GCPCredentials instance', () => {
  beforeEach(() => {
    const accountId = '1233452012'
    const targetRoleName = 'myRoleName'
    const proxyAccountId = '11111'
    const proxyRoleName = 'proxyRoleName'
    credentials = new GCPCredentials(
      accountId,
      targetRoleName,
      proxyAccountId,
      proxyRoleName,
    )
  })

  it('should set credentials when calling get()', async () => {
    //given
    const targetAccessKeyId = 'alsorandomchars'
    const targetSecretAccessKey = 'verylongstringwithrandomchars'
    const targetSessionToken = 'hi'

    mockChainableTemporaryCredentials(
      targetAccessKeyId,
      targetSecretAccessKey,
      targetSessionToken,
    )

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
    const chainableTemporaryCredentials = mockChainableTemporaryCredentials(
      '',
      '',
      '',
    )
    const { webIdentityReturnedCredentials } = mockWebIdentityCredentials(
      'a',
      'b',
      'c',
    )

    const accountId = '1233452012'
    const targetRoleName = 'myRoleName'
    const chainableTemporaryCredentialsOptions = {
      params: {
        RoleArn: `arn:aws:iam::${accountId}:role/${targetRoleName}`,
        RoleSessionName: targetRoleName,
      },
      masterCredentials: webIdentityReturnedCredentials,
    }

    //when
    await credentials.getPromise()

    //then
    expect(chainableTemporaryCredentials).toHaveBeenCalledWith(
      chainableTemporaryCredentialsOptions,
    )
  })

  it('should create WebIdentityCredentials with expected options', async () => {
    //given
    mockChainableTemporaryCredentials('', '', '')
    const { webIdentityCredentials } = mockWebIdentityCredentials('a', 'b', 'c')

    const proxyAccountId = '11111'
    const proxyRoleName = 'proxyRoleName'

    const webOptions = {
      RoleArn: `arn:aws:iam::${proxyAccountId}:role/${proxyRoleName}`,
      RoleSessionName: proxyRoleName,
      WebIdentityToken: mockToken,
    }

    //when
    await credentials.getPromise()

    //then
    expect(webIdentityCredentials).toHaveBeenCalledWith(webOptions)
  })
})
