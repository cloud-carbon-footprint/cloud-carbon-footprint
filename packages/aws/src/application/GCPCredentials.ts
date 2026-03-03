/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  fromTemporaryCredentials,
  fromWebToken,
} from '@aws-sdk/credential-providers'
import { AwsCredentialIdentity, Provider } from '@aws-sdk/types'
import { IAMCredentialsClient } from '@google-cloud/iam-credentials'
import { GoogleAuth, JWT } from 'google-auth-library'
import { GoogleAuthClient } from '@cloud-carbon-footprint/common'

export default class GCPCredentials {
  constructor(
    private accountId: string,
    private targetRoleName: string,
    private proxyAccountId: string,
    private proxyRoleName: string,
  ) {}

  getProvider(): Provider<AwsCredentialIdentity> {
    return async () => {
      const token = await this.getTokenId()

      const masterCredentials = fromWebToken({
        roleArn: `arn:aws:iam::${this.proxyAccountId}:role/${this.proxyRoleName}`,
        roleSessionName: this.proxyRoleName,
        webIdentityToken: token,
      })

      return fromTemporaryCredentials({
        params: {
          RoleArn: `arn:aws:iam::${this.accountId}:role/${this.targetRoleName}`,
          RoleSessionName: this.targetRoleName,
        },
        masterCredentials,
      })()
    }
  }

  async getTokenId() {
    const auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    })

    const authClient: GoogleAuthClient = await auth.getClient()
    // Use fallback: true to force HTTP/1.1 REST mode and avoid the gRPC
    const iamCredentials = new IAMCredentialsClient({
      auth: auth,
      fallback: true,
    })

    const projectId = await auth.getProjectId()

    const authClientEmail = (<JWT>authClient).email
      ? (<JWT>authClient).email
      : `${projectId}@appspot.gserviceaccount.com`

    const [res] = await iamCredentials.generateIdToken({
      name: `projects/-/serviceAccounts/${authClientEmail}`,
      audience: `${authClientEmail}`,
      includeEmail: true,
    })
    return res.token
  }
}
