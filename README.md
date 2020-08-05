[![Build Status](https://travis-ci.com/dtoakley/cloud-carbon-footprint.svg?token=NzrMQqD3umSypwStq1MQ&branch=trunk)](https://travis-ci.com/dtoakley/cloud-carbon-footprint)

# cloud-carbon-footprint

This is an application that calculates the emissions of AWS services in realtime of an AWS account, given a start and end UTC dates (within the past year).

There core logic is exposed through 2 applications: a CLI and a website. The CLI resides in `server/`, and the website is split between `server/` and `client/`

## To run (CLI)
  1. Interactive version: `./scripts/cli.bash -i`
  2. Pass params on command line: 
  ```
  ./scripts/cli.bash \
    --startDate YYYY-MM-DD \
    --endDate YYYY-MM-DD \
    --region [us-east-1 | us-east-2]`
    --groupBy [day | service]
    --format [table | csv]
  ```

## To run (website)
  1. ./scripts/dev.bash

## Development
**Prerequisites**:
  - node >= 14
  - bash

**Workflow**:

These scripts optionally take 1 argument with the value `both`|`client`|`server`, indicating which folder(s) to run the scripts in. The default value is `both`
  - `./scripts/setup.bash`: install dependencies
  - `./scripts/clean.bash`: uninstall dependencies
  - `./scripts/lint.bash`: linter + formatter
  - `./scripts/test.bash`: tests

This script runs the website in dev mode, with unified logging output, watch mode, and hot reloading. Uses `ts-node-dev` for the backend and CRA's dev mode for the frontend
  - `./scripts/dev.bash`: tests

## Troubleshooting
Make sure CostExplorer is enabled. Also ensure your AWS credentials, region, and profile are pointing to the right place.
