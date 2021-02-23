# cloud-carbon-footprint

[![CircleCI](https://circleci.com/gh/ThoughtWorks-Cleantech/cloud-carbon-footprint.svg?style=shield&circle-token=62c2533631fb603b09c81ff218530d66b26a61f4)](https://circleci.com/gh/ThoughtWorks-Cleantech/cloud-carbon-footprint/tree/trunk)

This is an application that estimates the energy (kWh) and carbon emissions (metric tons CO2e) of cloud provider usage, given a start and end UTC dates (within the past year).

The core logic is exposed through 2 applications: a CLI and a website. The CLI resides in `server/`, and the website is split between `server/` and `client/`

## Prerequisites

- Node.js >= 12 (tip: use [nvm](https://github.com/nvm-sh/nvm) or [n](https://github.com/tj/n) to manage multiple Node versions)
- Talisman `curl --silent  https://raw.githubusercontent.com/thoughtworks/talisman/master/global_install_scripts/install.bash > /tmp/install_talisman.bash && /bin/bash /tmp/install_talisman.bash`

Note: 
- During install, Talisman may fail to add the pre-commit hook to this repository because one already exists for Husky. This is fine because it can still execute in the existing husky pre-commit hook, once installed.
- During install, Talisman will also ask you for the directory of your git repositories. If you don't want to install Talisman in all your git repos, then cancel out at this step.  

## Optional Prerequisites

- [Homebrew](https://brew.sh) (to download the AWS CLI)
- AWS CLI `brew install awscli` (if you are authenticating with AWS - see below)
- Terraform [0.12.28](https://releases.hashicorp.com/terraform/0.12.28/). (if you want to deploy using Terraform)

## Setup

```
npm run bootstrap
```

This will install dependencies in both the `client` and `server`. We use [Lerna](https://lerna.js.org) to manage both projects.

## Serve the documentation
 From the root directory, run the command from the terminal
```
 npm run docs
```
This will serve the docs and give an url where you can visit and see the documentation

## AWS Authentication 

We currently support three modes of authentication with AWS, that you can see in [server/src/application/AWSCredentialsProvider.ts](server/src/application/AWSCredentialsProvider.ts):

1. "GCP" - this is used by GCP Service Accounts that authenticate via a temporary AWS STS token. This method is used by the application when deployed to Google App Engine.
2. "AWS" - this is used to authenticate via an AWS role that has the necessary permissions to query the CloudWatch and Cost Explorer APIs.   
3. "default" - this uses the AWS credentials that exist in the environment the application is running in, for example if you configure your local environment.   

The authentication mode is set inside [server/src/application/Config.ts](server/src/application/Config.ts).

[server/.env](server/.env) is where you configure the options for the "GCP" mode, and set the AWS Accounts you want to run the application against. 
You can read more about this mode of authentication in [.adr/adr_5_aws_authentication.txt](.adr/adr_5_aws_authentication.txt), as well as this article: [https://cevo.com.au/post/2019-07-29-using-gcp-service-accounts-to-access-aws/](https://cevo.com.au/post/2019-07-29-using-gcp-service-accounts-to-access-aws/)

### AWS Credentials - only needed for the "default" authentication mode. 
 
- Configure AWS credentials.
  ```
  aws configure
  ```
- Specify the services and regions that the tool runs on in [server/src/application/Config.ts](server/src/application/Config.ts)

### GCP Credentials

- You'll need your team's (or your own) GCP service account credentials stored on your filesystem
- Set the GOOGLE_APPLICATION_CREDENTIALS env variable to the location of your credentials file.
see https://cloud.google.com/docs/authentication/getting-started for more details.

## Options for cloud emission estimation

We support two approaches to gathering usage data for different cloud providers. One approach gives a more holistic understanding of your emissions whereas the other prioritizes accuracy:

1. **Using Billing Data (Holistic)** - By default, we query AWS Cost and Usage Reports with Amazon Athena, and GCP Billing Export Table using BigQuery. This pulls usage data from all Linked Accounts in your AWS or GCP Organization. This option is selected by setting `AWS_USE_BILLING_DATA` and `REACT_APP_AWS_USE_BILLING_DATA` (AWS) and/or `GCP_USE_BILLING_DATA` and `REACT_APP_GCP_USE_BILLING_DATA`(GCP) to true in both the server and client `.env` files respectively. You need to also set additional environment variables as specified in [server/.env.template](server/.env.template) You can see the permissions required by this approach in `ccf-athena.yaml` file. This approach provides us with a more holistic estimation of your cloud energy and carbon consumption, but it is less accurate as we use a constant (rather than measure) CPU Utilization, set in [server/src/domain/FootprintEstimationConstants.ts](server/src/domain/FootprintEstimationConstants.ts).
- When calculating total `wattHours` for AWS Lambda service using Billing Data (Holistic), we are assuming that `MemorySetInMB` will be 1792, and since we will then divide this by the constant 1792, we just don't include it in the calculation.
- For this approach to work with AWS, you will need to have Cost and Usage Reports set up to run daily or hourly, and Athena configured to query these reports in S3. You can read more about this here: [https://docs.aws.amazon.com/cur/latest/userguide/cur-query-athena.html](https://docs.aws.amazon.com/cur/latest/userguide/cur-query-athena.html)
- For this approach to work with GCP, you will need to have a Billing Export Table set up to run hourly or daily, and have BigQuery configured to query these reports. You can read more about this here:[https://cloud.google.com/billing/docs/how-to/export-data-bigquery](https://cloud.google.com/billing/docs/how-to/export-data-bigquery)

2. **Using Cloud Usage APIs (Higher Accuracy)** - This approach utilizes the AWS CloudWatch and Cost Explore APIs, and the GCP Cloud Monitoring API. We achieve this by looping through the accounts (the list is in the [server/.env]([server/.env]) file) and then making the API calls on each account for the regions and services set in [server/src/application/Config.ts](server/src/application/Config.ts). The permissions required for this approach are in the [ccf.yaml](ccf.yaml) file. This approach is more accurate as we use the actual CPU usage in the emission estimation but is confined to the services that have been implemented so far in the application.
- For a more comprehensive read on the various calculations and constants that we use for the emissions algorithms, check out the [Methodology page](METHODOLOGY.md)


### Ensure real-time estimates
If you want up-to-date estimates you will have to delete `server/estimates.cache.json`. If you don't have this file present, dont worry :) You'll just have to start the server and load the app for the first time. This cache is automatically generated by the app to aid in local development: ***it takes a while (~10min) to fetch up-to-date estimates and consequently generate the cache file***


## Run

### Server
The application requires a number of environment variables to be set in the [server/.env](server/.env) file. See [server/.env.template](server/.env.template) for a template .env file. Rename this file as .env, optionally remove the comments and then set the environment variables.

By default, the server has configuration for both AWS and GCP. If you are only using one of these cloud providers, you can remove the environment variables associated with the other cloud provider in your [server/.env](server/.env) file.

### Client
There is also a [client/.env](client/.env) file that is required to be set if the application is being deployed behind Okta. See [client/.env.template](client/.env.template) for a template. Rename this file as .env, optionally remove the comments and then set the environment variables.  

By default, the client uses both AWS and GCP. If you are only using one of these cloud providers, please update the `appConfig` object in the [client Config file](client/src/Config.ts) to only include your provider in the `CURRENT_PROIVDERS` array.

### Client and Server (with mock data)
```
cd client
npm run start-stub-server

//in another terminal, also from the client directory
npm start
```

### Client and Server (with live data)
Make sure you have configured your GCP and AWS credentials (see above)
> :warning: **This will incure cost**: Data will come from AWS and will cost money to your project. Use this sparingly if you wish to test with live data. If not, use the command above

>*DISCLAIMER*: If your editior of choice is VS Code, ***we recommend to use either your native or custom terminal of choice (i.e. iterm)*** instead. Unexpected authentication issues have occured when starting up the server in VS Code terminals. 

```
npm start
```

If you would like to run with Docker, you'll need install docker and docker-compose:

- Docker `brew install --cask docker`
- docker-compose (should be bundled with Docker if you installed it on a Mac)

```
docker-compose up
```


### Server in Docker

```
cd server
npm run docker:start //creates a docker container named ccf_base
npm run docker:setup //install dependencies
```

### Run CLI

#### Local

```
cd server
npm run start:cli -- <options>
```

#### Docker

```
cd server
npm run docker:cli -- <options>
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

# Deploy to Google App Engine

Cloud Carbon Footprint is configured to be deployed to [Google App Engine](https://cloud.google.com/appengine/) (standard environment) using Circle CI. See the [Hello World example](https://cloud.google.com/nodejs/getting-started/hello-world) for instructions on setting up a Google Cloud Platform project and installing the Google Cloud SDK to your local machine.

Before deploying, you'll need to build the application and create the server/.env and client/.env file as detailed above. There are two scripts to populate these files as part of the Circle CI pipeline: [server/create_server_env_file.sh](server/create_server_env_file.sh) and [client/create_client_env_file.sh](client/create_client_env_file.sh).

Once you've set up the CGP project and have the command line tools, Cloud Carbon Footprint can be deployed with

`./appengine/deploy.sh`

Or if you want to use CircleCI, you can see the configuration for this in [.circleci/config.yml](.circleci/config.yml).

It will deploy to `https://<something>.appspot.com`.

If you don't want to deploy the client application behind Okta, then the client/.env file is not needed, and the relevant code can be removed from [client/index.js](client/index.js).  

## Deploy to other cloud providers

Cloud Carbon Footprint should be deployable to other cloud providers such as [Heroku](https://www.heroku.com/) or [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/). However only Google App Engine has been tested currently, so there may be some work involved in doing this. 

Don't forget to deploy your .env file or otherwise set the environment variables in your deployment.

© 2020 ThoughtWorks, Inc. All rights reserved.
