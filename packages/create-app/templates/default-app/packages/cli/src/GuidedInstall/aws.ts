/*
 * © 2021 Thoughtworks, Inc.
 */

import { confirmPrompt, EnvConfig, inputPrompt } from './common'
import { lineBreak, log, runCmd } from './external'

export async function AWSSetup(): Promise<EnvConfig> {
  const env: EnvConfig = {}
  env.AWS_USE_BILLING_DATA = 'true'

  env.AWS_BILLING_ACCOUNT_ID = await inputPrompt('Enter AWS account id:')
  env.AWS_BILLING_ACCOUNT_NAME = await inputPrompt('Enter AWS account name:')
  env.AWS_ATHENA_REGION = await inputPrompt('Enter AWS region:')
  lineBreak()

  await confirmPrompt(
    `Ensure your AWS account has the correct permissions.\n\t- You will need an [IAM user](https://aws.amazon.com/premiumsupport/knowledge-center/create-access-key/) that can create access-keys and modify your billing settings.`,
  )

  env.AWS_TARGET_ACCOUNT_ROLE_NAME = await inputPrompt('Enter AWS role name:')
  lineBreak()

  await confirmPrompt(
    `Enable the Cost and Usage Reports Billing AWS feature.\n\t- This feature needs to be enabled so your account can start generating cost and usage reports.\n\t- To enable, navigate to your account's billing section, and click on the "Cost and Usage Reports" tab.\n\t- Make sure to select “Amazon Athena” for report data integration.\n\t- Reference Cost and Usage Reports documentation [here](https://docs.aws.amazon.com/cur/latest/userguide/what-is-cur.html).`,
  )

  await confirmPrompt(
    `Setup Athena DB to save the Cost and Usage Reports.\n\t- In addition to generating reports, we use Athena DB to save the details of those reports in a DB, so we can run queries on them.\n\t- This is a standard AWS integration, outlined [here](https://docs.aws.amazon.com/cur/latest/userguide/cur-query-athena.html)`,
  )

  env.AWS_ATHENA_DB_NAME = await inputPrompt('Enter Athena DB name:')
  env.AWS_ATHENA_DB_TABLE = await inputPrompt('Enter Athena DB table:')
  env.AWS_ATHENA_QUERY_RESULT_LOCATION = await inputPrompt(
    'Enter Athena DB query result location (eg s3://your-athena-query-results-location):',
  )
  lineBreak()

  await confirmPrompt(
    'Install the AWS CLI https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html',
  )
  const configureAwsCli = await confirmPrompt(
    `Configure aws credentials locally, using awscli. See the documentation for more details on authenticating to AWS.`,
    'Would you like this tool to configure your awscli? If no, you will need to do it yourself.',
    false,
  )

  if (configureAwsCli) {
    const accessKey = await inputPrompt('Enter AWS access key id:')
    const secretAccessKey = await inputPrompt('Enter AWS secret access key:')
    const profile =
      (await inputPrompt('Optionally enter AWS profile:', false)) || 'default'

    log('Configuring AWS CLI...')
    await runCmd(
      `aws configure set aws_access_key_id ${accessKey} --profile ${profile}`,
    )
    await runCmd(
      `aws configure set aws_secret_access_key ${secretAccessKey} --profile ${profile}`,
    )
    await runCmd(
      `aws configure set region ${env.AWS_ATHENA_REGION} --profile ${profile}`,
    )
    log('...done', false)
  } else {
    await confirmPrompt(
      'Run `aws configure` and provide your access key and secret access key.\n\t- Also make sure you select the same region as the one you created your cost and usage reports in.',
    )
  }

  return env
}
