---
id: aws
title: AWS
---

Your AWS account needs to be configured to generate Cost and Usage reports and save those reports in S3, and the application needs to authenticate with AWS and run queries on that data using Amazon Athena.

1.  Ensure your aws account has the correct permissions

    - You will need an [IAM](https://aws.amazon.com/premiumsupport/knowledge-center/create-access-key/) user that can create access-keys and modify your billing settings.
    - You can use the CloudFormation template file [ccf-athena.yaml](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/cloudformation/ccf-athena.yaml) to automate the creation of a role that allows the Cloud Carbon Footprint application to read Cost and Usage Reports via AWS Athena. Note: the section that asks you to specify the "AssumeRolePolicyDocument" is where you define the user or role that will have permissions to assume the "ccf-athena" role. 
    - This role name will be used for the value in the environment variable: `AWS_TARGET_ACCOUNT_ROLE_NAME`

2.  Enable the Cost and Usage Billing AWS feature.

    - This feature needs to be enabled so your account can start generating cost and usage reports. To enable, navigate to your account's billing section, and click on the "Cost and Usage Reports" tab. Make sure to select “Amazon Athena” for report data integration. Reference Cost and Usage Reports documentation [here.](https://docs.aws.amazon.com/cur/latest/userguide/what-is-cur.html)

3.  Setup Athena DB to save the Cost and Usage Reports.

    - In addition to generating reports, we use Athena DB to save the details of those reports in a DB, so we can run queries on them. This is a standard AWS integration, outlined [here.](https://docs.aws.amazon.com/cur/latest/userguide/cur-query-athena.html) There is a lot of helpful detail in the guides that goes beyond the specific needs for our app, but once you are able to succesfully query the Cost and Usage Reports from Athena, you should be set up sufficiently.

4.  Configure aws credentials locally, using awscli.

    - After [installing awscli](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint#optional-prerequisites), run `aws configure` and provide your access key and secret access key. Also make sure you select the same region as the one you created your cost and usage reports in.

    - We optionally support alternative methods of authenticating with AWS, which you can read about [here.](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint#options-for-aws-authentication)

5.  Configure environmental variables for the api and client.

    - After configuring your credentials, we need to set a number of environmental variables in the app, so it can authenticate with AWS. We use .env files to manage this. Reference [packages/api/.env.template](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/api/.env.template) for a template .env file. Rename this file as .env, optionally remove the comments and then set the environment variables for the “Billing Data” approach. If you are only using one of these cloud providers, you can remove the environment variables associated with the other cloud provider in your `packgages/api/.env` file.

    - There is also a `packages/client/.env` file that allows you to set some configuration for the data range the application requests data for. See [client/.env.template](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/client/.env.template) for a template. Rename this file as .env, optionally remove the comments and then set the environment variables.

    - By default, the client uses AWS, GCP and Azure. If you are only using one of these cloud providers, please update the appConfig object in the [client Config file](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/client/src/Config.ts) to only include your provider in the CURRENT_PROVIDERS array.

6.  Finally, after performing a `yarn install`, start up the application

        yarn start

:warning: This will incur some cost. Use this sparingly if you wish to test with live data.

DISCLAIMER: If your editor of choice is VS Code, we recommend to use either your native or custom terminal of choice (i.e. iterm) instead. Unexpected authentication issues have occured when starting up the server in VS Code terminals.

### Unsupported Usage Types

The application has a file containing supported usage types located [here](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/aws/src/lib/CostAndUsageTypes.ts). The current lists consist of types the application has faced, so there are likely to be some types not yet handled. When querying your data, you may come across unsupported types with a warning like this:

`2021-03-31T09:48:38.815Z [CostAndUsageReports] warn: Unexpected usage type for storage service: EU-WarmStorage-ByteHrs-EFS`

If you come across a similar warning message, congratulations! You have found a usage type that the app currently isn’t aware of - this is a great opportunity for you to improve Cloud Carbon Footprint!

The steps to resolve are:

1. Determine the type in question based on the warning message
2. Add the type to the respective list in the `CostAndUsageTypes.ts` file
3. Delete `estimates.cache.json` file and restart the application server
4. Submit an issue or pull request with the update

### Options for AWS Authentication

We currently support three modes of authentication with AWS, that you can see in [packages/aws/src/application/AWSCredentialsProvider.ts:](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/aws/src/application/AWSCredentialsProvider.ts)

1. "default" - this uses the AWS credentials that exist in the environment the application is running in, for example if you configure your local environment.

2. "AWS" - this is used to authenticate via an AWS role that has the necessary permissions to query the CloudWatch and Cost Explorer APIs.

3. "GCP" - this is used by GCP Service Accounts that authenticate via a temporary AWS STS token. This method is used by the application when deployed to Google App Engine.

The authentication mode is set inside [packages/common/src/Config.ts.](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/common/src/Config.ts)

api/.env is where you configure the options for the "GCP" mode, and set the AWS Accounts you want to run the application against. You can read more about this mode of authentication in [.adr/adr_5_aws_authentication.txt](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/.adr/adr_5_aws_authentication.txt), as well as this article: https://cevo.com.au/post/2019-07-29-using-gcp-service-accounts-to-access-aws/

<!-- © 2021 Thoughtworks, Inc. -->
