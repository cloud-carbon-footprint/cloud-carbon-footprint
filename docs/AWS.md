# AWS - running the web-app with real data

Your AWS account needs to be configured to generate Cost and Usage reports and save those reports in S3, and the application needs to authenticate with AWS and run queries on that data using Amazon Athena.

1. **Ensure your aws account has the correct permissions**
    - You will need an [IAM user](https://aws.amazon.com/premiumsupport/knowledge-center/create-access-key/) that can create access-keys and modify your billing settings.
1. **Enable the Cost and Usage Reports Billing AWS feature.**
    - This feature needs to be enabled so your account can start generating cost and usage reports. To enable, navigate to your account's billing section, and click on the "Cost and Usage Reports" tab. Make sure to select “Amazon Athena” for report data integration. Reference Cost and Usage Reports documentation [here](https://docs.aws.amazon.com/cur/latest/userguide/what-is-cur.html).
1. **Setup Athena DB to save the Cost and Usage Reports.**
    - In addition to generating reports, we use Athena DB to save the details of those reports in a DB, so we can run queries on them. This is a standard AWS integration, outlined [here](https://docs.aws.amazon.com/cur/latest/userguide/cur-query-athena.html)
1. **Configure aws credentials locally, using awscli.**
    - After [installing awscli](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html), run `aws configure` and provide your access key and secret access key. Also make sure you select the same region as the one you created your cost and usage reports in.
    - We optionally support alternative methods of authenticating with AWS, which you can read about [below](#options-for-aws-authentication).
1. **Configure environmental variables for the api and client.**
    - After configuring your credentials, we need to set a number of environmental variables in the app, so it can authenticate successfully. We use .env files to manage this. Reference [packages/api/.env.template](packages/api/.env.template) for a template .env file. Rename this file as .env, optionally remove the comments and then set the environment variables for the “Billing Data'' approach. By default, the api has configuration for both AWS, GCP and Azure. If you are only using one of these cloud providers, you can remove the environment variables associated with the other cloud provider in your `packgages/api/.env` file.
   - There is also a `packages/client/.env` file that allows you to set some configuration for the data range the application requests data for. See [client/.env.template](packages/client/.env.template) for a template. Rename this file as .env, optionally remove the comments and then set the environment variables.
    - By default, the client uses both AWS, GCP and Azure. If you are only using one of these cloud providers, please update the `appConfig` object in the [client Config file](packages/client/src/Config.ts) to only include your provider in the `CURRENT_PROVIDERS` array.
1. Finally, start up the application

```
yarn start
```

> :warning: **This will incure cost**: Use this sparingly if you wish to test with live data

> _DISCLAIMER_: If your editior of choice is VS Code, **_we recommend to use either your native or custom terminal of choice (i.e. iterm)_** instead. Unexpected authentication issues have occured when starting up the server in VS Code terminals.

## Options for AWS Authentication

We currently support three modes of authentication with AWS, that you can see in [packages/core/src/application/AWSCredentialsProvider.ts](packages/core/src/application/AWSCredentialsProvider.ts):

1. "default" - this uses the AWS credentials that exist in the environment the application is running in, for example if you configure your local environment.
2. "AWS" - this is used to authenticate via an AWS role that has the necessary permissions to query the CloudWatch and Cost Explorer APIs.
3. "GCP" - this is used by GCP Service Accounts that authenticate via a temporary AWS STS token. This method is used by the application when deployed to Google App Engine.

The authentication mode is set inside [packages/core/src/application/Config.ts](packages/core/src/application/Config.ts).

[api/.env](packages/api/.env) is where you configure the options for the "GCP" mode, and set the AWS Accounts you want to run the application against.
You can read more about this mode of authentication in [.adr/adr_5_aws_authentication.txt](.adr/adr_5_aws_authentication.txt), as well as this article: [https://cevo.com.au/post/2019-07-29-using-gcp-service-accounts-to-access-aws/](https://cevo.com.au/post/2019-07-29-using-gcp-service-accounts-to-access-aws/)

