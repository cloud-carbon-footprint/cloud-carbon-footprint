/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { listPrompt, log } from './common'
import { AWSSetup } from './aws'

type ProvidersConfig = { [key: string]: () => Promise<void> }
const providers: ProvidersConfig = {
  AWS: AWSSetup,
  GCP: () => null,
  Azure: () => null,
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

GuidedInstall().catch((error) => {
  console.error(`Something went wrong: ${error.message}`)
})
