/*
 * © 2021 Thoughtworks, Inc.
 */

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
  GROUP_BY: string
  BASE_URL: string
}

const previousYearOfUsage =
  !!process.env.REACT_APP_PREVIOUS_YEAR_OF_USAGE &&
  process.env.REACT_APP_PREVIOUS_YEAR_OF_USAGE !== 'false'

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
  GROUP_BY: process.env.REACT_APP_GROUP_BY,
  BASE_URL: process.env.REACT_APP_BASE_URL || '/api',
}

export default appConfig
