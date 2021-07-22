/*
 * © 2021 ThoughtWorks, Inc.
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
