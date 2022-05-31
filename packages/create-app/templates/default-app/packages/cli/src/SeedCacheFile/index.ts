/*
 * © 2021 Thoughtworks, Inc.
 */

/* istanbul ignore file */
import seedCacheFile from './seedCacheFile'

seedCacheFile().catch((error) => {
  console.error(`Something went wrong: ${error.message}`)
})
