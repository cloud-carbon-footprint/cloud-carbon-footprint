# 5. AWS Authentication

Date: 2020-10-15

## Decision

Setup a proxy AWS Account with an Identity Provider for Google Cloud Platform
(GCP) that can issue temporary AWS Security Token Service (STS) tokens.

Setup a "ccf" role in target accounts that has the required CloudWatch and Cost
Explorer permissions and allows a role in the proxy account to assume it.

Configure the necessary environment variables at build time in CircleCI in
order for the authentication to work.

## Context

We wanted a secure way to authenciate and run cloud-carbon-footprint against
multiple AWS Accounts

We didn't want to store API keys/credentials on our GCP App Engine instance.

## Consequences

In order to run the application locally with a GCP Service Account, you need to
correctly configure your server/.env file, and ensure the Service Account
Unique ID is added to the proxy account Identity Provider.

New accounts that you want to run cloud-carbon-footprint against need to add
the "ccf" or the "ccf-app" roles found in the /cloudformation directory.
