/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { confirm, list, prompt } from 'typed-prompts'
import { prop } from 'ramda'

const log = (m: string) => console.log(`\n# ${m}\n`)
const listPrompt = (message: string, options: string[]) =>
  prompt<{ key: string }>([list('key', message, options)]).then(prop('key'))
const confirmPrompt = (message: string) =>
  prompt<{ key: string }>([confirm('key', message + '\n')]).then((result) => {
    if (!result.key) {
      log('Please try again when you have completed this step.')
      process.exit(0)
    }
    console.log()
  })

async function GuidedInstall() {
  log(
    `Welcome to CCF's Guided Install. This tool will walk you through the documentation and automate certain parts of it. Please see https://github.com/ThoughtWorks-Cleantech/cloud-carbon-footprint/tree/trunk/docs for details.`,
  )

  const provider: string = await listPrompt(
    'Choose a cloud provider:',
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
  // ideally the docs live on the microsite and are generated from a json file that this also reads
  // for now just manually copying the docs
  // some of these steps seem like they could be achieved with terraform / provider specific config files

  await confirmPrompt(
    `Ensure your aws account has the correct permissions.\n\t- You will need an [IAM user](https://aws.amazon.com/premiumsupport/knowledge-center/create-access-key/) that can create access-keys and modify your billing settings.`,
  )

  await confirmPrompt(
    `Enable the Cost and Usage Reports Billing AWS feature.\n\t- This feature needs to be enabled so your account can start generating cost and usage reports.\n\t- To enable, navigate to your account's billing section, and click on the "Cost and Usage Reports" tab.\n\t- Make sure to select “Amazon Athena” for report data integration.\n\t- Reference Cost and Usage Reports documentation [here](https://docs.aws.amazon.com/cur/latest/userguide/what-is-cur.html).`,
  )

  await confirmPrompt(
    `Setup Athena DB to save the Cost and Usage Reports.\n\t- In addition to generating reports, we use Athena DB to save the details of those reports in a DB, so we can run queries on them.\n\t- This is a standard AWS integration, outlined [here](https://docs.aws.amazon.com/cur/latest/userguide/cur-query-athena.html)`
  )

  await confirmPrompt(
    `Configure aws credentials locally, using awscli.\n\t- After [installing awscli](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html), run \`aws configure\` and provide your access key and secret access key.\n\t- Also make sure you select the same region as the one you created your cost and usage reports in.`
  )

  log('TODO create env file')

  log('')
}

GuidedInstall().catch((error) => {
  console.error(`Something went wrong: ${error.message}`)
})
