/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  fromTemporaryCredentials,
  fromWebToken,
} from '@aws-sdk/credential-providers'
import { AwsCredentialIdentity, Provider } from '@aws-sdk/types'
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

  async getTokenId(): Promise<string> {
    const auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    })

    const authClient: GoogleAuthClient = await auth.getClient()
    const projectId = await auth.getProjectId()

    const serviceAccountEmail = (<JWT>authClient).email
      ? (<JWT>authClient).email
      : `${projectId}@appspot.gserviceaccount.com`

    const { token: accessToken } = await authClient.getAccessToken()
    if (!accessToken) {
      throw new Error('Failed to obtain GCP access token')
    }

    return this.generateIdToken(serviceAccountEmail, accessToken)
  }

  /**
   * Fetches an OIDC ID token via the IAM Credentials REST API.
   * Uses REST instead of @google-cloud/iam-credentials to avoid gRPC metadata
   * errors and auth.fetch requirements on GCP App Engine.
   * @see https://github.com/googleapis/google-auth-library-nodejs/issues/1952
   */
  private async generateIdToken(
    serviceAccountEmail: string,
    accessToken: string,
  ): Promise<string> {
    const url = `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(serviceAccountEmail)}:generateIdToken`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audience: serviceAccountEmail,
        includeEmail: true,
      }),
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(
        `IAM generateIdToken failed: ${res.status} ${res.statusText}. ${body}`,
      )
    }
    const data = (await res.json()) as { token: string }
    if (!data.token) {
      throw new Error('IAM generateIdToken returned no token')
    }
    return data.token
  }
}
