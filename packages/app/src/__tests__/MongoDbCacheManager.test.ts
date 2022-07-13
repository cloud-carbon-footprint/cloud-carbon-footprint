/**
 * © 2021 Thoughtworks, Inc.
 */

import * as mongo from 'mongodb'
import {
  configLoader,
  EstimationResult,
  GroupBy,
  Logger,
} from '@cloud-carbon-footprint/common'
import MongoDbCacheManager from '../MongoDbCacheManager'
import { MongoClient } from 'mongodb'

jest.mock('mongodb', () => {
  return {
    MongoClient: jest.fn().mockImplementation(() => {
      return {}
    }),
  }
})

jest.mock('@cloud-carbon-footprint/common', () => ({
  ...(jest.requireActual('@cloud-carbon-footprint/common') as Record<
    string,
    unknown
  >),
  configLoader: jest.fn().mockImplementation(() => {
    return {
      MONGO_URI: 'test-mongo-uri',
    }
  }),
}))

describe('MongoDbCacheManager', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('connects to the mongodb server', async () => {
    jest.spyOn(Logger.prototype, 'info').mockImplementation()

    const mongoDbCacheManager = new MongoDbCacheManager()
    await mongoDbCacheManager.createDbConnection()

    expect(mongo.MongoClient).toHaveBeenCalledWith('test-mongo-uri')
    expect(Logger.prototype.info).toHaveBeenCalledWith(
      'Successfully connected to the mongoDB client',
    )
  })

  it('throws an error when there is no uri set', async () => {
    ;(configLoader as jest.Mock).mockReturnValue({
      ...configLoader(),
      MONGO_URI: '',
    })

    jest.spyOn(Logger.prototype, 'warn').mockImplementation()

    const mongoDbCacheManager = new MongoDbCacheManager()
    await mongoDbCacheManager.createDbConnection()

    expect(mongo.MongoClient).not.toHaveBeenCalled()
    expect(Logger.prototype.warn).toHaveBeenCalledWith(
      'There was an error connecting to the MongoDB client, please provide a valid URI',
    )
  })

  describe('gets estimates', () => {
    const mockClient: Partial<MongoClient> = {
      db: jest.fn().mockReturnThis(),
      close: jest.fn(),
      connect: jest.fn(),
    }

    const testDate = new Date('2022-01-01')
    const mockEstimates: EstimationResult[] = [
      {
        timestamp: testDate,
        groupBy: GroupBy.day,
        serviceEstimates: [],
        periodStartDate: testDate,
        periodEndDate: testDate,
      },
    ]

    const request = {
      startDate: testDate,
      endDate: new Date('2022-01-02'),
      ignoreCache: false,
    }

    beforeEach(() => {
      ;(configLoader as jest.Mock).mockReturnValue({
        ...configLoader(),
        MONGO_URI: 'test-mongo-uri',
      })
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('successfully gets estimates', async () => {
      const mongoDbCacheManager = new MongoDbCacheManager()

      jest
        .spyOn(MongoDbCacheManager.prototype, 'createDbConnection')
        .mockImplementation(async () => {
          mongoDbCacheManager.mongoClient = mockClient as MongoClient
        })

      const loadEstimatesSpy = jest.spyOn(mongoDbCacheManager, 'loadEstimates')
      ;(loadEstimatesSpy as jest.Mock).mockResolvedValue(mockEstimates)

      const estimates = await mongoDbCacheManager.getEstimates(request, 'day')

      expect(estimates).toEqual(mockEstimates)
    })

    it('logs a warning when there is an error getting estimates', async () => {
      jest.spyOn(Logger.prototype, 'warn').mockImplementation()
      const mongoDbCacheManager = new MongoDbCacheManager()

      jest
        .spyOn(MongoDbCacheManager.prototype, 'createDbConnection')
        .mockImplementation(async () => {
          mongoDbCacheManager.mongoClient = mockClient as MongoClient
        })

      const testErrorMessage = 'Example error'

      const loadEstimatesSpy = jest.spyOn(mongoDbCacheManager, 'loadEstimates')
      ;(loadEstimatesSpy as jest.Mock).mockRejectedValue(
        new Error(testErrorMessage),
      )

      const estimates = await mongoDbCacheManager.getEstimates(request, 'day')

      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        `There was an error getting estimates from MongoDB: ${testErrorMessage}`,
      )
      expect(estimates).toEqual([])
    })
  })

  describe('loads estimates', () => {
    let mockClient: Partial<MongoClient>
    const testDate = new Date('2022-01-01')
    const mockEstimates: EstimationResult[] = [
      {
        timestamp: testDate,
        groupBy: GroupBy.day,
        serviceEstimates: [],
        periodStartDate: testDate,
        periodEndDate: testDate,
      },
    ]

    const request = {
      startDate: testDate,
      endDate: new Date('2022-01-02'),
      ignoreCache: false,
    }

    beforeEach(() => {
      mockClient = {
        db: jest.fn().mockImplementation(() => {
          return {
            listCollections: jest.fn().mockImplementation(() => {
              return {
                next: jest.fn().mockImplementation((callback) => {
                  callback(undefined, { name: 'test-collection' })
                }),
              }
            }),
            collection: jest.fn().mockImplementation(() => {
              return {
                aggregate: jest.fn().mockImplementation(() => {
                  return {
                    toArray: jest.fn().mockResolvedValue(mockEstimates),
                  }
                }),
              }
            }),
          }
        }),
        close: jest.fn(),
        connect: jest.fn(),
      }
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('loads estimates from a mongo database collection', async () => {
      jest.spyOn(console, 'info').mockImplementation()

      const mongoDbCacheManager = new MongoDbCacheManager()

      jest
        .spyOn(MongoDbCacheManager.prototype, 'createDbConnection')
        .mockImplementation(async () => {
          mongoDbCacheManager.mongoClient = mockClient as MongoClient
        })

      await mongoDbCacheManager.createDbConnection()
      const estimates = await mongoDbCacheManager.loadEstimates(
        mongoDbCacheManager.mongoClient.db(mongoDbCacheManager.mongoDbName),
        'estimates-by-day',
        request,
      )

      expect(console.info).toHaveBeenCalledWith(
        'Successfully connected to database collection: estimates-by-day',
      )
      expect(estimates).toEqual(mockEstimates)
    })

    it('creates a new mongo collection if one does not exist', async () => {
      const mockClientWithoutCollection: Partial<MongoClient> = {
        db: jest.fn().mockImplementation(() => {
          return {
            createCollection: jest.fn(),
            listCollections: jest.fn().mockImplementation(() => {
              return {
                next: jest.fn().mockImplementation((callback) => {
                  callback()
                }),
              }
            }),
            collection: jest.fn().mockImplementation(),
          }
        }),
        close: jest.fn(),
        connect: jest.fn(),
      }

      const mongoDbCacheManager = new MongoDbCacheManager()

      jest
        .spyOn(MongoDbCacheManager.prototype, 'createDbConnection')
        .mockImplementation(async () => {
          mongoDbCacheManager.mongoClient =
            mockClientWithoutCollection as MongoClient
        })

      await mongoDbCacheManager.createDbConnection()
      const estimates = await mongoDbCacheManager.loadEstimates(
        mongoDbCacheManager.mongoClient.db(mongoDbCacheManager.mongoDbName),
        'estimates-by-day',
        request,
      )

      expect(console.info).toHaveBeenCalledWith(
        'Creating new database collection: estimates-by-day',
      )
      expect(estimates).toEqual([])
    })
  })
})
