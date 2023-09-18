/*
 * © 2021 Thoughtworks, Inc.
 */

import { createEnvFile, EnvConfig, listPrompt, microsite } from '../common'
import { log } from '../common/external'
import { AWSSetup } from './aws'
import { GCPSetup } from './gcp'
import { AzureSetup } from './azure'
import { MongoDBSetup } from './mongo'

type ConfigOptions = {
  [key: string]: { setup: () => Promise<EnvConfig>; docs: string }
}

const configOptions: ConfigOptions = {
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
  MongoDB: {
    setup: MongoDBSetup,
    docs: 'docs/data-persistence-and-caching#mongodb-storage',
  },
}

export async function GuidedInstall(): Promise<void> {
  log(
    `Please select an option below to begin guided setup for your Cloud Carbon Footprint app. To complete multiple configuration options (i.e. setup multiple cloud providers), please repeat this script for each additional option. For an understanding of the default configurations and other setup options, please visit the docs on the microsite: ${microsite}/docs/introduction`,
  )

  const selectedOption: string = await listPrompt(
    'Which would you like to configure:',
    Object.keys(configOptions),
  )

  const { setup, docs } = configOptions[selectedOption]
  log(
    `${selectedOption} setup. See ${microsite}${docs} for additional details.`,
  )
  const env = await setup()

  await createEnvFile('./', env)
  await createEnvFile('../api/', env)

  log(
    `Your Cloud Carbon Footprint application's configuration has been updated. You can view these settings in the .env files listed above. To complete additional setup (i.e. add an additional cloud provider), please re-run this script. For questions or more configuration options, please visit ${microsite}/docs/introduction`,
  )
  log(
    `Please make sure your appConfig object in the client Config file (packages/client/src/Config.ts) includes your cloud provider(s) in the CURRENT_PROVIDERS array`,
  )
}
