/*
 * © 2021 Thoughtworks, Inc. All rights reserved.
 */

import dotenv from 'dotenv'
dotenv.config()

export interface ClientConfig {
  CURRENT_PROVIDERS: {
    key: string
    name: string
  }[]
  PREVIOUS_YEAR_OF_USAGE: boolean
  DATE_RANGE: {
    VALUE: string
    TYPE: string
  }
  END_DATE: string | null
}

const previousYearOfUsage = !!process.env.REACT_APP_PREVIOUS_YEAR_OF_USAGE

const appConfig: ClientConfig = {
  CURRENT_PROVIDERS: [
    { key: 'aws', name: 'AWS' },
    { key: 'gcp', name: 'GCP' },
    { key: 'azure', name: 'Azure' },
  ],
  PREVIOUS_YEAR_OF_USAGE: previousYearOfUsage,
  DATE_RANGE: {
    VALUE: process.env.REACT_APP_DATE_RANGE_VALUE || '12',
    TYPE: process.env.REACT_APP_DATE_RANGE_TYPE || 'months',
  },
  END_DATE: process.env.REACT_APP_END_DATE || null,
}

export default appConfig
