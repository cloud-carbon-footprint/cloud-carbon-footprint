/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import dotenv from 'dotenv'
dotenv.config()

export interface CCFConfig {
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
    accounts: JSON.parse(getAWSAccounts()) || [],
    authentication: {
      mode: 'GCP',
      options: {
        targetRoleName: 'ccf',
        targetRoleSessionName: 'ccf',
        proxyAccountId: process.env.AWS_PROXY_ACCOUNT_ID || '',
        proxyRoleName: process.env.AWS_PROXY_ROLE_NAME || '',
      },
    },
    NAME: 'AWS',
    CURRENT_REGIONS: ['us-east-1', 'us-east-2', 'us-west-1'],
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
