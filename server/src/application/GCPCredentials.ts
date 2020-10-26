/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { AWSError, ChainableTemporaryCredentials, Credentials, WebIdentityCredentials } from 'aws-sdk'
import { google } from 'googleapis'

export default class CredentialsForGCP extends Credentials {
  constructor(
    private accountId: string,
    private targetRoleSessionName: string,
    private proxyAccountId: string,
    private proxyRoleName: string,
  ) {
    super(undefined)
  }

  async refresh(callback: (err?: AWSError) => void): Promise<void> {
    try {
      const token = await this.getTokenId()
      const credentials = new ChainableTemporaryCredentials({
        params: {
          RoleArn: `arn:aws:iam::${this.accountId}:role/${this.targetRoleSessionName}`,
          RoleSessionName: this.targetRoleSessionName,
        },
        masterCredentials: new WebIdentityCredentials({
          RoleArn: `arn:aws:iam::${this.proxyAccountId}:role/${this.proxyRoleName}`,
          RoleSessionName: this.proxyRoleName,
          WebIdentityToken: token,
        }),
      })

      await credentials.getPromise()

      this.accessKeyId = credentials.accessKeyId
      this.secretAccessKey = credentials.secretAccessKey
      this.sessionToken = credentials.sessionToken
      this.expireTime = new Date(Date.now() + 1000 * 60 * 60) //Credentials expiration time to 1 hour
      callback()
    } catch (e) {
      callback(e)
    }
  }

  // TODO -- add tests from this function and mock the AWS SDK responses.
  async getTokenId() {
    const iamcredentials = google.iamcredentials('v1')
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })

    // TODO - use the correct type rather than "any". This is a quick fix to get typescript to compile.
    const authClient: any = await auth.getClient()
    google.options({ auth: authClient })

    const projectId = await auth.getProjectId()

    const authClientEmail = authClient.email ? authClient.email : `${projectId}@appspot.gserviceaccount.com`

    const res = await iamcredentials.projects.serviceAccounts.generateIdToken({
      name: `projects/-/serviceAccounts/${authClientEmail}`,
      requestBody: {
        audience: `${authClientEmail}`,
        includeEmail: true,
      },
    })
    return res.data.token
  }
}
