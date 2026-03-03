/*
 * © 2021 Thoughtworks, Inc.
 */

import GCPCredentials from '../application/GCPCredentials'
import {
  fromTemporaryCredentials,
  fromWebToken,
} from '@aws-sdk/credential-providers'
import type { AwsCredentialIdentity } from '@aws-sdk/types'
import Mock = jest.Mock

jest.mock('@aws-sdk/credential-providers', () => {
  return {
    fromTemporaryCredentials: jest.fn(),
    fromWebToken: jest.fn(),
  }
})

jest.mock('google-auth-library', () => {
  return {
    __esModule: true,
    GoogleAuth: class MockGoogleAuth {
      getClient = jest.fn().mockResolvedValue({
        email: 'test@test.com',
        getAccessToken: jest
          .fn()
          .mockResolvedValue({ token: 'mock-access-token' }),
      })
      getProjectId = jest.fn().mockResolvedValue('test-project.id')
    },
    JWT: jest.fn(),
  }
})

const mockFetch = jest.fn().mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue({ token: 'some-token' }),
})
beforeAll(() => {
  global.fetch = mockFetch
})
afterAll(() => {
  delete (global as unknown as { fetch?: unknown }).fetch
})

const mockToken = 'some-token'

function mockFromTemporaryCredentials(
  targetAccessKeyId: string,
  targetSecretAccessKey: string,
  targetSessionToken: string,
) {
  const mockFn = fromTemporaryCredentials as unknown as Mock
  mockFn.mockImplementationOnce(() => {
    return async (): Promise<AwsCredentialIdentity> => ({
      accessKeyId: targetAccessKeyId,
      secretAccessKey: targetSecretAccessKey,
      sessionToken: targetSessionToken,
      expiration: new Date(Date.now() + 1000 * 60 * 60),
    })
  })
  return mockFn
}

function mockFromWebToken(
  targetAccessKeyId: string,
  targetSecretAccessKey: string,
  targetSessionToken: string,
) {
  const mockFn = fromWebToken as unknown as Mock
  const provider = async (): Promise<AwsCredentialIdentity> => ({
    accessKeyId: targetAccessKeyId,
    secretAccessKey: targetSecretAccessKey,
    sessionToken: targetSessionToken,
  })
  mockFn.mockImplementationOnce(() => provider)
  return { fromWebTokenMock: mockFn, webIdentityProvider: provider }
}

let credentials: GCPCredentials

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

    mockFromTemporaryCredentials(
      targetAccessKeyId,
      targetSecretAccessKey,
      targetSessionToken,
    )

    //when
    const result = await credentials.getProvider()()

    //then
    expect(result.accessKeyId).toEqual(targetAccessKeyId)
    expect(result.secretAccessKey).toEqual(targetSecretAccessKey)
    expect(result.sessionToken).toEqual(targetSessionToken)
    expect(result.expiration).toBeInstanceOf(Date)
  })

  it('should create fromTemporaryCredentials with expected options', async () => {
    //given
    const mockFn = mockFromTemporaryCredentials('', '', '')
    const { webIdentityProvider } = mockFromWebToken('a', 'b', 'c')

    const accountId = '1233452012'
    const targetRoleName = 'myRoleName'
    const expectedOptions = {
      params: {
        RoleArn: `arn:aws:iam::${accountId}:role/${targetRoleName}`,
        RoleSessionName: targetRoleName,
      },
      masterCredentials: webIdentityProvider,
    }

    //when
    await credentials.getProvider()()

    //then
    expect(mockFn).toHaveBeenCalledWith(expectedOptions)
  })

  it('should create fromWebToken with expected options', async () => {
    //given
    mockFromTemporaryCredentials('', '', '')
    const { fromWebTokenMock } = mockFromWebToken('a', 'b', 'c')

    const proxyAccountId = '11111'
    const proxyRoleName = 'proxyRoleName'

    const webOptions = {
      roleArn: `arn:aws:iam::${proxyAccountId}:role/${proxyRoleName}`,
      roleSessionName: proxyRoleName,
      webIdentityToken: mockToken,
    }

    //when
    await credentials.getProvider()()

    //then
    expect(fromWebTokenMock).toHaveBeenCalledWith(webOptions)
  })
})
