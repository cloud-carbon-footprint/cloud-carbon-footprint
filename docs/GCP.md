# GCP - running the web-app with real data

Your Google Cloud Account needs to be configured to export Billing Data to BigQuery, and the application needs to authenticate with GCP to run queries on that data in BigQuery.

1. Ensure you have a GCP Service Account with the permission to start BigQuery jobs and read Bigquery job results. Learn more about GCP Service Accounts [here](https://cloud.google.com/docs/authentication/getting-started).
1. Create and download a JSON private file for this Service Account to your local filesystem, and make sure to set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable. Learn more about this authentication method [here](https://cloud.google.com/docs/authentication/getting-started).
   - Note: make sure you use the full path for this environment variable, e.g. `/Users/<user>/path/to/credentials-file.json` 
1. Set up Google Cloud billing data to export to BigQuery. You can find the instructions for this [here](https://cloud.google.com/billing/docs/how-to/export-data-bigquery).
1. Configure environmental variables for the api and client.
    - After configuring your credentials, we need to set a number of environmental variables in the app, so it can authenticate successfully. We use .env files to manage this. Reference [packages/api/.env.template](packages/api/.env.template) for a template .env file. Rename this file as .env, optionally remove the comments and then set the environment variables for the “Billing Data'' approach. By default, the api has configuration for both AWS, GCP and Azure. If you are only using one of these cloud providers, you can remove the environment variables associated with the other cloud provider in your `packgages/api/.env` file.
    - There is also a `packages/client/.env` file that allows you to set some configuration for the data range the application requests data for. See [client/.env.template](packages/client/.env.template) for a template. Rename this file as .env, optionally remove the comments and then set the environment variables.
    - By default, the client uses both AWS, GCP and Azure. If you are only using one of these cloud providers, please update the `appConfig` object in the [client Config file](packages/client/src/Config.ts) to only include your provider in the `CURRENT_PROVIDERS` array.
1. Finally, start up the application

```
yarn start
```

> :warning: **This will incure cost**: Use this sparingly if you wish to test with live data

> _DISCLAIMER_: If your editior of choice is VS Code, **_we recommend to use either your native or custom terminal of choice (i.e. iterm)_** instead. Unexpected authentication issues have occured when starting up the server in VS Code terminals.

## Options for GCP Authentication

We currently only support authentication with Google via the `GOOGLE_APPLICATION_CREDENTIALS` environment variable. 
