/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import configFile from '@application/Config'

export default function config(): CCFConfig {
  return configFile
}

interface CCFConfig {
  AWS?: {
    NAME: string
    CURRENT_SERVICES: { key: string; name: string }[]
    CURRENT_REGIONS: string[]
    accounts?: {
      id: string
      name?: string
    }[]
    authentication?: {
      mode: string
      options?: Record<string, string>
    }
  }
  GCP?: {
    NAME: string
    CURRENT_SERVICES: { key: string; name: string }[]
    CURRENT_REGIONS: string[]
  }
}
