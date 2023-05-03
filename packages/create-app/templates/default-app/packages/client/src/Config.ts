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
  PAGE_LIMIT: string
  BASE_URL: string
  MINIMAL_DATE_AGE: string
  START_DATE: string
  END_DATE: string
  DISABLE_CACHE: boolean
  TEST_MODE: boolean
}

let previousYearOfUsage =
  !!process.env.REACT_APP_PREVIOUS_YEAR_OF_USAGE &&
  process.env.REACT_APP_PREVIOUS_YEAR_OF_USAGE !== 'false'
let groupBy = process.env.REACT_APP_GROUP_BY || 'day'
let pageLimit = process.env.REACT_APP_PAGE_LIMIT || '50000'
let baseUrl = process.env.REACT_APP_BASE_URL || '/api'
let endDate = process.env.REACT_APP_END_DATE
let minDateAge = process.env.REACT_APP_MINIMAL_DATE_AGE || '0'

// For local development / integration testing
if (process.env.REACT_APP_TEST_MODE === 'true') {
  previousYearOfUsage = true
  groupBy = 'month'
  pageLimit = '1000'
  baseUrl = 'http://127.0.0.1:3000/api'
  endDate = null
  minDateAge = '0'
}

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
  GROUP_BY: groupBy,
  PAGE_LIMIT: pageLimit,
  BASE_URL: baseUrl,
  MINIMAL_DATE_AGE: minDateAge,
  START_DATE: process.env.REACT_APP_START_DATE,
  END_DATE: endDate,
  DISABLE_CACHE: process.env.REACT_APP_DISABLE_CACHE === 'true',
  TEST_MODE: process.env.REACT_APP_TEST_MODE === 'true',
}

export default appConfig
