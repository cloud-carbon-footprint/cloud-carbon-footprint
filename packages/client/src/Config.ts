/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import dotenv from 'dotenv'
dotenv.config()

export interface ClientConfig {
  CURRENT_PROVIDERS: {
    key: string
    name: string
  }[]
  PREVIOUS_YEAR_OF_USAGE: boolean
}

const previousYearOfUsage = !!process.env.REACT_APP_PREVIOUS_YEAR_OF_USAGE

const appConfig: ClientConfig = {
  CURRENT_PROVIDERS: [
    { key: 'aws', name: 'AWS' },
    { key: 'gcp', name: 'GCP' },
    { key: 'azure', name: 'Azure' },
  ],
  PREVIOUS_YEAR_OF_USAGE: previousYearOfUsage,
}

export default appConfig
