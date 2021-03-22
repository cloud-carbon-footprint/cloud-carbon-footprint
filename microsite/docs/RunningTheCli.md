---
id: running-the-cli
title: Running the CLI
---

We believe that getting your cloud emissions data should be easy. If you are looking to quickly get an output of data, the CLI is a great option. It allows you to specify exactly what data you’re looking for, including the date range, regions, groupings and output type.

#### Local

    yarn start-cli <options>

#### CLI Options

You can run the tool interactively with the `-i` flag; CLI will ask for the options/parameters

Or you can choose to pass the parameters in a single line:

    --startDate YYYY-MM-DD \
    --endDate YYYY-MM-DD \
    --region [us-east-1 | us-east-2] \
    --groupBy [day | dayAndService | service] \
    --format [table | csv]

### Serve the documentation

From the root directory, run the command from the terminal

    yarn docs

This will serve the docs and give an url where you can visit and see the documentation

### Options for cloud emission estimation

We support two approaches to gathering usage data for different cloud providers. One approach gives a more holistic understanding of your emissions whereas the other prioritizes accuracy:

1. **Using Billing Data (Holistic) -** By default, we query AWS Cost and Usage Reports with Amazon Athena, and GCP Billing Export Table using BigQuery. This pulls usage data from all Linked Accounts in your AWS or GCP Organization. This option is selected by setting `AWS_USE_BILLING_DATA` (AWS) and/or `GCP_USE_BILLING_DATA` (GCP) to true in the server .env file. You need to also set additional environment variables as specified in [api/.env.template](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/api/.env.template) You can see the permissions required by this approach in ccf-athena.yaml file. This approach provides us with a more holistic estimation of your cloud energy and carbon consumption, but it is less accurate as we use a constant (rather than measure) CPU Utilization, set in [packages/core/src/domain/FootprintEstimationConstants.ts](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/packages/core/src/domain/FootprintEstimationConstants.ts). This is the only approach currently supported for Microsoft Azure.

2. **Using Cloud Usage APIs (Higher Accuracy) -** This approach utilizes the AWS CloudWatch and Cost Explore APIs, and the GCP Cloud Monitoring API. We achieve this by looping through the accounts (the list is in the [api/.env](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/%5Bapi/.env%5D) file) and then making the API calls on each account for the regions and services set in [packages/core/src/application/Config.ts](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/packages/core/src/application/Config.ts). The permissions required for this approach are in the [ccf.yaml](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/ccf.yaml) file. This approach is more accurate as we use the actual CPU usage in the emission estimation but is confined to the services that have been implemented so far in the application. This option is not currently supported for Microsoft Azure.

For a more comprehensive read on the various calculations and constants that we use for the emissions estimates, check out the [Methodology page](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/METHODOLOGY.md)
