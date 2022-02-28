/*
 * © 2021 Thoughtworks, Inc.
 */

/* istanbul ignore file */
import estimateOnPremiseData from './estimateOnPremiseData'

estimateOnPremiseData().catch((error) => {
  console.error(`Something went wrong: ${error.message}`)
})
