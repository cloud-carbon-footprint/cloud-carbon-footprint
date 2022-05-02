/*
 * © 2021 Thoughtworks, Inc.
 */

import { confirm, input, list } from 'typed-prompts'
import { prop } from 'ramda'
import {
  exit,
  lineBreak,
  log,
  prompt,
  readConfig,
  resolve,
  stat,
  writeFile,
} from './external'

export type EnvConfig = { [key: string]: string }

export const microsite = 'https://cloud-carbon-footprint.org'

export const listPrompt = (
  message: string,
  options: string[],
): Promise<string> =>
  prompt<{ key: string }>(list('key', message, options)).then(prop('key'))

export const confirmPrompt = (
  message: string,
  question = 'Is this step complete?',
  requireYes = true,
): Promise<boolean> =>
  prompt<{ key: boolean }>(confirm('key', message + `\n${question}`))
    .then(prop('key'))
    .then((result) => {
      if (requireYes && !result) {
        log('Please try again when you have completed this step.')
        exit()
      }
      lineBreak()
      return result
    })

export const inputPrompt = (
  message: string,
  required = true,
): Promise<string> =>
  prompt<{ key: string }>(input('key', message))
    .then(prop('key'))
    .then((result: string) => {
      if (required && !result) {
        log('Please enter a value.')
        return inputPrompt(message, required)
      }
      return result
    })

export const createEnvFile = async (
  dir: string,
  env: { [key: string]: string },
): Promise<void> => {
  const path = resolve(`${dir}.env`)
  log(`Creating/updating ${path}...`, false)
  const exists = await stat(path)
    .then(() => true)
    .catch(() => false)

  const existing = exists ? readConfig(path) : { parsed: undefined }
  if (existing.error) {
    throw existing.error
  }

  const newEnv = { ...existing.parsed, ...env }
  await writeFile(
    path,
    Object.entries(newEnv).reduce(
      (config, [k, v]) => `${config}${k}=${v}\n`,
      '',
    ),
  )
  log('...done', false)
}
