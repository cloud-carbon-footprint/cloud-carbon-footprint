/*
 * © 2021 Thoughtworks, Inc.
 */

/* istanbul ignore file */
import seedCacheFile from './seedCacheFile'

seedCacheFile()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`Something went wrong: ${error.message}`)
  })
