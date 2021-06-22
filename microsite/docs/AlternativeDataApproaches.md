---
id: alternative-data-approaches
title: Alternative Data Approaches
---

We support two approaches to gathering usage data for different cloud providers.

By default, we query AWS Cost and Usage Reports with Amazon Athena, GCP Billing Export Table using BigQuery, and Azure Consumption Management API. This pulls usage data from all Linked Accounts in your AWS, GCP or Azure Organization. This option is selected by default with following options set to true in the server `.env` file:

`AWS_USE_BILLING_DATA` (AWS)  
`GCP_USE_BILLING_DATA` (GCP)  
`GCP_USE_BILLING_DATA` (GCP)

You need to also set additional environment variables as specified in [api/.env.template](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/api/.env.template), which was described in the Connecting Your Data section. You can see the permissions required by this approach in `ccf-athena.yaml` file. This approach provides us with a more holistic estimation of your cloud energy and carbon consumption, but it is less accurate as we use a constant (rather than measure) CPU Utilization, set for each cloud provider package:
- AWS: [packages/aws/src/domain/AwsFootprintEstimationConstants.ts](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/aws/src/domain/AwsFootprintEstimationConstants.ts)
- Azure: [packages/azure/src/domain/AzureFootprintEstimationConstants.ts](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/azure/src/domain/AzureFootprintEstimationConstants.ts)
- GCP: [packages/gcp/src/domain/GcpFootprintEstimationConstants.ts](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/gcp/src/domain/GcpFootprintEstimationConstants.ts)

This is the only approach currently supported for Microsoft Azure.

### Using Cloud Usage APIs (Higher Accuracy)

This alternative approach utilizes the AWS CloudWatch and Cost Explore APIs, and the GCP Cloud Monitoring API. We achieve this by looping through the accounts (the list is in the api/.env file) and then making the API calls on each account for the regions and services set in [packages/common/src/Config.ts](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/common/src/Config.ts). The permissions required for this approach are in the [ccf.yaml](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/cloudformation/ccf.yaml) file. This approach is arguably more accurate as we use the actual CPU usage in the emission estimation but is confined to the services that have been implemented so far in the application. This option is not currently supported for Microsoft Azure.

For a more comprehensive read on the various calculations and constants that we use for the emissions estimates, check out the [Methodology page](methodology).
