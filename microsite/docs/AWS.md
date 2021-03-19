---
id: aws
title: AWS
---

Your AWS account needs to be configured to generate Cost and Usage reports and save those reports in S3, and the application needs to authenticate with AWS and run queries on that data using Amazon Athena.

1. Ensure your aws account has the correct permissions

   - You will need an [IAM](https://aws.amazon.com/premiumsupport/knowledge-center/create-access-key/) user that can create access-keys and modify your billing settings.

2. Enable the Cost and Usage Billing AWS feature.

   - This feature needs to be enabled so your account can start generating cost and usage reports. To enable, navigate to your account's billing section, and click on the "Cost and Usage Reports" tab. Make sure to select “Amazon Athena” for report data integration. Reference Cost and Usage Reports documentation [here](https://docs.aws.amazon.com/cur/latest/userguide/what-is-cur.html).

3. Setup Athena DB to save the Cost and Usage Reports.

   - In addition to generating reports, we use Athena DB to save the details of those reports in a DB, so we can run queries on them. This is a standard AWS integration, outlined [here](https://docs.aws.amazon.com/cur/latest/userguide/cur-query-athena.html).

4. Configure aws credentials locally, using awscli.

   - After [installing awscli](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint#optional-prerequisites), run `aws configure` and provide your access key and secret access key. Also make sure you select the same region as the one you created your cost and usage reports in.

   - We optionally support alternative methods of authenticating with AWS, which you can read about [here](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint#options-for-aws-authentication).

5. Configure environmental variables for the api and client.

   - After configuring your credentials, we need to set a number of environmental variables in the app, so it can authenticate with AWS. We use .env files to manage this. Reference [packages/api/.env.template](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/packages/api/.env.template) for a template .env file. Rename this file as .env, optionally remove the comments and then set the environment variables for the “Billing Data” approach. If you are only using one of these cloud providers, you can remove the environment variables associated with the other cloud provider in your `packgages/api/.env` file.

   - There is also a `packages/client/.env` file that is required to be set if the application is being deployed behind Okta. See [client/.env.template](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/packages/client/.env.template) for a template. Rename this file as .env, optionally remove the comments and then set the environment variables.

   - By default, the client uses AWS, GCP and Azure. If you are only using one of these cloud providers, please update the appConfig object in the [client Config file](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/packages/client/src/Config.ts) to only include your provider in the CURRENT_PROIVDERS array.

6. Finally, start up the application

   `yarn start`

:warning: This will incur some cost. Use this sparingly if you wish to test with live data.

DISCLAIMER: If your editor of choice is VS Code, we recommend to use either your native or custom terminal of choice (i.e. iterm) instead. Unexpected authentication issues have occured when starting up the server in VS Code terminals.

### Options for AWS Authentication

We currently support three modes of authentication with AWS, that you can see in [packages/core/src/application/AWSCredentialsProvider.ts:](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/packages/core/src/application/AWSCredentialsProvider.ts)

1. "default" - this uses the AWS credentials that exist in the environment the application is running in, for example if you configure your local environment.

2. "AWS" - this is used to authenticate via an AWS role that has the necessary permissions to query the CloudWatch and Cost Explorer APIs.

3. "GCP" - this is used by GCP Service Accounts that authenticate via a temporary AWS STS token. This method is used by the application when deployed to Google App Engine.

The authentication mode is set inside [packages/core/src/application/Config.ts.](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/packages/core/src/application/Config.ts)

api/.env is where you configure the options for the "GCP" mode, and set the AWS Accounts you want to run the application against. You can read more about this mode of authentication in [.adr/adr_5_aws_authentication.txt](https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/blob/trunk/.adr/adr_5_aws_authentication.txt), as well as this article: https://cevo.com.au/post/2019-07-29-using-gcp-service-accounts-to-access-aws/

<!-- © 2020 ThoughtWorks, Inc. All rights reserved. -->
