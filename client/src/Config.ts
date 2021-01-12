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
  AWS: {
    USE_BILLING_DATA?: boolean
  }
  GCP: {
    USE_BILLING_DATA?: boolean
  }
}

const useAWSBillingData = !!process.env.REACT_APP_AWS_USE_BILLING_DATA
const useGCPBillingData = !!process.env.REACT_APP_GCP_USE_BILLING_DATA

const appConfig: ClientConfig = {
  CURRENT_PROVIDERS: [
    { key: 'aws', name: 'AWS' },
    { key: 'gcp', name: 'GCP' },
  ],
  AWS: {
    USE_BILLING_DATA: useAWSBillingData,
  },
  GCP: {
    USE_BILLING_DATA: useGCPBillingData,
  },
}

export default appConfig
