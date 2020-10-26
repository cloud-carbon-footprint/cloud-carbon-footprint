/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { Credentials, config, ChainableTemporaryCredentials } from 'aws-sdk'
import appConfig from '@application/Config'
import CredentialsForGCP from '@application/GCPCredentials'

export default class AWSCredentialsProvider {
  static create(accountId: string): Credentials {
    switch (appConfig.AWS.authentication.mode) {
      case 'GCP':
        return new CredentialsForGCP(
          accountId,
          appConfig.AWS.authentication.options.targetRoleSessionName,
          appConfig.AWS.authentication.options.proxyAccountId,
          appConfig.AWS.authentication.options.proxyRoleName,
        )
      case 'AWS':
        return new ChainableTemporaryCredentials({
          params: {
            RoleArn: `arn:aws:iam::${accountId}:role/${appConfig.AWS.authentication.options.targetRoleSessionName}`,
            RoleSessionName: appConfig.AWS.authentication.options.targetRoleSessionName,
          },
        })
      default:
        return new Credentials(config.credentials)
    }
  }
}
