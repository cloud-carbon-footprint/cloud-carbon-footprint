/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  BaseExternalAccountClient,
  Compute,
  JWT,
  UserRefreshClient,
} from 'google-auth-library'

export type GoogleAuthClient =
  | Compute
  | JWT
  | UserRefreshClient
  | BaseExternalAccountClient
