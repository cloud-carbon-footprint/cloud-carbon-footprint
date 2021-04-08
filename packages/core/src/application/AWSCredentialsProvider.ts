/*
 * © 2021 ThoughtWorks, Inc.
 */

import {
  Credentials,
  config as awsConfig,
  ChainableTemporaryCredentials,
} from 'aws-sdk'
import config from './ConfigLoader'
import GCPCredentials from './GCPCredentials'

export default class AWSCredentialsProvider {
  static create(accountId: string): Credentials {
    switch (config().AWS.authentication.mode) {
      case 'GCP':
        return new GCPCredentials(
          accountId,
          config().AWS.authentication.options.targetRoleSessionName,
          config().AWS.authentication.options.proxyAccountId,
          config().AWS.authentication.options.proxyRoleName,
        )
      case 'AWS':
        return new ChainableTemporaryCredentials({
          params: {
            RoleArn: `arn:aws:iam::${accountId}:role/${
              config().AWS.authentication.options.targetRoleSessionName
            }`,
            RoleSessionName: config().AWS.authentication.options
              .targetRoleSessionName,
          },
        })
      default:
        return new Credentials(awsConfig.credentials)
    }
  }
}
