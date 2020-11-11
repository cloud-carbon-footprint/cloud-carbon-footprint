# cloud-carbon-footprint

[![CircleCI](https://circleci.com/gh/twlabs/cloud-carbon-footprint.svg?style=shield&circle-token=82a0b0fe3e8ea0756b36f185d500ee10d191838e)](https://circleci.com/gh/twlabs/cloud-carbon-footprint/tree/trunk)

This is an application that calculates the emissions of AWS services in realtime of an AWS account, given a start and end UTC dates (within the past year).

The core logic is exposed through 2 applications: a CLI and a website. The CLI resides in `server/`, and the website is split between `server/` and `client/`

## Prerequisites

- [Homebrew](https://brew.sh)
- Node.js >= 12 (tip: use [nvm](https://github.com/nvm-sh/nvm) or [n](https://github.com/tj/n) to manage multiple Node versions)
- Docker `brew cask install docker`
- AWS CLI `brew install awscli`
- Terraform [0.12.28](https://releases.hashicorp.com/terraform/0.12.28/) (for Mac download the darwin_amd64 zip)
- Talisman `curl --silent  https://raw.githubusercontent.com/thoughtworks/talisman/master/global_install_scripts/install.bash > /tmp/install_talisman.bash && /bin/bash /tmp/install_talisman.bash`
- docker-compose (should be bundled with Docker if you installed it on a Mac)

Note: During install, Talisman may fail to add the pre-commit hook to this repository because one already exists for Husky. This is fine because it can still execute in the existing husky pre-commit hook, once installed.  

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

1. GCP - this is used by GCP Service Accounts that authenticate via a temporary AWS STS token. This method is used by the application when deployed to Google App Engine.
2. AWS - this is used to authenticate via an AWS role that has the necessary permissions to query the CloudWatch and Cost Explorer APIs.   
3. default - this uses the AWS credentials that exist in the environment the application is running in, for example if you configure your local environment.   

The authentication mode is set inside [server/src/application/Config.ts](server/src/application/Config.ts).

[server/.env](server/.env) is where you configure the options for the "GCP" mode, and set the AWS Accounts you want to run the application against. 
You can read more about this mode of authentication in [.adr/adr_5_aws_authentication.txt](.adr/adr_5_aws_authentication.txt), as well as this article: [https://cevo.com.au/post/2019-07-29-using-gcp-service-accounts-to-access-aws/](https://cevo.com.au/post/2019-07-29-using-gcp-service-accounts-to-access-aws/)

### AWS Credentials - only needed for the default authentication mode. 
 
- Configure AWS credentials.
  ```
  aws configure
  ```
- Specify the services and regions that the tool runs on in [server/src/application/Config.ts](server/src/application/Config.ts)

### GCP Credentials

- You'll need your team's (or your own) GCP service account credentials stored on your filesystem
- set the GOOGLE_APPLICATION_CREDENTIALS env variable to the location of your credentials file.
see https://cloud.google.com/docs/authentication/getting-started for more details.

## Run

The application requires a number of environment variables to be set in the [server/.env](server/.env) file. See [server/.env.template](server/.env.template) for a template .env file. Rename this file as .env and then set the environment variables.

There is also a [client/.env](client/.env) file that is required to be set if the application is being deployed behind Okta. See [client/.env.template](client/.env.template) for a template. It is not required for local development though. 

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

```
npm start
```

With Docker:

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
