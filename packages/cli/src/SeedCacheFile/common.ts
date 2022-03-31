/*
 * © 2021 Thoughtworks, Inc.
 */

import { input } from 'typed-prompts'
import { prop } from 'ramda'
import { log, prompt } from './external'

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
