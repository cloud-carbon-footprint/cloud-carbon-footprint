/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { confirm, input, list, prompt } from 'typed-prompts'
import { prop } from 'ramda'
import { exec as execCb } from 'child_process'
import { promisify } from 'util'
import fs from 'fs-extra'
import dotenv from 'dotenv'

const exec = promisify(execCb)
const stat = promisify(fs.stat)

const log = (m: string, leading = true) =>
  console.log(`${leading ? '\n' : ''}# ${m}\n`)
const lineBreak = () => console.log()
const listPrompt = (message: string, options: string[]) =>
  prompt<{ key: string }>([list('key', message, options)]).then(prop('key'))
const confirmPrompt = (
  message: string,
  question = 'Is this step complete?',
  requireYes = true,
) =>
  prompt<{ key: boolean }>([confirm('key', message + `\n${question}`)]).then(
    (result) => {
      if (requireYes && !result.key) {
        log('Please try again when you have completed this step.')
        process.exit(0)
      }
      console.log()
      return result.key
    },
  )
const inputPrompt = (message: string, required = true): Promise<string> =>
  prompt<{ key: string }>([input('key', message)])
    .then(prop('key'))
    .then((result: string) => {
      if (required && !result) {
        log('Please enter a value.')
        return inputPrompt(message, required)
      }
      return result
    })

const runCmd = async (cmd: string) => {
  try {
    await exec(cmd)
  } catch (error) {
    process.stdout.write(error.stderr)
    process.stdout.write(error.stdout)
    throw new Error(`Could not execute command ${cmd}`)
  }
}

// will load existing .env and overwrite the given keys
const createEnvFile = async (dir: string, env: { [key: string]: string }) => {
  const path = `${dir}.env`
  log(`Creating ${path}...`, false)
  const exists = await stat(path)
    .then(() => true)
    .catch(() => false)

  const existing = exists ? dotenv.config({ path }) : {}
  if (existing.error) {
    throw existing.error
  }

  const newEnv = { ...existing.parsed, ...env }
  await fs.writeFile(
    path,
    Object.entries(newEnv).reduce(
      (config, [k, v]) => `${config}${k}=${v}\n`,
      '',
    ),
  )
  log('...done', false)
}

async function GuidedInstall() {
  log(
    `Welcome to Cloud Carbon Footprint's Guided Install. This tool will walk you through the documentation and automate certain parts of it. Please see https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/tree/trunk/docs for details.`,
  )

  const provider: string = await listPrompt(
    'Choose a cloud provider to configure:',
    Object.keys(providers),
  )

  log(`${provider} setup`)
  const setup = providers[provider]
  await setup()
}

const providers: { [key: string]: () => Promise<void> } = {
  AWS: AWSSetup,
  GCP: () => null,
  Azure: () => null,
}

async function AWSSetup() {
  const env: { [key: string]: string } = {}

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

  env.AWS_USE_BILLING_DATA = 'true'
  lineBreak()

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

  await createEnvFile('./', env)
  await createEnvFile('../api/', env)
}

GuidedInstall().catch((error) => {
  console.error(`Something went wrong: ${error.message}`)
})
