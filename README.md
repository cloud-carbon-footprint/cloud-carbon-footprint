[![Build Status](https://travis-ci.com/dtoakley/cloud-carbon-footprint.svg?token=NzrMQqD3umSypwStq1MQ&branch=trunk)](https://travis-ci.com/dtoakley/cloud-carbon-footprint)

# cloud-carbon-footprint

This is an application that calculates the emissions of AWS services in realtime of an AWS account, given a start and end UTC dates (within the past year).

### To run
  1. Interactive version: `./scripts/cli.bash -i`
  2. Pass params on command line: `./scripts/cli.bash --startDate YYYY-MM-DD --endDate YYYY-MM-DD`

## Troubleshooting
Make sure CostExplorer is enabled in the AWS region you specify.
