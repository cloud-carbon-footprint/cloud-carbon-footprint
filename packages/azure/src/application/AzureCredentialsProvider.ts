/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  ApplicationTokenCredentials,
  loginWithServicePrincipalSecret,
} from '@azure/ms-rest-nodeauth'
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'

import { configLoader } from '@cloud-carbon-footprint/common'

export default class AzureCredentialsProvider {
  static async create(): Promise<ApplicationTokenCredentials> {
    const clientId = configLoader().AZURE.authentication.clientId
    const clientSecret = configLoader().AZURE.authentication.clientSecret
    const tenantId = configLoader().AZURE.authentication.tenantId

    switch (configLoader().AZURE.authentication.mode) {
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
      configLoader().GCP.BILLING_PROJECT_NAME
    }/secrets/${secretName}/versions/latest`

    const [version] = await client.accessSecretVersion({
      name: name,
    })
    return version.payload.data.toString()
  }
}
