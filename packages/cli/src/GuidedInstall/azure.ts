/*
 * © 2021 Thoughtworks, Inc.
 */

import { confirmPrompt, EnvConfig, inputPrompt } from './common'
import { lineBreak } from './external'

export async function AzureSetup(): Promise<EnvConfig> {
  const env: EnvConfig = {}
  env.AZURE_USE_BILLING_DATA = 'true'

  await confirmPrompt(
    'Register a new Azure Application via your Azure Portal, under “App Registrations”.\n\t- You do not need to set a Redirect URI or configure platform Settings. Learn more about how to do this [here](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)',
  )

  await confirmPrompt(
    'Within this application, go to “Certificates and secrets”, and create a new Client secret',
  )

  env.AZURE_CLIENT_ID = await inputPrompt('Enter Azure client id:')
  env.AZURE_CLIENT_SECRET = await inputPrompt('Enter Azure client secret:')
  env.AZURE_TENANT_ID = await inputPrompt('Enter Azure tenant id:')
  lineBreak()

  return env
}
