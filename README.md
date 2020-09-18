# cloud-carbon-footprint

[![CircleCI](https://circleci.com/gh/twlabs/cloud-carbon-footprint.svg?style=shield&circle-token=82a0b0fe3e8ea0756b36f185d500ee10d191838e)](https://circleci.com/gh/twlabs/cloud-carbon-footprint/tree/trunk)

This is an application that calculates the emissions of AWS services in realtime of an AWS account, given a start and end UTC dates (within the past year).

There core logic is exposed through 2 applications: a CLI and a website. The CLI resides in `server/`, and the website is split between `server/` and `client/`

## Prerequisites

- [Homebrew](https://brew.sh)
- Node.js >= 12 (tip: use [nvm](https://github.com/nvm-sh/nvm) or [n](https://github.com/tj/n) to manage multiple Node versions)
- Docker `brew cask install docker`
- AWS CLI `brew install awscli`
- Terraform `brew install terraform`

## Setup

```
npm run bootstrap
```

This will install dependencies in both the `client` and `server`. We use [Lerna](https://lerna.js.org) to manage both projects.

### AWS Credentials

- Configure AWS credentials.
  ```
  aws configure
  ```
- Specify the services and regions that the tool runs on in [server/src/application/Config.json](./server/src/application/Config.json)

## Run

### Client and Server

```
npm start
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
