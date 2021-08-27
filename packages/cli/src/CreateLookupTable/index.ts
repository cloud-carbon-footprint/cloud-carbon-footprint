/*
 * © 2021 Thoughtworks, Inc.
 */

/* istanbul ignore file */
import createLookupTable from './createLookupTable'

createLookupTable().catch((error) => {
  console.error(`Something went wrong: ${error.message}`)
})
