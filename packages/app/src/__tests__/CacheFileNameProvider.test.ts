/*
 * © 2021 Thoughtworks, Inc.
 */
import { getCacheFileName } from '../CacheFileNameProvider'

describe('getCacheFile', () => {
  const OLD_ENV = process.env
  beforeEach(() => {
    jest.resetModules() // Most important - it clears the cache
    process.env = { ...OLD_ENV } // Make a copy
  })

  afterAll(() => {
    process.env = OLD_ENV // Restore old environment
  })

  it('should use the default prefix if a hard-coded one is not provided', async () => {
    const cacheFile = getCacheFileName('day')
    expect(cacheFile).toEqual('estimates.cache-by-day.json')
  })

  it('should alter the hard-coded cache path if one is provided', async () => {
    process.env.CCF_CACHE_PATH = 'my-cache-file.json'
    const cacheFile = getCacheFileName('day')
    expect(cacheFile).toEqual('my-cache-file-by-day.json')
  })
})
