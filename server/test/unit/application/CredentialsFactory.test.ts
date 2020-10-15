import AWSMock from 'aws-sdk-mock'
import { ChainableTemporaryCredentials, Credentials, STS } from 'aws-sdk'
import { AssumeRoleResponse } from 'aws-sdk/clients/sts'

beforeEach(() => {
  // AWSMock.setSDKInstance(AWS)
})

function getMockSTSAssumeRoleResponse() {
  const mock = jest.fn()
  AWSMock.mock('STS', 'assumeRole', (request: STS.AssumeRoleRequest, callback: (a: Error, response: any) => any) => {
    callback(null, mock())
  })
  return mock
}

xdescribe('AWSCredentialsFactory', () => {
  it('should return credentials from sts.assumeRole when authenticationMode is set to assumeWithRole', async () => {
    //given
    // jest.doMock('@application/Config.ts', () => {
    //   return {
    //     AWS: {},
    //   }
    // })

    const returnedCredentials: STS.Credentials = {
      AccessKeyId: 'some id',
      SecretAccessKey: 'some access key',
      SessionToken: 'some token',
      Expiration: undefined,
    }
    const mockSTSAssumeRoleResponse: jest.Mock<AssumeRoleResponse> = getMockSTSAssumeRoleResponse()
    mockSTSAssumeRoleResponse.mockReturnValue({
      Credentials: returnedCredentials,
    })

    //when
    // const AWSCredentialsFactory = require('@application/AWSCredentialsFactory').default
    // const credentials: Credentials = await AWSCredentialsFactory.create()
    const credentials = new ChainableTemporaryCredentials({
      params: { RoleArn: `arn:aws:iam::1:role/ccf`, RoleSessionName: 'ccf' },
    })

    console.log(credentials.service)
    await credentials.getPromise()

    //then
    expect(credentials).toEqual(returnedCredentials)
  })
})
