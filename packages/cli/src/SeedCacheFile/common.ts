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