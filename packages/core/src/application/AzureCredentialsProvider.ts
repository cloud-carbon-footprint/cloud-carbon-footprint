/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import {
  ApplicationTokenCredentials,
  loginWithServicePrincipalSecret,
} from '@azure/ms-rest-nodeauth'
import config from './ConfigLoader'
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'

export default class AzureCredentialsProvider {
  static async create(): Promise<ApplicationTokenCredentials> {
    const clientId = config().AZURE.authentication.clientId
    const clientSecret = config().AZURE.authentication.clientSecret
    const tenantId = config().AZURE.authentication.tenantId

    switch (config().AZURE.authentication.mode) {
      case 'GCP':
        const clientIdFromGoogle = await this.getGoogleSecret(clientId)
        const clientSecretFromGoogle = await this.getGoogleSecret(clientSecret)
        const tenantIdFromGoogle = await this.getGoogleSecret(tenantId)
        return await loginWithServicePrincipalSecret(
          clientIdFromGoogle,
          clientSecretFromGoogle,
          tenantIdFromGoogle,
        )
      default:
        return await loginWithServicePrincipalSecret(
          clientId,
          clientSecret,
          tenantId,
        )
    }
  }

  static async getGoogleSecret(secretName: string): Promise<string> {
    const client = new SecretManagerServiceClient()
    const name = `projects/${
      config().GCP.BILLING_ACCOUNT_NAME
    }/secrets/${secretName}/versions/latest`

    const [version] = await client.accessSecretVersion({
      name: name,
    })
    return version.payload.data.toString()
  }
}
