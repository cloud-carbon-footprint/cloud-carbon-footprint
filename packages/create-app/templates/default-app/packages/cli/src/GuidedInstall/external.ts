/*
 * © 2021 Thoughtworks, Inc.
 */

/* istanbul ignore file */
import { exec as _exec } from 'child_process'
import fs from 'fs-extra'
import { promisify } from 'util'
import { prompt as _prompt, Question } from 'typed-prompts'
import { resolve as _resolve } from 'path'
import dotenv from 'dotenv'

export const exec = promisify(_exec)

export const stat = promisify(fs.stat)

export const writeFile = fs.writeFile

export const log = (m: string, leading = true): void =>
  console.log(`${leading ? '\n' : ''}# ${m}\n`)

export const lineBreak = (): void => console.log()

export const exit = (code = 0): void => process.exit(code)

export const prompt = <T>(question: Question): Promise<T> =>
  _prompt<T>([question])

export const readConfig = (
  path: string,
): { parsed?: { [key: string]: string }; error?: Error } =>
  dotenv.config({ path })

export const resolve = _resolve

export const runCmd = async (cmd: string): Promise<void> => {
  try {
    await exec(cmd)
  } catch (error) {
    process.stdout.write(error.stderr)
    process.stdout.write(error.stdout)
    throw new Error(`Could not execute command ${cmd}`)
  }
}
