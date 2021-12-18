/*
 * © 2021 Thoughtworks, Inc.
 */
import moment from 'moment'
import CacheManager from '../CacheManager'
import EstimatorCacheGoogleCloudStorage from '../EstimatorCacheGoogleCloudStorage'
import EstimatorCacheFileSystem from '../EstimatorCacheFileSystem'
import { EstimationRequest } from '../CreateValidRequest'
import {
  Config as mockConfig,
  EstimationResult,
  GroupBy,
} from '@cloud-carbon-footprint/common'

function buildFootprintEstimates(startDate: string, consecutiveDays: number) {
  return [...Array(consecutiveDays)].map((v, i) => {
    return {
      timestamp: moment.utc(startDate).add(i, 'days').toDate(),
      serviceEstimates: [],
    }
  })
}

const grouping = GroupBy.week
describe('CacheManager - CACHE_MODE: GCS', () => {
  beforeAll(() => {
    mockConfig.GCP.CACHE_BUCKET_NAME = 'test-bucket-name'
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getEstimates', () => {
    it('should return estimates', async () => {
      //setup
      const startDate = '2020-11-02'
      const endDate = '2020-11-03'

      EstimatorCacheGoogleCloudStorage.prototype.getEstimates = jest
        .fn()
        .mockImplementation(() => {
          return buildFootprintEstimates(startDate, 1)
        })

      mockConfig.CACHE_MODE = 'GCS'

      const cacheManager = new CacheManager()

      //run
      const request: EstimationRequest = {
        startDate: moment.utc(startDate).toDate(),
        endDate: moment.utc(endDate).toDate(),
        ignoreCache: false,
        groupBy: grouping,
      }
      const estimates = await cacheManager.getEstimates(
        request,
        request.groupBy,
      )

      //assert
      expect(estimates).toEqual(buildFootprintEstimates(startDate, 1))
    })

    it('should return only requested dates', async () => {
      //setup
      const startDate = '2020-11-02'
      const endDate = '2020-11-04'

      EstimatorCacheGoogleCloudStorage.prototype.getEstimates = jest
        .fn()
        .mockImplementation(() => {
          return buildFootprintEstimates(startDate, 5)
        })

      mockConfig.CACHE_MODE = 'GCS'

      const cacheManager = new CacheManager()

      //run
      const request: EstimationRequest = {
        startDate: moment.utc(startDate).toDate(),
        endDate: moment.utc(endDate).toDate(),
        ignoreCache: false,
        groupBy: grouping,
      }
      const estimates = await cacheManager.getEstimates(
        request,
        request.groupBy,
      )

      //assert
      expect(estimates).toEqual(buildFootprintEstimates(startDate, 3))
    })
  })

  describe('setEstimates', () => {
    it('should return estimates', async () => {
      //setup
      const startDate = '2020-10-01'
      const cachedData: EstimationResult[] = buildFootprintEstimates(
        startDate,
        1,
      )

      EstimatorCacheGoogleCloudStorage.prototype.setEstimates = jest
        .fn()
        .mockImplementation(() => {
          return Promise.resolve()
        })

      mockConfig.CACHE_MODE = 'GCS'

      const cacheManager = new CacheManager()

      //run
      const estimates = await cacheManager.setEstimates(cachedData, 'day')

      //assert
      expect(estimates).resolves
      expect(
        EstimatorCacheGoogleCloudStorage.prototype.setEstimates,
      ).toHaveBeenCalledWith(cachedData, 'day')
    })
    it('should not set estimates on empty data', async () => {
      //setup
      const cachedData: EstimationResult[] = []

      const cacheManager = new CacheManager()

      const setEstimatesSpy = jest.spyOn(
        EstimatorCacheGoogleCloudStorage.prototype,
        'setEstimates',
      )

      //run
      const estimates = await cacheManager.setEstimates(cachedData, 'day')

      //assert
      expect(estimates).resolves
      expect(setEstimatesSpy).not.toHaveBeenCalled()
    })
  })
})

describe('CacheManager - CACHE_MODE: fileSystem', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getEstimates', () => {
    it('should return estimates', async () => {
      //setup
      const startDate = '2020-11-02'
      const endDate = '2020-11-03'
      EstimatorCacheFileSystem.prototype.getEstimates = jest
        .fn()
        .mockImplementation(() => {
          return buildFootprintEstimates(startDate, 1)
        })
      mockConfig.CACHE_MODE = ''
      const cacheManager = new CacheManager()

      //run
      const request: EstimationRequest = {
        startDate: moment.utc(startDate).toDate(),
        endDate: moment.utc(endDate).toDate(),
        ignoreCache: false,
        groupBy: grouping,
      }
      const estimates = await cacheManager.getEstimates(
        request,
        request.groupBy,
      )

      //assert
      expect(estimates).toEqual(buildFootprintEstimates(startDate, 1))
    })
    it('should return only requested dates', async () => {
      //setup
      const startDate = '2020-11-02'
      const endDate = '2020-11-04'
      EstimatorCacheFileSystem.prototype.getEstimates = jest
        .fn()
        .mockImplementation(() => {
          return buildFootprintEstimates(startDate, 5)
        })
      mockConfig.CACHE_MODE = ''
      const cacheManager = new CacheManager()

      //run
      const request: EstimationRequest = {
        startDate: moment.utc(startDate).toDate(),
        endDate: moment.utc(endDate).toDate(),
        ignoreCache: false,
        groupBy: grouping,
      }
      const estimates = await cacheManager.getEstimates(
        request,
        request.groupBy,
      )

      //assert
      expect(estimates).toEqual(buildFootprintEstimates(startDate, 3))
    })
  })

  describe('setEstimates', () => {
    it('should set estimates', async () => {
      //setup
      const startDate = '2020-10-01'
      const cachedData: EstimationResult[] = buildFootprintEstimates(
        startDate,
        1,
      )

      EstimatorCacheFileSystem.prototype.setEstimates = jest
        .fn()
        .mockImplementation(() => {
          return Promise.resolve()
        })

      mockConfig.CACHE_MODE = ''

      const cacheManager = new CacheManager()

      //run
      const estimates = await cacheManager.setEstimates(cachedData, 'day')

      //assert
      expect(estimates).resolves
      expect(
        EstimatorCacheFileSystem.prototype.setEstimates,
      ).toHaveBeenCalledWith(cachedData, 'day')
    })

    it('should not set estimates on empty data', async () => {
      //setup
      const cachedData: EstimationResult[] = []

      const cacheManager = new CacheManager()

      const setEstimatesSpy = jest.spyOn(
        EstimatorCacheFileSystem.prototype,
        'setEstimates',
      )

      //run
      const estimates = await cacheManager.setEstimates(cachedData, 'day')

      //assert
      expect(estimates).resolves
      expect(setEstimatesSpy).not.toHaveBeenCalled()
    })
  })
})
