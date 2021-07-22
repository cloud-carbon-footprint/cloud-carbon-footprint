/*
 * © 2021 Thoughtworks, Inc.
 */

import { confirmPrompt, EnvConfig, inputPrompt } from './common'

export async function GCPSetup(): Promise<EnvConfig> {
  const env: EnvConfig = {}
  env.GCP_USE_BILLING_DATA = 'true'

  await confirmPrompt(
    'Ensure you have a GCP Service Account with the permission to start BigQuery jobs and read Bigquery job results. Learn more about GCP Service Accounts [here](https://cloud.google.com/docs/authentication/getting-started).',
  )

  // does this have to be done separately or can it be part of the .env?
  await confirmPrompt(
    'Create and download a JSON private file for this Service Account to your local filesystem. Learn more about this authentication method [here](https://cloud.google.com/docs/authentication/getting-started)',
  )

  env.GOOGLE_APPLICATION_CREDENTIALS = await inputPrompt(
    'Enter the absolute path to your service account private key file:',
  )

  await confirmPrompt(
    'Set up Google Cloud billing data to export to BigQuery. You can find the instructions for this [here](https://cloud.google.com/billing/docs/how-to/export-data-bigquery).',
  )

  env.GCP_BILLING_PROJECT_ID = await inputPrompt('Enter GCP Project ID:')
  env.GCP_BILLING_PROJECT_NAME = await inputPrompt('Enter GCP Project Name:')
  env.GCP_BIG_QUERY_TABLE = await inputPrompt('Enter BigQuery table name:')

  return env
}
