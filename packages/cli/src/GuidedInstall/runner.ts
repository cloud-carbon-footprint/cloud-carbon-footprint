/*
 * © 2021 Thoughtworks, Inc.
 */

import { createEnvFile, EnvConfig, listPrompt, microsite } from './common'
import { log } from './external'
import { AWSSetup } from './aws'
import { GCPSetup } from './gcp'
import { AzureSetup } from './azure'

type ProvidersConfig = {
  [key: string]: { setup: () => Promise<EnvConfig>; docs: string }
}
const providers: ProvidersConfig = {
  AWS: {
    setup: AWSSetup,
    docs: '/docs/aws',
  },
  GCP: {
    setup: GCPSetup,
    docs: '/docs/gcp',
  },
  Azure: {
    setup: AzureSetup,
    docs: '/docs/azure',
  },
}

export async function GuidedInstall(): Promise<void> {
  log(
    `Please follow the following prompts to configure Cloud Carbon Footprint to connect to a cloud provider. To connect to multiple cloud providers, please repeat this script for each additional provider. For an understanding of the default configurations and other configuration options, please visit the docs on the microsite: ${microsite}/docs/introduction`,
  )

  const provider: string = await listPrompt(
    'Choose a cloud provider to configure:',
    Object.keys(providers),
  )

  const { setup, docs } = providers[provider]
  log(`${provider} setup. See ${microsite}${docs} for additional details.`)
  const env = await setup()

  await createEnvFile('./', env)
  await createEnvFile('../api/', env)

  log(
    `Your Cloud Carbon Footprint application is now configured to use your cloud provider data. You can see these settings in the .env files listed above. To connect to an additional cloud provider or update an existing one, please re-run this script. For questions or more configuration options, please visit ${microsite}/docs/introduction`,
  )
  log(
    `Please make sure your appConfig object in the client Config file (packages/client/src/Config.ts) includes your cloud provider(s) in the CURRENT_PROVIDERS array`,
  )
}
