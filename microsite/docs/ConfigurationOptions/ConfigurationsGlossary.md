---
id: configurations-glossary
title: Configurations Glossary
slug: /configurations-glossary
sidebar_position: 4
---

## Api/cli Packages

### Variables for both estimation approaches with AWS:

| Variable                     | Example Value                 | Type   | Notes                                                                                                                                                                                                                          |
| ---------------------------- | ----------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AWS_TARGET_ACCOUNT_ROLE_NAME | your-target-account-role-name | string | This variable is needed if you are authenticating with [ChainableTemporaryCredentials](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ChainableTemporaryCredentials.html). E.g. from one role to the authorized role. |

<br/>

### Variables needed for the Billing Data (Holistic) approach with AWS:

| Variable                         | Example Value                           | Type    | Notes                                                                                                                             |
| -------------------------------- | --------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------- |
| AWS_INCLUDE_ESTIMATES            | true                                    | boolean | Use this to include AWS estimations. Unset to make this false. Defaults to true.                                                  |
| AWS_USE_BILLING_DATA             | true                                    | boolean | Use this to configure the application to query Cost and Usage Reports via AWS Athena.                                             |
| AWS_ATHENA_DB_NAME               | your-athena-db-name                     | string  | The name of your AWS Athena Database with Cost and Usage Reports data                                                             |
| AWS_ATHENA_DB_TABLE              | your-athena-db-table                    | string  | The name of your AWS Athena Table with Cost and Usage Reports data                                                                |
| AWS_ATHENA_REGION                | your-athena-region                      | string  | The region your AWS Athena Database/Table were created in.                                                                        |
| AWS_ATHENA_QUERY_RESULT_LOCATION | s3://your-athena-query-results-location | string  | The AWS S3 Bucket that you want your Athena query results to reside in. Must be prefixed with "s3://".                            |
| AWS_BILLING_ACCOUNT_ID           | your-billing-account-id                 | string  | Your AWS Billing Account ID, where Cost and Usage Reports are configured.                                                         |
| AWS_BILLING_ACCOUNT_NAME         | your-billing-account-name               | string  | The name of your AWS Billing Account. This can be any value.                                                                      |

<br/>

### Variables needed for the Cloud Usage API (Higher Accuracy) approach with AWS:

| Variable     | Example Value                                        | Type  | Notes                                                                                                                                                |     |
| ------------ | ---------------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| AWS_ACCOUNTS | [{"id":"your-account-id","name":"Your AWS Account"}] | array | This is array of objects with keys "id" and "name" that match the AWS accounts you want to pull usage data from to run energy/carbon estimation for. |

<br/>

### Optionally set these AWS variables:

| Variable                     | Example Value            | Type   | Notes                                                                                                                                                                                                                                                                                                                                            |
|------------------------------|--------------------------|--------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| AWS_AUTH_MODE                | default                  | string | The mode to authenticate with for AWS. Options include: 'AWS': uses [ChainableTemporaryCredentials](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ChainableTemporaryCredentials.html), for deploying to AWS. 'GCP': Uses temporary STS Tokens, for deploying to GCP. 'default': Uses default local AWS profile, for local development. |
| AWS_PROXY_ACCOUNT_ID         | your-proxy-account-id    | string | The AWS account of the account to proxy/chain from, when app is deployed to GCP.                                                                                                                                                                                                                                                                 |
| AWS_PROXY_ROLE_NAME          | your-proxy-role-name     | string | The AWS role name in the proxy account, to proxy/chain from, when app is deployed to GCP.                                                                                                                                                                                                                                                        |
| AWS_RECOMMENDATIONS_SERVICE  | ComputeOptimizer         | string | The AWS service used to get recommendations from. Options include: "RightSizing", "ComputeOptimizer" or "All". Default is "Rightsizing".                                                                                                                                                                                                         |
| AWS_COMPUTE_OPTIMIZER_BUCKET | your-central-bucket-name | string | The name of the AWS bucket in which Compute Optimizer recommendations exist. This is only needed id "ComputeOptimizer" or "All" is configured for the `AWS_RECOMMENDATIONS_SERVICE` variable.                                                                                                                                                    |


<br/>

### Variables needed for the Billing Data (Holistic) approach with GCP:

| Variable                       | Example Value                  | Type    | Notes                                                                                                                                                                                                                                                                                                 |
|--------------------------------|--------------------------------|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| GCP_INCLUDE_ESTIMATES          | true                           | boolean | Use this to include GCP estimations. Unset to make this false. Defaults to true.                                                                                                                                                                                                                      |
| GCP_USE_BILLING_DATA           | true                           | boolean | Use this to configure the application to query Billing Export Data via Google BigQuery.                                                                                                                                                                                                               |
| GOOGLE_APPLICATION_CREDENTIALS | /path/to/your/credentials.json | string  | The absolute path to your service account private key file. This service account needs to have permission to query Billing Data using BigQuery.                                                                                                                                                       |
| GCP_BIG_QUERY_TABLE            | project.dataset.BQ_table_name  | string  | The name of your BigQuery table configured to consume Billing Export data in the format: `PROJECT_ID.DATASET_NAME.TABLE_NAME`. Don't forget to replace the colon in the table id if you copy it from BigQuery. See [here](https://cloud.google.com/billing/docs/how-to/bq-examples) for more details. |
| GCP_BILLING_PROJECT_ID         | your-project-id                | string  | The GCP Project ID that your service account exists in that has permission to query Billing Data using BigQuery.                                                                                                                                                                                      |
| GCP_BILLING_PROJECT_NAME       | your-project-name              | string  | The name for the GCP Project specified in the previous variable.                                                                                                                                                                                                                                      |

<br/>

### Variables needed for the Cloud Usage API (Higher Accuracy) approach with GCP:

| Variable     | Example Value                                            | Type  | Notes                                                                                                                                                |
| ------------ | -------------------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| GCP_PROJECTS | [{"id":"your-gcp-project-id","name":"Your GCP Project"}] | array | This is array of objects with keys "id" and "name" that match the GCP Projects you want to pull usage data from to run energy/carbon estimation for. |

<br/>

### Optionally set these GCP variables:

| Variable                                 | Example Value | Type    | Notes                                                                                                                                                                                                                                                                                                                                                                                           |
|------------------------------------------|---------------|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| GCP_USE_CARBON_FREE_ENERGY_PERCENTAGE    | true          | boolean | Setting this to true will change the emissions factors used by the application to take into account [Google's Carbon Free Energy percentage](https://cloud.google.com/sustainability/region-carbon) in each region. For example in us-central1, the grid emissions factor is 494 gCO2eq/kWh with CFE% of 93%. With this option set to true, the application would instead use 31.78 gCO2eq/kWh. |
| GCP_VCPUS_PER_GKE_CLUSTER                | 3             | number  | Use this to configure the average number of vCPUs the application should use to estimate energy consumption of Kubernetes Engine clusters. If unset, defaults to 3, which is the default number of vCPUs provisioned.                                                                                                                                                                           |
| GCP_VCPUS_PER_CLOUD_COMPOSER_ENVIRONMENT | 14            | number  | Use this to configure the average number of vCPUs the application should use to estimate energy consumption of Cloud Composer Environments. If unset, defaults to 14, which is the number of vCPUs provisioned for a medium sized environment.                                                                                                                                                  |

<br/>

### Variables needed for the Billing Data (Holistic) approach with Azure:

| Variable                | Example Value            | Type    | Notes                                                                                                             |     |
| ----------------------- | ------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------- | --- |
| AZURE_INCLUDE_ESTIMATES | true                     | boolean | Use this to include GCP estimations. Unset to make this false. Defaults to true.                                  |
| AZURE_USE_BILLING_DATA  | true                     | boolean | Use this to configure the application to query Azure Consumption API.                                             |
| AZURE_CLIENT_ID         | your-azure-client-id     | string  | The Azure Service Principal ID with permission to read the Consumption API from your Subscriptions.               |
| AZURE_CLIENT_SECRET     | your-azure-client-secret | string  | The Azure Service Principal Secret with permission to read the Consumption API from your Subscriptions.           |
| AZURE_TENANT_ID         | your-azure-tenant-id     | string  | Your Azure tenant ID.                                                                                             |

<br/>

### Optionally set this to "GCP" if your Azure credentials are stored in Google Secrets Manager:

| Variable        | Example Value | Type   | Notes                                                                                                                                                                                                                                                 |
| --------------- | ------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AZURE_AUTH_MODE | default       | string | The authentication mode for Azure. Options are: 'GCP' that gets the secrets from Google Secrets Manager, 'default' which using the client id/secret and tent id from your .env file. Requires GCP_BILLING_PROJECT_NAME to be set if using 'GCP' Mode. |

<br/>

### Optionally set this to store cache file in Google Cloud Storage

| Variable              | Example Value  | Type   | Notes                                                                               |
| --------------------- | -------------- | ------ | ----------------------------------------------------------------------------------- |
| CACHE_MODE            | GCS            | string | Set with 'GCS' to use this option or leave it empty to use the default.             |
| GCS_CACHE_BUCKET_NAME | my-bucket-name | string | Is the name of you Google Cloud Storage bucket where the cache file will be stored. |

<br/>

### Optionally set these custom configurations for On-Premise calculations

| Variable              | Example Value  | Type   | Notes                                                                               |
| --------------------- | -------------- | ------ | ----------------------------------------------------------------------------------- |
| ON_PREMISE_CPU_UTILIZATION_SERVER | 40 | number | For on-premise servers, provides an average value for cpu utilization.            |
| ON_PREMISE_CPU_UTILIZATION_LAPTOP | 40 | number | For on-premise laptops, provides an average value for cpu utilization.   |
| ON_PREMISE_CPU_UTILIZATION_DESKTOP | 40 | number | For on-premise desktops, provides an average value for cpu utilization.   |
| ON_PREMISE_AVG_WATTS_SERVER | 300 | number | For on-premise servers, provides an average value for average watts.   |
| ON_PREMISE_AVG_WATTS_LAPTOP | 300 | number | For on-premise laptops, provides an average value for average watts. |
| ON_PREMISE_AVG_WATTS_DESKTOP | 300 | number | For on-premise desktops, provides an average value for average watts. |

<br/>

### Optionally set these variables to configure CORS

| Varibale          | Example Value                            | Type    | Notes                                                                                                      |
|-------------------|------------------------------------------|---------|------------------------------------------------------------------------------------------------------------|
| ENABLE_CORS       | true                                     | boolean | Enables default CORS headers on all API requests. By default all origins, methods and headers are allowed. |
| CORS_ALLOW_ORIGIN | https://example.com,https://example2.com | string  | A list of one or more origins to allow for CORS requests, comma separated.                                 |

<br />

## Client Package - all variables are optional

| Variable                         | Example Value           | Type    | Notes                                                                                                                                               |
|----------------------------------|-------------------------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| REACT_APP_PREVIOUS_YEAR_OF_USAGE | true                    | boolean | Use this to ensure the application requests usage data from the entire previous calendar year to today. Unset to make this false. Defaults to true. |
| REACT_APP_GROUP_BY               | month                   | string  | Value to set how the cloud provider queries should return data (e.g. day/week/month/quarter/year). Defaults to day.                                 |
| REACT_APP_DATE_RANGE_VALUE       | 1                       | number  | The quantity of REACT_APP_DATE_RANGE_TYPE to be used.                                                                                               |
| REACT_APP_DATE_RANGE_TYPE        | year                    | string  | The type of time period to be used. Values can be day(s), week(s), month(s), quarter(s), year(s)                                                    |
| REACT_APP_MINIMAL_DATE_AGE       | 1                       | number  | The amount of days to subtract from current date as end date.                                                                                       |
| REACT_APP_BASE_URL               | https://example.com/api | string  | The base URL used to make API requests.                                                                                                             |