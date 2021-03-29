/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
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
    'Create and download a JSON private file for this Service Account to your local filesystem, and make sure to set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable. Learn more about this authentication method [here](https://cloud.google.com/docs/authentication/getting-started)',
  )

  await confirmPrompt(
    'Set up Google Cloud billing data to export to BigQuery. You can find the instructions for this [here](https://cloud.google.com/billing/docs/how-to/export-data-bigquery).',
  )

  // i don't see these consumed in the app, are they needed?
  // env.GCP_TARGET_ACCOUNT_EMAIL = await inputPrompt('Enter GCP account email:')
  // env.GCP_TARGET_ACCOUNT_PRIVATE_KEY = await inputPrompt('Enter GCP account private key:')
  env.GCP_BILLING_ACCOUNT_ID = await inputPrompt('Enter GCP account id:')
  env.GCP_BILLING_ACCOUNT_NAME = await inputPrompt('Enter GCP account name:')
  env.GCP_BIG_QUERY_TABLE = await inputPrompt('Enter BigQuery table name:')

  return env
}
