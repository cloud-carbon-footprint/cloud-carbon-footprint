---
id: gcp
title: GCP
---

Your Google Cloud Account needs to be configured to export Billing Data to BigQuery, and the application needs to authenticate with GCP to run queries on that data in BigQuery.

1. Ensure you have a GCP Service Account with the permission to start BigQuery jobs and read Bigquery job results. Learn more about GCP Service Accounts [here.](https://cloud.google.com/iam/docs/service-accounts)

2. Create and download a JSON private file for this Service Account to your local filesystem, and make sure to set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable. Learn more about this authentication method [here.](https://cloud.google.com/docs/authentication/getting-started)

   - Note: make sure you use the full path for this environment variable, eg `/Users/<user>/path/to/credential`

3. Set up Google Cloud billing data to export to BigQuery. You can find the instructions for this [here.](https://cloud.google.com/billing/docs/how-to/export-data-bigquery)

4. Configure environmental variables for the api and client.

   - After configuring your credentials, we need to set a number of environmental variables in the app, so it can authenticate. We use .env files to manage this. Reference [packages/api/.env.template](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/packages/api/.env.template) for a template .env file. Rename this file as .env, optionally remove the comments and then set the environment variables for the “Billing Data'' approach. If you are only using one of these cloud providers, you can remove the environment variables associated with the other cloud provider in your `packgages/api/.env` file.

   - There is also a `packages/client/.env` file that is required to be set if the application is being deployed behind Okta. See [client/.env.template](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/packages/client/.env.template) for a template. Rename this file as .env, optionally remove the comments and then set the environment variables.

   - By default, the client uses AWS, GCP and Azure. If you are only using one of these cloud providers, please update the `appConfig` object in the [client Config file](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/packages/client/src/Config.ts) to only include your provider in the `CURRENT_PROIVDERS` array.

5. Finally, start up the application:

   `yarn start`

⚠️ This will incur some cost. Use this sparingly if you wish to test with live data.

DISCLAIMER: If your editor of choice is VS Code, we recommend to use either your native or custom terminal of choice (i.e. iterm) instead. Unexpected authentication issues have occured when starting up the server in VS Code terminals.

### Options for Google Authentication

We currently only support authentication with Google via the `GOOGLE_APPLICATION_CREDENTIALS` environment variable.

<!-- © 2020 ThoughtWorks, Inc. All rights reserved. -->
