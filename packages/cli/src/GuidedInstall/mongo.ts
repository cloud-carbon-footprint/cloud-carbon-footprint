import { confirmPrompt, EnvConfig, inputPrompt } from '../common'
import { lineBreak } from '../common/external'

export async function MongoDBSetup(): Promise<EnvConfig> {
  const env: EnvConfig = {}
  env.CACHE_MODE = 'MONGODB'

  await confirmPrompt(
    'Ensure you have setup your MongoDB service using a locally hosted instance or a cloud-hosted instance with MongoDB Atlas. Learn more about MongoDB setup here: https://www.cloudcarbonfootprint.org/docs/data-persistence-and-caching#mongodb-storage',
  )

  await confirmPrompt(
    'If your MongoDB instance has access control enabled (recommended), you will need to provide the appropriate read/write access credentials. Please make sure to closely follow the steps for creating an authenticated user or X.509 certification. You can reference the authentication steps here: https://www.mongodb.com/docs/manual/core/authentication/',
  )

  env.MONGODB_URI = await inputPrompt(
    'Enter the URI connection string for your hosted MongoDB instance. If using an authentication method, please make sure to use the formatted URI with the necessary credentials:',
  )

  lineBreak()

  const configureCredentialsFilePath = await confirmPrompt(
    'If you have chosen and downloaded an X.509 Certificate as your authentication option, a file path to the certificate will need to be provided if it is not in the connection string.',
    'Would you like to configure this file path?',
    false,
  )

  if (configureCredentialsFilePath) {
    env.MONGODB_CREDENTIALS = await inputPrompt(
      'Enter the path to your X.509 Certificate file: ',
    )
  }

  return env
}
