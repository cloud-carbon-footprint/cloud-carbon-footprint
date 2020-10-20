# cloud-carbon-footprint

[![CircleCI](https://circleci.com/gh/twlabs/cloud-carbon-footprint.svg?style=shield&circle-token=82a0b0fe3e8ea0756b36f185d500ee10d191838e)](https://circleci.com/gh/twlabs/cloud-carbon-footprint/tree/trunk)

This is an application that calculates the emissions of AWS services in realtime of an AWS account, given a start and end UTC dates (within the past year).

There core logic is exposed through 2 applications: a CLI and a website. The CLI resides in `server/`, and the website is split between `server/` and `client/`

## Prerequisites

- [Homebrew](https://brew.sh)
- Node.js >= 12 (tip: use [nvm](https://github.com/nvm-sh/nvm) or [n](https://github.com/tj/n) to manage multiple Node versions)
- Docker `brew cask install docker`
- AWS CLI `brew install awscli`
- Terraform [0.12.28](https://releases.hashicorp.com/terraform/0.12.28/) 
- docker-compose (should be bundled with Docker if you installed it on a Mac)

## Setup

```
npm run bootstrap
```

This will install dependencies in both the `client` and `server`. We use [Lerna](https://lerna.js.org) to manage both projects.

# AWS Authentication 

We currently support three modes of authentication with AWS, that you can see in [server/src/application/AWSCredentialsProvider.ts](server/src/application/AWSCredentialsProvider.ts):

1. GCP - this is used by GCP Service Accounts that authenticate via a temporary AWS STS token. This method is used by the application when deployed to Google App Engine.
2. AWS - this is used to authenticate via an AWS role that has the necessary permissions to query the CloudWatch and Cost Explorer APIs.   
3. default - this uses the AWS credentials that exist in the environment the application is running in, for example if you configure your local environment.   

The authentication mode is set inside [server/src/application/Config.ts](server/src/application/Config.ts).

[server/.env](server/.env) is where you configure the options for the "GCP" mode, and set the AWS Accounts you want to run the application against. 
You can read more about this mode of authentication in [.adr/adr_5_aws_authentication.txt](.adr/adr_5_aws_authentication.txt)

### AWS Credentials - only needed for the default authentication mode. 
 
- Configure AWS credentials.
  ```
  aws configure
  ```
- Specify the services and regions that the tool runs on in [server/src/application/Config.ts](server/src/application/Config.ts)

### GCP Credentials

- request service account credentials from Dan
- set the GOOGLE_APPLICATION_CREDENTIALS env variable to the location of your credentials file.
see https://cloud.google.com/docs/authentication/getting-started for more details.

## Run

### Client and Server (with mock data)
```
cd client
npm run start-stub-server

//in another terminal, also from the client directory
npm start
```

### Client and Server (with live data)
Make sure you have configured your GCP and AWS credentials (see above)
> :warning: **This will incure cost**: Data will come from AWS and will cost money to our project. Use this sparingly if you wish to test with live data. If not, use the command above

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

#### Deploy 

To deploy server

```
npm run deploy
```

## Troubleshooting

Make sure CostExplorer is enabled. Also ensure your AWS credentials, region, and profile are pointing to the right place (see: your [AWS config and credentials files](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html)).
