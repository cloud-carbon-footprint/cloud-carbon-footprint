/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  fromTemporaryCredentials,
  fromInstanceMetadata,
  fromContainerMetadata,
  fromNodeProviderChain,
} from '@aws-sdk/credential-providers'
import { Provider } from '@aws-sdk/types'
import { AwsCredentialIdentity } from '@aws-sdk/types'
import { configLoader } from '@cloud-carbon-footprint/common'
import GCPCredentials from './GCPCredentials'

export default class AWSCredentialsProvider {
  static create(accountId: string): Provider<AwsCredentialIdentity> {
    const auth = configLoader().AWS.authentication

    switch (auth.mode) {
      case 'GCP':
        return new GCPCredentials(
          accountId,
          auth.options.targetRoleName,
          auth.options.proxyAccountId,
          auth.options.proxyRoleName,
        ).getProvider()

      case 'AWS': {
        const partition = configLoader().AWS.IS_AWS_GLOBAL ? 'aws' : 'aws-cn'
        const roleName = auth.options.targetRoleName

        return fromTemporaryCredentials({
          params: {
            RoleArn: `arn:${partition}:iam::${accountId}:role/${roleName}`,
            RoleSessionName: roleName,
          },
        })
      }

      case 'EC2-METADATA':
        return fromInstanceMetadata({
          timeout: 5000,
          maxRetries: 10,
        })

      case 'ECS-METADATA':
        return fromContainerMetadata({
          timeout: 5000,
          maxRetries: 10,
        })

      default:
        return fromNodeProviderChain()
    }
  }
}
