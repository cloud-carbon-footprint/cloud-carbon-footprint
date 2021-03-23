# Cloud Carbon Footprint

[![CI](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/actions/workflows/ci.yml/badge.svg?event=check_run)](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/actions/workflows/ci.yml)

Cloud Carbon Footprint is an application that estimates the energy (kilowatt hours) and carbon emissions (metric tons CO2e) of public cloud provider utilization.

The core logic is exposed through 2 applications: a CLI and a website. The CLI resides in `packages/cli/`, and the website is split between `packages/api/` and `packages/client/`

If you would like to learn more about the various calculations and constants that we use for the emissions estimates, check out the [Methodology page](METHODOLOGY.md)

## Getting Started & Prerequisites

- Node.js >= 12 (tip: use [nvm](https://github.com/nvm-sh/nvm) or [n](https://github.com/tj/n) to manage multiple Node versions)

## Optional Prerequisites

- [Homebrew](https://brew.sh) (to download the AWS CLI)
- AWS CLI `brew install awscli` (if you are authenticating with AWS - see below)
- Terraform [0.12.28](https://releases.hashicorp.com/terraform/0.12.28/). (if you want to deploy using Terraform)
- Talisman (if you want to commit code)
  - `curl --silent https://raw.githubusercontent.com/thoughtworks/talisman/master/global_install_scripts/install.bash > /tmp/install_talisman.bash && /bin/bash /tmp/install_talisman.bash`

Note:

- During install, Talisman may fail to add the pre-commit hook to this repository because one already exists for Husky. This is fine because it can still execute in the existing husky pre-commit hook, once installed.
- During install, Talisman will also ask you for the directory of your git repositories. If you don't want to install Talisman in all your git repos, then cancel out at this step.

## Setup

```
yarn install
```

This will install dependencies for all packages. We use [Lerna](https://lerna.js.org) to manage both projects.

## Running the web-app

### Quick start (using mocked data)

```
yarn start-with-mock-data
```

This will run the webapp in development mode, using a mocked server. Open http://localhost:3000 to view it in a browser.

### Running the web-app with real data

A few steps are required to run the app with real data, that are different for each cloud provider. Check out the steps for each cloud provider here:

- [AWS](docs/AWS.md)
- [GCP](docs/GCP.md)
- [Azure](docs/Azure.md)

## Running the CLI

#### Local

```
yarn start-cli <options>
```

#### CLI Options

1. You can run the tool interactively with the `-i` flag; CLI will ask for the options/parameters
1. Or you can choose to pass the parameters in a single line:
   ```
   --startDate YYYY-MM-DD \
   --endDate YYYY-MM-DD \
   --region [us-east-1 | us-east-2] \
   --groupBy [day | dayAndService | service] \
   --format [table | csv]
   ```

## Serve the documentation

From the root directory, run the command from the terminal

```
 yarn docs
```

This will serve the docs and give an url where you can visit and see the documentation

## Options for cloud emission estimation

We support two approaches to gathering usage data for different cloud providers. One approach gives a more holistic understanding of your emissions whereas the other prioritizes accuracy:

1. **Using Billing Data (Holistic)** - By default, we query AWS Cost and Usage Reports with Amazon Athena, GCP Billing Export Table using BigQuery and Azure Consumption Management API. This pulls usage data from all Linked Accounts in your AWS, GCP or Azure Organization. This option is selected by setting `AWS_USE_BILLING_DATA` (AWS) and/or `GCP_USE_BILLING_DATA` (GCP) to true in the api and cli `.env` file. You need to also set additional environment variables as specified in [packages/api/.env.template](packages/api/.env.template) You can see the permissions required by this approach in `ccf-athena.yaml` file. This approach provides us with a more holistic estimation of your cloud energy and carbon consumption, but it is less accurate as we use a constant (rather than measure) CPU Utilization, set in [packages/core/src/domain/FootprintEstimationConstants.ts](packages/core/src/domain/FootprintEstimationConstants.ts).

2. **Using Cloud Usage APIs (Higher Accuracy)** - This approach utilizes the AWS CloudWatch and Cost Explore APIs, and the GCP Cloud Monitoring API. We achieve this by looping through the accounts (the list is in the [packages/api/.env]([packages/api/.env]) file) and then making the API calls on each account for the regions and services set in [packages/core/src/application/Config.ts](packages/core/src/application/Config.ts). The permissions required for this approach are in the [cloudformation/ccf.yaml](cloudformation/ccf.yaml) file. This approach is more accurate as we use the actual CPU usage in the emission estimation but is confined to the services that have been implemented so far in the application.

- For a more comprehensive read on the various calculations and constants that we use for the emissions algorithms, check out the [Methodology page](METHODOLOGY.md)

#### Options to Improve Query Performance

When running very large amounts of data with the default configuration of querying each day for the previous year, we have noticed that the time it takes to start the app increases significantly. We have added optional configuration to help with this performance issue to query and date filter in a few different ways:

- Date Range
  - In your `packages/client/.env` file, you can provide the following variables for a custom date range:
    - `REACT_APP_DATE_RANGE_TYPE` (example values: day(s), week(s), month(s), etc..)
    - `REACT_APP_DATE_RANGE_VALUE` (example values: number correlating to day/week/month etc..)
- Group By Timestamp in Queries
  - In your `packages/api/.env` file, you can provide the following variable for a custom query option to group the data by date type:
    - `GROUP_QUERY_RESULTS_BY` (example values: day, week, month, quarter, year)

### Ensure real-time estimates

If you want up-to-date estimates you will have to delete `packages/cli/estimates.cache.json` and/or `packages/api/estimates.cache.json`. If you don't have this file present, dont worry :) You'll just have to start the server and load the app for the first time. This cache is automatically generated by the app to aid in local development: **_it takes a while (~10min) to fetch up-to-date estimates and consequently generate the cache file_**

## Deploy to Google App Engine

Cloud Carbon Footprint is configured to be deployed to [Google App Engine](https://cloud.google.com/appengine/) (standard environment) using Github Actions. See the [Hello World example](https://cloud.google.com/nodejs/getting-started/hello-world) for instructions on setting up a Google Cloud Platform project and installing the Google Cloud SDK to your local machine.

Before deploying, you'll need to build the application and create the packages/api/.env and packages/client/.env file as detailed above. There are two scripts to populate these files as part of the Github Actions pipeline: [packages/cli/create_server_env_file.sh](packages/api/create_server_env_file.sh) and [client/create_client_env_file.sh](packages/client/create_client_env_file.sh).

Once you've set up the CGP project and have the command line tools, Cloud Carbon Footprint can be deployed with `./appengine/deploy-staging.sh` or `./appengine/deploy-production.sh`, depending on your environment.

Or if you want to use Github Actions, you can see the configuration for this in [.github/ci.yml](.github/ci.yml).

It will deploy to `https://<something>.appspot.com`.

If you don't want to deploy the client application behind Okta, then the packages/client/.env file is not needed, and the relevant code can be removed from [client/index.js](packages/client/index.js).

## Deploy to other cloud providers

Cloud Carbon Footprint should be deployable to other cloud providers such as [Heroku](https://www.heroku.com/) or [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/). However only Google App Engine has been tested currently, so there may be some work involved in doing this.

Don't forget to deploy your `.env` files or otherwise set the environment variables in your deployment.

## Support

Visit our [Google Group](https://groups.google.com/g/cloud-carbon-footprint) for any support questions. Don't be shy!!

© 2020 ThoughtWorks, Inc. All rights reserved.
