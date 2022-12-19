---
id: alternative-data-approaches
title: Alternative Data Approaches
slug: /alternative-data-approaches
sidebar_position: 6
---

## Cloud Provider Usage and Cost Data

By default, we query AWS Cost and Usage Reports with Amazon Athena, GCP Billing Export Table using BigQuery, and Azure Consumption Management API. This pulls usage data from all Linked Accounts in your AWS, GCP or Azure Organization. This option is selected by default with following options set to true in the server `.env` file:

`AWS_USE_BILLING_DATA` (AWS)  
`GCP_USE_BILLING_DATA` (GCP)  
`AZURE_USE_BILLING_DATA` (Azure)

You need to also set additional environment variables as specified in [api/.env.template](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/api/.env.template), which was described in the Connecting Your Data section. You can see the permissions required by this approach in `ccf-app.yaml` file. This approach provides us with a more holistic estimation of your cloud energy and carbon consumption, but it is less accurate as we use a constant (rather than measure) CPU Utilization, set for each cloud provider package:
- AWS: [packages/aws/src/domain/AwsFootprintEstimationConstants.ts](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/aws/src/domain/AwsFootprintEstimationConstants.ts)
- GCP: [packages/gcp/src/domain/GcpFootprintEstimationConstants.ts](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/gcp/src/domain/GcpFootprintEstimationConstants.ts)
- Azure: [packages/azure/src/domain/AzureFootprintEstimationConstants.ts](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/azure/src/domain/AzureFootprintEstimationConstants.ts)

### Unsupported: Using Cloud Usage APIs (Higher Accuracy)

This alternative approach is currently unsupported but in the spirit of open source, still exists in the codebase. It utilizes the AWS CloudWatch and Cost Explorer APIs, and the GCP Cloud Monitoring API. We achieve this by looping through the accounts (the list is in the api/.env file) and then making the API calls on each account for the regions and services set in [packages/common/src/Config.ts](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/common/src/Config.ts). The permissions required for this approach are in the [ccf.yaml](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/cloudformation/ccf.yaml) file. This approach is arguably more accurate as we use the actual CPU usage in the emission estimation but is confined to the services that have been implemented so far in the application. We retrieve an hourly granularity for usage and daily granularity for cost. This option only works for compute and storage, and is not available for Microsoft Azure.

The cloud providers and services available with this approach are:

AWS
- EC2 (compute)
- Lambda (compute)
- EBS (storage)
- RDS (compute & storage)
- S3 (storage)
- Elasticache (compute)

GCP
- Compute Engine (compute)


For a more comprehensive read on the various calculations and constants that we use for the emissions estimates, check out the [Methodology page](docs/HowItWorks/Methodology.md).
