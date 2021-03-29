---
id: azure
title: Azure
---

Your Microsoft Azure account needs to have an App registered and Service Principal with permissions to read billing and usage data from your Subscriptions

1.  Register a new Azure Application via your Azure Portal, under “App Registrations”.

    - You do not need to set a Redirect URI or configure platform Settings. Learn more about how to do this [here.](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

2.  Within this application, go to “Certificates and secrets”, and create a new Client secret.

    - For the next step, you will need to know the client id, client secret and your tenant id.

3.  Configure environmental variables for the api and client.

    - After configuring your credentials, we need to set a number of environmental variables in the app, so it can authenticate with AWS. We use .env files to manage this. Reference [packages/api/.env.template](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/packages/api/.env.template) for a template .env file. Rename this file as .env, optionally remove the comments and then set the environment variables for the “Billing Data” approach. If you are only using one of these cloud providers, you can remove the environment variables associated with the other cloud provider in your `packgages/api/.env` file.

    - There is also a `packages/client/.env` file that allows you to set some configuration for the data range the application requests data for. See [client/.env.template](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/packages/client/.env.template) for a template. Rename this file as .env, optionally remove the comments and then set the environment variables.

    - By default, the client uses AWS, GCP and Azure. If you are only using one of these cloud providers, please update the `appConfig` object in the [client Config file](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/packages/client/src/Config.ts) to only include your provider in the `CURRENT_PROVIDERS` array.

4.  Finally, start up the application:

        yarn start

⚠️ This will incur some cost. Use this sparingly if you wish to test with live data.

DISCLAIMER: If your editor of choice is VS Code, we recommend to use either your native or custom terminal of choice (i.e. iterm) instead. Unexpected authentication issues have occured when starting up the server in VS Code terminals.

### Options for Azure Authentication

By default, the application authenticates with Azure using environment variables set in the api/.env file. However, if you want to store these secrets is Google Secrets Manager we also provide that option, if you want to set the AZURE_AUTH_MODE environment variable to “GCP”.

The authentication mode is set inside [packages/core/src/application/Config.ts](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/packages/core/src/application/Config.ts), and you can see these options being used in [packages/core/src/application/AzureCredentialsProvider.ts](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/packages/core/src/application/AzureCredentialsProvider.ts).

<!-- © 2020 ThoughtWorks, Inc. All rights reserved. -->
