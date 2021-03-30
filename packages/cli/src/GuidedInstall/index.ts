/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

/* istanbul ignore file */
import { GuidedInstall } from './runner'

GuidedInstall().catch((error) => {
  console.error(`Something went wrong: ${error.message}`)
})
