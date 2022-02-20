/*
 * © 2021 Thoughtworks, Inc.
 */
import fs from 'fs'
import dotenv from 'dotenv'
import {
  AWS_DEFAULT_RECOMMENDATIONS_SERVICE,
  AWS_RECOMMENDATIONS_SERVICES,
} from './RecommendationsService'
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
    RECOMMENDATIONS_SERVICE: AWS_RECOMMENDATIONS_SERVICES
    COMPUTE_OPTIMIZER_BUCKET: string
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
    USE_CARBON_FREE_ENERGY_PERCENTAGE?: boolean
    USE_BILLING_DATA?: boolean
    BIG_QUERY_TABLE?: string
    BILLING_PROJECT_ID?: string
    BILLING_PROJECT_NAME?: string
    CACHE_BUCKET_NAME?: string
    VCPUS_PER_CLOUD_COMPOSER_ENVIRONMENT?: number
    VCPUS_PER_GKE_CLUSTER?: number
  }
  AZURE?: {
    USE_BILLING_DATA?: boolean
    authentication?: {
      mode: string
      clientId?: string
      clientSecret?: string
      tenantId?: string
    }
  }
  LOGGING_MODE?: string
  GROUP_QUERY_RESULTS_BY?: GroupBy
  CACHE_MODE?: string
}

export enum GroupBy {
  day = 'day',
  week = 'week',
  month = 'month',
  quarter = 'quarter',
  year = 'year',
}

export type QUERY_DATE_TYPES = {
  [key in GroupBy]: string
}

const getAWSAccounts = () => {
  return process.env.AWS_ACCOUNTS ? process.env.AWS_ACCOUNTS : '[]'
}

const getGCPProjects = () => {
  return process.env.GCP_PROJECTS ? process.env.GCP_PROJECTS : '[]'
}

// This function allows support for using Docker Secrets.
const getEnvVar = (envVar: string): string => {
  try {
    return fs.readFileSync(`/run/secrets/${envVar}`, 'utf8').replace('\n', '')
  } catch (err) {
    return process.env[envVar]
  }
}

export const appConfig: CCFConfig = {
  AWS: {
    USE_BILLING_DATA:
      !!process.env.AWS_USE_BILLING_DATA &&
      process.env.AWS_USE_BILLING_DATA !== 'false',
    BILLING_ACCOUNT_ID: getEnvVar('AWS_BILLING_ACCOUNT_ID') || '',
    BILLING_ACCOUNT_NAME: getEnvVar('AWS_BILLING_ACCOUNT_NAME') || '',
    ATHENA_DB_NAME: getEnvVar('AWS_ATHENA_DB_NAME') || '',
    ATHENA_DB_TABLE: getEnvVar('AWS_ATHENA_DB_TABLE') || '',
    ATHENA_QUERY_RESULT_LOCATION:
      getEnvVar('AWS_ATHENA_QUERY_RESULT_LOCATION') || '',
    ATHENA_REGION: getEnvVar('AWS_ATHENA_REGION'),
    accounts: JSON.parse(getAWSAccounts()) || [],
    authentication: {
      mode: getEnvVar('AWS_AUTH_MODE') || 'default',
      options: {
        targetRoleName: getEnvVar('AWS_TARGET_ACCOUNT_ROLE_NAME'),
        proxyAccountId: getEnvVar('AWS_PROXY_ACCOUNT_ID') || '',
        proxyRoleName: getEnvVar('AWS_PROXY_ROLE_NAME') || '',
      },
    },
    NAME: 'AWS',
    RECOMMENDATIONS_SERVICE:
      AWS_RECOMMENDATIONS_SERVICES[
        getEnvVar('AWS_RECOMMENDATIONS_SERVICE') as AWS_RECOMMENDATIONS_SERVICES
      ] || AWS_DEFAULT_RECOMMENDATIONS_SERVICE,
    COMPUTE_OPTIMIZER_BUCKET: getEnvVar('AWS_COMPUTE_OPTIMIZER_BUCKET') || '',
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
    CURRENT_REGIONS: [
      'us-east1',
      'us-central1',
      'us-west1',
      'europe-west1',
      'europe-west2',
      'europe-west3',
    ],
    CURRENT_SERVICES: [
      {
        key: 'computeEngine',
        name: 'ComputeEngine',
      },
    ],
    USE_CARBON_FREE_ENERGY_PERCENTAGE:
      !!process.env.GCP_USE_CARBON_FREE_ENERGY_PERCENTAGE &&
      process.env.GCP_USE_CARBON_FREE_ENERGY_PERCENTAGE !== 'false',
    USE_BILLING_DATA:
      !!process.env.GCP_USE_BILLING_DATA &&
      process.env.GCP_USE_BILLING_DATA !== 'false',
    VCPUS_PER_CLOUD_COMPOSER_ENVIRONMENT:
      parseFloat(getEnvVar('GCP_VCPUS_PER_CLOUD_COMPOSER_ENVIRONMENT')) || 14, // Number of vCPUs in medium environment size
    VCPUS_PER_GKE_CLUSTER:
      parseFloat(getEnvVar('GCP_VCPUS_PER_GKE_CLUSTER')) || 3, // Number of vCPUs with default node configuration
    BIG_QUERY_TABLE: getEnvVar('GCP_BIG_QUERY_TABLE') || '',
    BILLING_PROJECT_ID: getEnvVar('GCP_BILLING_PROJECT_ID') || '',
    BILLING_PROJECT_NAME: getEnvVar('GCP_BILLING_PROJECT_NAME') || '',
    CACHE_BUCKET_NAME: getEnvVar('GCS_CACHE_BUCKET_NAME') || '',
  },
  AZURE: {
    USE_BILLING_DATA:
      !!process.env.AZURE_USE_BILLING_DATA &&
      process.env.AZURE_USE_BILLING_DATA !== 'false',
    authentication: {
      mode: getEnvVar('AZURE_AUTH_MODE') || 'default',
      clientId: getEnvVar('AZURE_CLIENT_ID') || '',
      clientSecret: getEnvVar('AZURE_CLIENT_SECRET') || '',
      tenantId: getEnvVar('AZURE_TENANT_ID') || '',
    },
  },
  LOGGING_MODE: process.env.LOGGING_MODE || '',
  GROUP_QUERY_RESULTS_BY:
    GroupBy[
      (process.env.GROUP_QUERY_RESULTS_BY || 'day') as keyof typeof GroupBy
    ],
  CACHE_MODE: getEnvVar('CACHE_MODE') || '',
}

export default appConfig
