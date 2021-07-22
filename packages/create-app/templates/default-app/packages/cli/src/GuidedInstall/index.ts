/*
 * © 2021 Thoughtworks, Inc.
 */

/* istanbul ignore file */
import { GuidedInstall } from './runner'

GuidedInstall().catch((error) => {
  console.error(`Something went wrong: ${error.message}`)
})
