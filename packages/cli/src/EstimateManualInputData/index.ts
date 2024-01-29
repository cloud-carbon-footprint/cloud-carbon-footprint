/*
 * © 2024 Thoughtworks, Inc.
 */

import estimateManualInputData from './EstimateManualInputData'

estimateManualInputData().catch((error) => {
  console.error(`Something went wrong: ${error.message}`)
})
