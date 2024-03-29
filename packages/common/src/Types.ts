/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  BaseExternalAccountClient,
  Compute,
  JWT,
  UserRefreshClient,
  Impersonated,
} from 'google-auth-library'

export type GoogleAuthClient =
  | Compute
  | JWT
  | UserRefreshClient
  | Impersonated
  | BaseExternalAccountClient

export type AccountDetails = {
  id: string
  name?: string
}

export type AccountDetailsOrIdList = AccountDetails[] | string[]
