/*
 * © 2021 ThoughtWorks, Inc.
 */

import {
  Credentials,
  config as awsConfig,
  ChainableTemporaryCredentials,
} from 'aws-sdk'
import { configLoader } from '@cloud-carbon-footprint/common'
import GCPCredentials from './GCPCredentials'

export default class AWSCredentialsProvider {
  static create(accountId: string): Credentials {
    switch (configLoader().AWS.authentication.mode) {
      case 'GCP':
        return new GCPCredentials(
          accountId,
          configLoader().AWS.authentication.options.targetRoleSessionName,
          configLoader().AWS.authentication.options.proxyAccountId,
          configLoader().AWS.authentication.options.proxyRoleName,
        )
      case 'AWS':
        return new ChainableTemporaryCredentials({
          params: {
            RoleArn: `arn:aws:iam::${accountId}:role/${
              configLoader().AWS.authentication.options.targetRoleSessionName
            }`,
            RoleSessionName:
              configLoader().AWS.authentication.options.targetRoleSessionName,
          },
        })
      default:
        return new Credentials(awsConfig.credentials)
    }
  }
}
