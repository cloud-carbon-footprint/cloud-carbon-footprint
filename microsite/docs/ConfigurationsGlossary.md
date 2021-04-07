---
id: configurations-glossary
title: Configurations Glossary
---

## Api Package

### Variables needed for both estimation approaches with AWS:

| Variable                     | Value                         | Notes             |
| ---------------------------- | ----------------------------- | ----------------- |
| AWS_TARGET_ACCOUNT_ROLE_NAME | your-target-account-role-name | (e.g. ccf-athena) |

<br/>

### Variables needed for the Billing Data (Holistic) approach with AWS:

| Variable                         | Value                                   | Notes   |
| -------------------------------- | --------------------------------------- | ------- |
| AWS_USE_BILLING_DATA             | true                                    | boolean |
| AWS_ATHENA_DB_NAME               | your-athena-db-name                     | string  |
| AWS_ATHENA_DB_TABLE              | your-athena-db-table                    | string  |
| AWS_ATHENA_REGION                | your-athena-region                      | string  |
| AWS_ATHENA_QUERY_RESULT_LOCATION | s3://your-athena-query-results-location | string  |
| AWS_BILLING_ACCOUNT_ID           | your-billing-account-id                 | string  |
| AWS_BILLING_ACCOUNT_NAME         | your-billing-account-name               | string  |

<br/>

### Variables needed for the Cloud Usage API (Higher Accuracy) approach with AWS:

| Variable     | Value                                                | Notes |
| ------------ | ---------------------------------------------------- | ----- |
| AWS_ACCOUNTS | [{"id":"your-account-id","name":"Your AWS Account"}] | array |

<br/>

### Optionally set this to "GCP" or "AWS" if your application is deployed to AWS or GCP:

| Variable             | Value                 | Notes                                                               |
| -------------------- | --------------------- | ------------------------------------------------------------------- |
| AWS_AUTH_MODE        | default               | string                                                              |
| AWS_PROXY_ACCOUNT_ID | your-proxy-account-id | Only needed for AWS_AUTH_MODE 'GCP', string (e.g. deploying to GCP) |
| AWS_PROXY_ROLE_NAME  | your-proxy-role-name  | Only needed for AWS_AUTH_MODE 'GCP', string (e.g. deploying to GCP) |

<br/>

### Variables needed for the Billing Data (Holistic) approach with GCP:

| Variable                 | Value                     | Notes   |
| ------------------------ | ------------------------- | ------- |
| GCP_USE_BILLING_DATA     | true                      | boolean |
| GCP_BIG_QUERY_TABLE      | your-billing-export-table | string  |
| GCP_BILLING_ACCOUNT_ID   | your-billing-account-id   | string  |
| GCP_BILLING_ACCOUNT_NAME | billing-account-name      | string  |

<br/>

### Variables needed for the Cloud Usage API (Higher Accuracy) approach with GCP:

| Variable     | Value                                                    | Notes |
| ------------ | -------------------------------------------------------- | ----- |
| GCP_PROJECTS | [{"id":"your-gcp-project-id","name":"Your GCP Project"}] | array |

<br/>

### Variables needed for the Billing Data (Holistic) approach with Azure:

| Variable               | Value                    | Notes   |
| ---------------------- | ------------------------ | ------- |
| AZURE_USE_BILLING_DATA | true                     | boolean |
| AZURE_CLIENT_ID        | your-azure-client-id     | string  |
| AZURE_CLIENT_SECRET    | your-azure-client-secret | string  |
| AZURE_TENANT_ID        | your-azure-tenant-id     | string  |

<br/>

### Optionally set this to "GCP" if your Azure credentials are stored in Google Secrets Manager:

| Variable        | Value   | Notes  |
| --------------- | ------- | ------ |
| AZURE_AUTH_MODE | default | string |

<br/>

### Optionally set this to group timestamps from queried data to help with performance:

| Variable               | Value | Notes                                     |
| ---------------------- | ----- | ----------------------------------------- |
| GROUP_QUERY_RESULTS_BY | day   | string (e.g. day/week/month/quarter/year) |

<br/>

## Client Package

### Set this to true to ensure the application requests usage data from the entire previous calendar year to today:

| Variable                         | Value | Notes   |
| -------------------------------- | ----- | ------- |
| REACT_APP_PREVIOUS_YEAR_OF_USAGE | true  | boolean |

<br/>

### Optionally set the date range to query the data starting back in a time span:

| Variable                   | Value | Notes                                                        |
| -------------------------- | ----- | ------------------------------------------------------------ |
| REACT_APP_DATE_RANGE_VALUE | 1     | number                                                       |
| REACT_APP_DATE_RANGE_TYPE  | year  | string (e.g. day(s), week(s), month(s), quarter(s), year(s)) |
