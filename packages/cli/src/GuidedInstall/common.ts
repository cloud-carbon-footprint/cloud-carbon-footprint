/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { promisify } from 'util'
import { exec as execCb } from 'child_process'
import dotenv from 'dotenv'
import fs from 'fs-extra'
import { confirm, input, list, prompt } from 'typed-prompts'
import { prop } from 'ramda'

const exec = promisify(execCb)
const stat = promisify(fs.stat)

export const log = (m: string, leading = true): void =>
  console.log(`${leading ? '\n' : ''}# ${m}\n`)

export const lineBreak = (): void => console.log()

export const listPrompt = (
  message: string,
  options: string[],
): Promise<string> =>
  prompt<{ key: string }>([list('key', message, options)]).then(prop('key'))

export const confirmPrompt = (
  message: string,
  question = 'Is this step complete?',
  requireYes = true,
): Promise<boolean> =>
  prompt<{ key: boolean }>([confirm('key', message + `\n${question}`)])
    .then(prop('key'))
    .then((result) => {
      if (requireYes && !result) {
        log('Please try again when you have completed this step.')
        process.exit(0)
      }
      console.log()
      return result
    })

export const inputPrompt = (
  message: string,
  required = true,
): Promise<string> =>
  prompt<{ key: string }>([input('key', message)])
    .then(prop('key'))
    .then((result: string) => {
      if (required && !result) {
        log('Please enter a value.')
        return inputPrompt(message, required)
      }
      return result
    })

export const runCmd = async (cmd: string): void => {
  try {
    await exec(cmd)
  } catch (error) {
    process.stdout.write(error.stderr)
    process.stdout.write(error.stdout)
    throw new Error(`Could not execute command ${cmd}`)
  }
}
// will load existing .env and overwrite the given keys
export const createEnvFile = async (
  dir: string,
  env: { [key: string]: string },
): void => {
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
