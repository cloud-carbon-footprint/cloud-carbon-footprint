---
id: azure
title: Azure
slug: /azure
sidebar_position: 3
---

Your Microsoft Azure account needs to have an App registered and Service Principal with permissions to read billing and usage data from your Subscriptions

1.  Register a new Azure Application via your Azure Portal, under “App Registrations”.

    - You do not need to set a Redirect URI or configure platform Settings. Learn more about how to do this [here.](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

2.  Within this application, go to “Certificates and secrets”, and create a new Client secret.

    - For the next step, you will need to know the client id, client secret and your tenant id.

3.  Give permissions to this application to access subscriptions:

    - Learn more about how to do this [here.](https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-create-service-principal-portal#assign-a-role-to-the-application)

4.  Configure environmental variables for the api and client.

    - After configuring your credentials, we need to set a number of environmental variables in the app, so it can authenticate with AWS. We use .env files to manage this. Reference [packages/api/.env.template](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/api/.env.template) for a template .env file. Rename this file as .env, optionally remove the comments and then set the environment variables for the “Billing Data” approach. If you are only using one of these cloud providers, you can remove the environment variables associated with the other cloud provider in your `packgages/api/.env` file.

    - There is also a `packages/client/.env` file that allows you to set some configuration for the data range the application requests data for. See [client/.env.template](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/client/.env.template) for a template. Rename this file as .env, optionally remove the comments and then set the environment variables.

    - By default, the client uses AWS, GCP and Azure. If you are only using one of these cloud providers, please update the `appConfig` object in the [client Config file](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/client/src/Config.ts) to only include your provider in the `CURRENT_PROVIDERS` array.

5.  Finally, start up the application:

        yarn start

⚠️ This will incur some cost. Use this sparingly if you wish to test with live data.

DISCLAIMER: If your editor of choice is VS Code, we recommend using either your native or custom terminal of choice (i.e. iterm) instead. Unexpected authentication issues have occurred when starting up the server in VS Code terminals.

### Unsupported Usage Types

The application has a file containing supported usage types located [here](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/azure/src/lib/ConsumptionTypes.ts). The current lists consist of types the application has faced, so there are likely to be some types not yet handled. When querying your data, you may come across unsupported types with a warning like this:

`2021-03-31T09:48:38.815Z [ConsumptionManagement] warn: Unexpected usage type for storage service: LRS Snapshots`

If you come across a similar warning message, congratulations! You have found a usage type that the app currently isn’t aware of - this is a great opportunity for you to improve Cloud Carbon Footprint!

The steps to resolve are:

1. Determine the type in question based on the warning message
2. Add the type to the respective list in the `ConsumptionTypes.ts` file
3. Delete `estimates.cache.json` file and restart the application server
4. Submit an issue or pull request with the update

### Unknown Regions

Similar to the supported usage types, a file including all known regions and their aliases is located [here](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/azure/src/lib/AzureRegions.ts). When querying your data, you may come across unknown regions with a warning like this: 

`2023-02-07T11:54:39.875Z [AzureRegions] warn: Found unknown azure region 'EU North', please add it to the AzureRegions.ts file and submit a PR, thank you!`

This has the effect that all resources in this unknown region cannot be assigned to their correct region, as this alias is unknown. To get accurate data and help improve Cloud Carbon Footprint please follow these steps:

1. Determine the region alias in question based on the warning message
2. Add the region alias to the respective region in the `AzureRegions.ts` file
3. Delete `estimates.cache.json` file and restart the application server
4. Submit an issue or pull request with the update

### Options for Azure Authentication

By default, the application authenticates with Azure using environment variables set in the api/.env file. However, if you want to store these secrets is Google Secrets Manager we also provide that option, if you want to set the AZURE_AUTH_MODE environment variable to “GCP”.

The authentication mode is set inside [packages/common/src/Config.ts](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/common/src/Config.ts), and you can see these options being used in [packages/azure/src/application/AzureCredentialsProvider.ts](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/azure/src/application/AzureCredentialsProvider.ts).

<!-- © 2021 Thoughtworks, Inc. -->
