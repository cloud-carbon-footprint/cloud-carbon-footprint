/*
 * © 2021 Thoughtworks, Inc.
 */

import { cachePath } from '../EstimatorCacheFileSystem'
import EstimatorCacheFileSystem from '../EstimatorCacheFileSystem'
import { promises } from 'fs'
import EstimatorCache from '../EstimatorCache'
import moment from 'moment'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import { EstimationRequest } from '../CreateValidRequest'

jest.mock('fs', () => {
  return { promises: { readFile: jest.fn(), writeFile: jest.fn() } }
})

const mockFs = promises as jest.Mocked<typeof promises>

function buildFootprintEstimates(startDate: string, consecutiveDays: number) {
  return [...Array(consecutiveDays)].map((v, i) => {
    return {
      timestamp: moment.utc(startDate).add(i, 'days').toDate(),
      serviceEstimates: [],
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
      }
      const estimates = await estimatorCache.getEstimates(request)

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
      }
      const estimates = await estimatorCache.getEstimates(request)

      //assert
      expect(estimates).toEqual(buildFootprintEstimates(dataFirstDate, 2))
    })

    it('should read from cache file and decode in utf8', async () => {
      //setup
      mockFs.readFile.mockResolvedValueOnce('[]')

      //run
      await estimatorCache.getEstimates({} as EstimationRequest)

      //assert
      expect(mockFs.readFile).toHaveBeenCalledWith(cachePath, 'utf8')
    })

    it('should return empty when file doesnt exist', async () => {
      //setup
      mockFs.readFile.mockRejectedValueOnce('ENOENT: no such file or directory')
      console.warn = jest.fn()

      //run
      const estimates = await estimatorCache.getEstimates(
        {} as EstimationRequest,
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
      await estimatorCache.getEstimates({} as EstimationRequest)

      //assert
      expect(mockFs.writeFile).toHaveBeenCalledWith(cachePath, '[]', 'utf8')
    })
  })

  describe('setEstimates', () => {
    it('should append estimates', async () => {
      //run
      const cachedEstimates = buildFootprintEstimates('2020-04-10', 1)
      const estimatesToSave = buildFootprintEstimates('2020-06-25', 1)

      mockFs.readFile.mockResolvedValueOnce(JSON.stringify(cachedEstimates))

      //setup
      await estimatorCache.setEstimates(estimatesToSave)

      //assert
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        cachePath,
        JSON.stringify(cachedEstimates.concat(estimatesToSave)),
        'utf8',
      )
    })
  })
})
