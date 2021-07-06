---
id: configurations-glossary
title: Configurations Glossary
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
| AWS_USE_BILLING_DATA             | true                                    | boolean | Use this to configure the application to query Cost and Usage Reports via AWS Athena. Unset to make this false. Defaults to true. |
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

### Optionally set this to "GCP" or "AWS" if your application is deployed to AWS or GCP:

| Variable             | Example Value         | Type   | Notes                                                                                                                                                                                                                                                                                                                                            |
| -------------------- | --------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AWS_AUTH_MODE        | default               | string | The mode to authenticate with for AWS. Options include: 'AWS': uses [ChainableTemporaryCredentials](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ChainableTemporaryCredentials.html), for deploying to AWS. 'GCP': Uses temporary STS Tokens, for deploying to GCP. 'default': Uses default local AWS profile, for local development. |
| AWS_PROXY_ACCOUNT_ID | your-proxy-account-id | string | The AWS account of the account to proxy/chain from, when app is deployed to GCP.                                                                                                                                                                                                                                                                 |
| AWS_PROXY_ROLE_NAME  | your-proxy-role-name  | string | The AWS role name in the proxy account, to proxy/chain from, when app is deployed to GCP.                                                                                                                                                                                                                                                        |

<br/>

### Variables needed for the Billing Data (Holistic) approach with GCP:

| Variable                       | Example Value                  | Type    | Notes                                                                                                                                                                                                   |
| ------------------------------ | ------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GCP_USE_BILLING_DATA           | true                           | boolean | Use this to configure the application to query Billing Export Data via Google BigQuery. Unset to make this false. Defaults to true.                                                                     |
| GOOGLE_APPLICATION_CREDENTIALS | /path/to/your/credentials.json | string  | The absolute path to your service account private key file. This service account needs to have permission to query Billing Data using BigQuery.                                                         |
| GCP_BIG_QUERY_TABLE            | project.dataset.BQ_table_name  | string  | The name of your BigQuery table configured to consume Billing Export data. See [here](https://cloud.google.com/billing/docs/how-to/bq-examples) for details on how to specify your BigQuery Table Name. |
| GCP_BILLING_PROJECT_ID         | your-project-id                | string  | The GCP Project ID that your service account exists in that has permission to query Billing Data using BigQuery.                                                                                        |
| GCP_BILLING_PROJECT_NAME       | your-project-name              | string  | The name for the GCP Project specified in the previous variable.                                                                                                                                        |

<br/>

### Variables needed for the Cloud Usage API (Higher Accuracy) approach with GCP:

| Variable     | Example Value                                            | Type  | Notes                                                                                                                                                |
| ------------ | -------------------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| GCP_PROJECTS | [{"id":"your-gcp-project-id","name":"Your GCP Project"}] | array | This is array of objects with keys "id" and "name" that match the GCP Projects you want to pull usage data from to run energy/carbon estimation for. |

<br/>

### Variables needed for the Billing Data (Holistic) approach with Azure:

| Variable               | Example Value            | Type    | Notes                                                                                                             |     |
| ---------------------- | ------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------- | --- |
| AZURE_USE_BILLING_DATA | true                     | boolean | Use this to configure the application to query Azure Consumption API. Unset to make this false. Defaults to true. |
| AZURE_CLIENT_ID        | your-azure-client-id     | string  | The Azure Service Principal ID with permission to read the Consumption API from your Subscriptions.               |
| AZURE_CLIENT_SECRET    | your-azure-client-secret | string  | The Azure Service Principal Secret with permission to read the Consumption API from your Subscriptions.           |
| AZURE_TENANT_ID        | your-azure-tenant-id     | string  | Your Azure tenant ID.                                                                                             |

<br/>

### Optionally set this to "GCP" if your Azure credentials are stored in Google Secrets Manager:

| Variable        | Example Value | Type   | Notes                                                                                                                                                                                                                                                 |
| --------------- | ------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AZURE_AUTH_MODE | default       | string | The authentication mode for Azure. Options are: 'GCP' that gets the secrets from Google Secrets Manager, 'default' which using the client id/secret and tent id from your .env file. Requires GCP_BILLING_PROJECT_NAME to be set if using 'GCP' Mode. |

<br/>

### Optionally set this to group timestamps from queried data to help with performance:

| Variable               | Value | Notes  | Notes                                                                                             |
| ---------------------- | ----- | ------ | ------------------------------------------------------------------------------------------------- |
| GROUP_QUERY_RESULTS_BY | day   | string | Value to set how the cloud provider queries should return data (e.g. day/week/month/quarter/year) |

<br/>

### Optionally set this to store cache file in Google Cloud Storage

| Variable              | Example Value  | Type   | Notes                                                                               |
| --------------------- | -------------- | ------ | ----------------------------------------------------------------------------------- |
| CACHE_MODE            | GCS            | string | Set with 'GCS' to use this option or leave it empty to use the default.             |
| GCS_CACHE_BUCKET_NAME | my-bucket-name | string | Is the name of you Google Cloud Storage bucket where the cache file will be stored. |

<br/>

## Client Package

| Variable                         | Example Value | Type    | Notes                                                                                                                                               |
| -------------------------------- | ------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| REACT_APP_PREVIOUS_YEAR_OF_USAGE | true          | boolean | Use this to ensure the application requests usage data from the entire previous calendar year to today. Unset to make this false. Defaults to true. |

<br/>

### Optionally set the date range to query estimation data for, starting from today and going back a certain range.

| Variable                   | Example Value | Type   | Notes                                                                                            |
| -------------------------- | ------------- | ------ | ------------------------------------------------------------------------------------------------ |
| REACT_APP_DATE_RANGE_VALUE | 1             | number | The quantity of REACT_APP_DATE_RANGE_TYPE to be used.                                            |
| REACT_APP_DATE_RANGE_TYPE  | year          | string | The type of time period to be used. Values can be day(s), week(s), month(s), quarter(s), year(s) |
