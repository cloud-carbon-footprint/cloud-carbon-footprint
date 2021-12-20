/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import { promises } from 'fs'
import EstimatorCacheFileSystem from '../EstimatorCacheFileSystem'
import EstimatorCache from '../EstimatorCache'
import { EstimationResult, GroupBy } from '@cloud-carbon-footprint/common'
import { EstimationRequest } from '../CreateValidRequest'

jest.mock('fs', () => {
  return { promises: { readFile: jest.fn(), writeFile: jest.fn() } }
})

const mockFs = promises as jest.Mocked<typeof promises>

function buildFootprintEstimates(startDate: string, consecutiveDays: number) {
  const grouping = 'day' as GroupBy
  return [...Array(consecutiveDays)].map((v, i) => {
    return {
      timestamp: moment.utc(startDate).add(i, 'days').toDate(),
      serviceEstimates: [],
      periodStartDate: undefined,
      periodEndDate: undefined,
      groupBy: grouping,
    }
  })
}

describe('EstimatorCacheFileSystem', () => {
  let estimatorCache: EstimatorCache

  beforeEach(() => {
    estimatorCache = new EstimatorCacheFileSystem()
  })

  const originalWarn = console.warn
  afterEach(() => {
    console.warn = originalWarn
    estimatorCache = new EstimatorCacheFileSystem()
  })

  describe('getEstimates', () => {
    const OLD_ENV = process.env

    beforeEach(() => {
      jest.resetModules() // Most important - it clears the cache
      process.env = { ...OLD_ENV } // Make a copy
    })

    afterAll(() => {
      process.env = OLD_ENV // Restore old environment
    })

    it('should return estimates of a request', async () => {
      //setup
      const startDate = '2020-10-01'
      const endDate = '2020-10-02'

      const cachedData: EstimationResult[] = buildFootprintEstimates(
        startDate,
        1,
      )
      mockFs.readFile.mockResolvedValueOnce(JSON.stringify(cachedData))

      //run
      const request: EstimationRequest = {
        startDate: moment.utc(startDate).toDate(),
        endDate: moment.utc(endDate).toDate(),
        ignoreCache: false,
      }
      const estimates = await estimatorCache.getEstimates(request, 'day')

      //assert
      expect(estimates).toEqual(cachedData)
    })

    it('should return the first date in cache data if it is earlier than start date', async () => {
      //setup
      const dataFirstDate = '2020-11-01'
      const startDate = '2020-11-02'
      const endDate = '2020-11-03'

      const cachedData = buildFootprintEstimates(dataFirstDate, 2)

      mockFs.readFile.mockResolvedValueOnce(JSON.stringify(cachedData))

      //run
      const request: EstimationRequest = {
        startDate: moment.utc(startDate).toDate(),
        endDate: moment.utc(endDate).toDate(),
        ignoreCache: false,
      }
      const estimates = await estimatorCache.getEstimates(request, 'day')

      //assert
      expect(estimates).toEqual(buildFootprintEstimates(dataFirstDate, 2))
    })

    it('should read from cache file and decode in utf8', async () => {
      //setup
      mockFs.readFile.mockResolvedValueOnce('[]')

      //run
      await estimatorCache.getEstimates({} as EstimationRequest, 'day')

      //assert
      expect(mockFs.readFile).toHaveBeenCalledWith(
        'estimates.cache.day.json',
        'utf8',
      )
    })

    it('should return empty when file doesnt exist', async () => {
      //setup
      mockFs.readFile.mockRejectedValueOnce('ENOENT: no such file or directory')
      console.warn = jest.fn()

      //run
      const estimates = await estimatorCache.getEstimates(
        {} as EstimationRequest,
        'day',
      )

      //assert
      expect(estimates).toEqual([])
      expect(console.warn).toHaveBeenCalled()
    })

    it('should create the cache file if it does not exist', async () => {
      //setup
      mockFs.readFile.mockRejectedValueOnce('ENOENT: no such file or directory')
      console.warn = jest.fn()

      //run
      await estimatorCache.getEstimates({} as EstimationRequest, 'day')

      //assert
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        'estimates.cache.day.json',
        '[]',
        'utf8',
      )
    })

    it('should use the test file if in test mode', async () => {
      //setup
      mockFs.readFile.mockRejectedValueOnce('ENOENT: no such file or directory')
      console.warn = jest.fn()
      process.env.TEST_MODE = 'true'

      //run
      await estimatorCache.getEstimates({} as EstimationRequest, 'day')

      //assert
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        'mock-estimates.json',
        '[]',
        'utf8',
      )
    })
  })

  describe('setEstimates', () => {
    it('should append estimates', async () => {
      //run
      const cachedEstimates = buildFootprintEstimates('2020-04-10', 1)
      const estimatesToSave = buildFootprintEstimates('2020-06-25', 1)

      mockFs.readFile.mockResolvedValueOnce(JSON.stringify(cachedEstimates))

      //setup
      await estimatorCache.setEstimates(estimatesToSave, 'day')

      //assert
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        'estimates.cache.day.json',
        JSON.stringify(cachedEstimates.concat(estimatesToSave)),
        'utf8',
      )
    })
  })
})
