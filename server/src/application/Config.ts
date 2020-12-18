/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import dotenv from 'dotenv'
dotenv.config()

export interface CCFConfig {
  AWS?: {
    USE_BILLING_DATA?: boolean
    BILLING_ACCOUNT_ID?: string
    BILLING_ACCOUNT_NAME?: string
    ATHENA_DB_NAME?: string
    ATHENA_DB_TABLE?: string
    ATHENA_QUERY_RESULT_LOCATION?: string
    ATHENA_REGION?: string
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
    projects?: {
      id: string
      name?: string
    }[]
    authentication?: {
      targetAccountEmail?: string
      targetAccountPrivateKey?: string
    }
  }
  LOGGING_MODE?: string
}

const getAWSAccounts = () => {
  return process.env.AWS_ACCOUNTS ? process.env.AWS_ACCOUNTS : '[]'
}

const getGCPProjects = () => {
  return process.env.GCP_PROJECTS ? process.env.GCP_PROJECTS : '[]'
}

const escapePrivateKey = (privateKey: string) => {
  return privateKey.replace(/\\n/g, '\n')
}

const appConfig: CCFConfig = {
  AWS: {
    USE_BILLING_DATA: !!process.env.AWS_USE_BILLING_DATA,
    BILLING_ACCOUNT_ID: process.env.AWS_BILLING_ACCOUNT_ID || '',
    BILLING_ACCOUNT_NAME: process.env.AWS_BILLING_ACCOUNT_NAME || '',
    ATHENA_DB_NAME: process.env.AWS_ATHENA_DB_NAME || '',
    ATHENA_DB_TABLE: process.env.AWS_ATHENA_DB_TABLE || '',
    ATHENA_QUERY_RESULT_LOCATION: process.env.AWS_ATHENA_QUERY_RESULT_LOCATION || '',
    ATHENA_REGION: 'us-east-1',
    accounts: JSON.parse(getAWSAccounts()) || [],
    authentication: {
      mode: 'GCP',
      options: {
        targetRoleName: process.env.AWS_TARGET_ACCOUNT_ROLE_NAME,
        targetRoleSessionName: process.env.AWS_TARGET_ACCOUNT_ROLE_NAME,
        proxyAccountId: process.env.AWS_PROXY_ACCOUNT_ID || '',
        proxyRoleName: process.env.AWS_PROXY_ROLE_NAME || '',
      },
    },
    NAME: 'AWS',
    CURRENT_REGIONS: [
      'us-east-1',
      'us-east-2',
      'us-west-1',
      'us-west-2',
      'ap-south-1',
      'ap-northeast-2',
      'ap-southeast-1',
      'ap-southeast-2',
      'ap-northeast-1',
      'ca-central-1',
      'eu-central-1',
      'eu-west-1',
      'eu-west-2',
      'eu-west-3',
      'eu-north-1',
      'sa-east-1',
    ],
    CURRENT_SERVICES: [
      {
        key: 'ebs',
        name: 'EBS',
      },
      {
        key: 's3',
        name: 'S3',
      },
      {
        key: 'ec2',
        name: 'EC2',
      },
      {
        key: 'elasticache',
        name: 'ElastiCache',
      },
      {
        key: 'rds',
        name: 'RDS',
      },
      {
        key: 'lambda',
        name: 'Lambda',
      },
    ],
  },
  GCP: {
    projects: JSON.parse(getGCPProjects()) || [],
    NAME: 'GCP',
    CURRENT_REGIONS: ['us-east1', 'us-central1', 'us-west1'],
    CURRENT_SERVICES: [
      {
        key: 'computeEngine',
        name: 'ComputeEngine',
      },
    ],
    authentication: {
      targetAccountEmail: process.env.GCP_TARGET_ACCOUNT_EMAIL || '',
      targetAccountPrivateKey: escapePrivateKey(process.env.GCP_TARGET_ACCOUNT_PRIVATE_KEY) || '',
    },
  },
  LOGGING_MODE: process.env.LOGGING_MODE || '',
}

export default appConfig
