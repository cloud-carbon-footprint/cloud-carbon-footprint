/*
 * © 2021 Thoughtworks, Inc.
 */

export const defaultCachePrefix = 'estimates.cache'

/**
 * Returns the file name
 * @param grouping
 */
export function getCacheFileName(grouping: string): string {
  const cachePrefix = process.env.CCF_CACHE_PATH || defaultCachePrefix
  const existingFileExtension = cachePrefix.lastIndexOf('.json')
  const prefix =
    existingFileExtension !== -1
      ? cachePrefix.substr(0, existingFileExtension)
      : cachePrefix
  return `${prefix}-by-${grouping}.json`
}
