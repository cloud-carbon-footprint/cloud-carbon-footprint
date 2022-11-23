/**
 * © 2021 Thoughtworks, Inc.
 */

import * as mongo from 'mongodb'
import moment, { Moment } from 'moment'
import {
  configLoader,
  EstimationResult,
  GroupBy,
  Logger,
} from '@cloud-carbon-footprint/common'
import MongoDbCacheManager from '../MongoDbCacheManager'
import { getDatesWithinRequestTimeFrame } from '../common/helpers'
import { EstimationRequest } from '../CreateValidRequest'

jest.mock('mongodb', () => {
  return {
    MongoClient: jest.fn().mockImplementation(() => {
      return {}
    }),
    ServerApiVersion: jest.fn().mockImplementation(() => {
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
      MONGODB: {
        URI: 'test-mongo-uri',
      },
    }
  }),
}))

jest.mock('../common/helpers', () => {
  const requireActual = jest.requireActual('../common/helpers')
  return {
    ...requireActual,
    getDatesWithinRequestTimeFrame: jest.fn(),
  }
})

const mockGetDates = getDatesWithinRequestTimeFrame as jest.Mock
const mockAggregation = jest.fn()

describe('MongoDbCacheManager', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('connects to the mongodb server with URI', async () => {
    jest.spyOn(Logger.prototype, 'debug').mockImplementation()

    const mongoDbCacheManager = new MongoDbCacheManager()
    await mongoDbCacheManager.createDbConnection()

    expect(mongo.MongoClient).toHaveBeenCalledWith('test-mongo-uri')
    expect(Logger.prototype.debug).toHaveBeenCalledWith(
      'Successfully connected to the mongoDB client',
    )
  })

  it('connects to the mongodb server with credentials', async () => {
    ;(configLoader as jest.Mock).mockReturnValue({
      ...configLoader(),
      MONGODB: {
        URI: 'test-mongo-uri',
        CREDENTIALS: 'test-mongo-credentials',
      },
    })
    jest.spyOn(Logger.prototype, 'debug').mockImplementation()

    const mongoDbCacheManager = new MongoDbCacheManager()
    await mongoDbCacheManager.createDbConnection()

    expect(mongo.MongoClient).toHaveBeenCalledWith('test-mongo-uri', {
      serverApi: undefined,
      sslCert: 'test-mongo-credentials',
      sslKey: 'test-mongo-credentials',
    })

    expect(Logger.prototype.debug).toHaveBeenCalledWith(
      'Successfully connected to the mongoDB client',
    )
  })

  it('throws an error when there is no uri set', async () => {
    ;(configLoader as jest.Mock).mockReturnValue({
      ...configLoader(),
      MONGODB: {
        URI: '',
      },
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
    const mockClient: Partial<mongo.MongoClient> = {
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
          mongoDbCacheManager.mongoClient = mockClient as mongo.MongoClient
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
          mongoDbCacheManager.mongoClient = mockClient as mongo.MongoClient
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
    let mockClient: Partial<mongo.MongoClient>
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
      groupBy: 'day',
      skip: 0,
      limit: 1,
    }

    beforeEach(() => {
      mockClient = {
        db: jest.fn().mockImplementation(() => ({
          listCollections: jest.fn().mockImplementation(() => ({
            next: jest.fn().mockImplementation((callback) => {
              callback(undefined, { name: 'test-collection' })
            }),
          })),
          collection: jest.fn().mockImplementation(() => ({
            aggregate: mockAggregation.mockImplementation(() => ({
              toArray: jest.fn().mockResolvedValue(mockEstimates),
            })),
          })),
        })),
        close: jest.fn(),
        connect: jest.fn(),
      }
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('loads estimates from a mongo database collection', async () => {
      jest.spyOn(Logger.prototype, 'info').mockImplementation()

      const mongoDbCacheManager = new MongoDbCacheManager()

      jest
        .spyOn(MongoDbCacheManager.prototype, 'createDbConnection')
        .mockImplementation(async () => {
          mongoDbCacheManager.mongoClient = mockClient as mongo.MongoClient
        })

      await mongoDbCacheManager.createDbConnection()
      const estimates = await mongoDbCacheManager.loadEstimates(
        mongoDbCacheManager.mongoClient.db(mongoDbCacheManager.mongoDbName),
        'estimates-by-day',
        request,
      )

      expect(Logger.prototype.info).toHaveBeenCalledWith(
        `Paginating documents: ${request.skip} to ${
          request.skip + request.limit
        }`,
      )
      expect(estimates).toEqual(mockEstimates)
    })

    it('creates a new mongo collection if one does not exist', async () => {
      const mockClientWithoutCollection: Partial<mongo.MongoClient> = {
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
      jest.spyOn(Logger.prototype, 'info').mockImplementation()
      jest
        .spyOn(MongoDbCacheManager.prototype, 'createDbConnection')
        .mockImplementation(async () => {
          mongoDbCacheManager.mongoClient =
            mockClientWithoutCollection as mongo.MongoClient
        })

      await mongoDbCacheManager.createDbConnection()
      const estimates = await mongoDbCacheManager.loadEstimates(
        mongoDbCacheManager.mongoClient.db(mongoDbCacheManager.mongoDbName),
        'estimates-by-day',
        request,
      )

      expect(estimates).toEqual([])
    })

    it.each([
      [['cloudProviders', ['test-cloud-providers'], 'cloudProvider']],
      [['accounts', ['test-accounts'], 'accountId', ,]],
      [['services', ['test-services'], 'serviceName']],
      [['regions', ['test-regions'], 'region']],
      [['tags', { 'test-key': 'test-tag' }, 'tags.test-key']],
    ])('determines matching filters', async (filter) => {
      const request: EstimationRequest = {
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-01-02'),
        limit: 1,
        skip: 0,
        ignoreCache: false,
        [`${filter[0]}`]: filter[1],
      }

      const mongoDbCacheManager = new MongoDbCacheManager()

      jest
        .spyOn(MongoDbCacheManager.prototype, 'createDbConnection')
        .mockImplementation(async () => {
          mongoDbCacheManager.mongoClient = mockClient as mongo.MongoClient
        })

      await mongoDbCacheManager.createDbConnection()
      const estimates = await mongoDbCacheManager.loadEstimates(
        mongoDbCacheManager.mongoClient.db(mongoDbCacheManager.mongoDbName),
        'estimates-by-day',
        request,
      )

      const filterValue =
        filter[0] === 'tags' ? filter[1]['test-key'] : filter[1]
      const matchOperator = filter[0] === 'tags' ? '$eq' : '$in'

      const aggregation = [
        {
          $match: {
            [`${filter[2]}`]: { [matchOperator]: filterValue },
            timestamp: {
              $gte: new Date('2022-01-01T00:00:00.000Z'),
              $lte: new Date('2022-01-02T00:00:00.000Z'),
            },
          },
        },
        { $sort: { _id: 1, timestamp: 1 } },
        { $skip: 0 },
        { $limit: 1 },
        {
          $group: {
            _id: '$timestamp',
            groupBy: { $first: '$groupBy' },
            serviceEstimates: { $push: '$$ROOT' },
            timestamp: { $first: '$timestamp' },
          },
        },
        {
          $unset: [
            '_id',
            'serviceEstimates._id',
            'serviceEstimates.timestamp',
            'serviceEstimates.groupBy',
          ],
        },
      ]

      expect(mockAggregation).toHaveBeenCalledWith(aggregation, {
        allowDiskUse: true,
      })
      expect(estimates).toEqual(mockEstimates)
    })
  })

  describe('sets estimates', () => {
    const testDate = new Date('2022-01-01')
    const mockEstimates: EstimationResult[] = [
      {
        timestamp: testDate,
        groupBy: GroupBy.day,
        serviceEstimates: [
          {
            cloudProvider: 'aws',
            accountId: '1',
            accountName: 'test-account',
            serviceName: 'test-service',
            kilowattHours: 5,
            co2e: 10,
            cost: 5,
            region: 'test-region',
            usesAverageCPUConstant: false,
          },
          {
            cloudProvider: 'aws',
            accountId: '2',
            accountName: 'test-account-2',
            serviceName: 'test-service-2',
            kilowattHours: 5,
            co2e: 15,
            cost: 8,
            region: 'test-region',
            usesAverageCPUConstant: false,
          },
        ],
        periodStartDate: testDate,
        periodEndDate: testDate,
      },
      {
        timestamp: testDate,
        groupBy: GroupBy.day,
        serviceEstimates: [
          {
            cloudProvider: 'aws',
            accountId: '1',
            accountName: 'test-account',
            serviceName: 'test-service',
            kilowattHours: 5,
            co2e: 10,
            cost: 5,
            region: 'test-region',
            usesAverageCPUConstant: false,
          },
        ],
        periodStartDate: testDate,
        periodEndDate: testDate,
      },
    ]

    beforeEach(() => {
      ;(configLoader as jest.Mock).mockReturnValue({
        ...configLoader(),
        MONGO_URI: 'test-mongo-uri',
      })
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('successfully sets estimates to a mongoDB collection', async () => {
      const mongoDbCacheManager = new MongoDbCacheManager()

      const mockInsertMany = jest.fn()
      const mockCollection = jest
        .fn()
        .mockImplementation(() => ({ insertMany: mockInsertMany }))

      const mockClient: Partial<mongo.MongoClient> = {
        db: jest.fn().mockImplementation(() => {
          return {
            collection: mockCollection,
          }
        }),
        close: jest.fn(),
        connect: jest.fn(),
      }

      jest
        .spyOn(MongoDbCacheManager.prototype, 'createDbConnection')
        .mockImplementation(async () => {
          mongoDbCacheManager.mongoClient = mockClient as mongo.MongoClient
        })

      await mongoDbCacheManager.setEstimates(mockEstimates, 'day')

      // Should insert flat service estimates with timestamp and groupBy appended to each
      const expectedInsertedEstimates = [
        {
          cloudProvider: 'aws',
          accountId: '1',
          accountName: 'test-account',
          serviceName: 'test-service',
          kilowattHours: 5,
          co2e: 10,
          cost: 5,
          region: 'test-region',
          usesAverageCPUConstant: false,
          timestamp: testDate,
          groupBy: GroupBy.day,
        },
        {
          cloudProvider: 'aws',
          accountId: '2',
          accountName: 'test-account-2',
          serviceName: 'test-service-2',
          kilowattHours: 5,
          co2e: 15,
          cost: 8,
          region: 'test-region',
          usesAverageCPUConstant: false,
          timestamp: testDate,
          groupBy: GroupBy.day,
        },
        {
          cloudProvider: 'aws',
          accountId: '1',
          accountName: 'test-account',
          serviceName: 'test-service',
          kilowattHours: 5,
          co2e: 10,
          cost: 5,
          region: 'test-region',
          usesAverageCPUConstant: false,
          timestamp: testDate,
          groupBy: GroupBy.day,
        },
      ]

      expect(mockCollection).toHaveBeenCalledWith('estimates-by-day')
      expect(mockInsertMany).toHaveBeenCalledWith(expectedInsertedEstimates)
      expect(mockClient.close).toHaveBeenCalled()
    })
  })
  describe('gets missing dates', () => {
    let mockClient: Partial<mongo.MongoClient>
    const testDate = new Date('2022-01-01')
    const mockMissingDates: Moment[] = [
      moment.utc('2022-01-01'),
      moment.utc('2022-01-02'),
    ]

    const request = {
      startDate: testDate,
      endDate: new Date('2022-01-02'),
      ignoreCache: false,
      groupBy: 'day',
      skip: 0,
      limit: 1,
    }

    beforeEach(() => {
      mockClient = {
        db: jest.fn().mockImplementation(() => ({
          listCollections: jest.fn().mockImplementation(() => ({
            next: jest.fn().mockImplementation((callback) => {
              callback(undefined, { name: 'test-collection' })
            }),
          })),
          collection: jest.fn().mockImplementation(() => ({
            countDocuments: jest.fn().mockResolvedValue([{ dates: [] }]),
            aggregate: mockAggregation.mockImplementation(() => ({
              toArray: jest.fn().mockResolvedValue([{ dates: ['2022-01-01'] }]),
            })),
          })),
        })),
        close: jest.fn(),
        connect: jest.fn(),
      }
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('loads dates from mongo to calculate missing dates from request', async () => {
      const mongoDbCacheManager = new MongoDbCacheManager()

      jest
        .spyOn(MongoDbCacheManager.prototype, 'createDbConnection')
        .mockImplementation(async () => {
          mongoDbCacheManager.mongoClient = mockClient as mongo.MongoClient
        })

      mockGetDates.mockReturnValue(mockMissingDates)
      const aggregation = [
        {
          $group: {
            _id: null,
            dates: {
              $addToSet: {
                $dateToString: {
                  date: '$timestamp',
                  format: '%Y-%m-%d',
                },
              },
            },
          },
        },
      ]

      await mongoDbCacheManager.createDbConnection()
      const missingDates = await mongoDbCacheManager.getMissingDates(
        request,
        'day',
      )

      expect(mockAggregation).toHaveBeenCalledWith(aggregation, {
        allowDiskUse: true,
      })
      expect(JSON.stringify(missingDates)).toEqual(
        JSON.stringify([moment.utc(new Date('2022-01-02'))]),
      )
    })

    it('returns all dates in range for missing dates if ignoreCache=true', async () => {
      const mongoDbCacheManager = new MongoDbCacheManager()

      const newRequest = {
        ...request,
        ignoreCache: true,
      }

      mockGetDates.mockReturnValue(mockMissingDates)

      const missingDates = await mongoDbCacheManager.getMissingDates(
        newRequest,
        'day',
      )

      expect(JSON.stringify(missingDates)).toEqual(
        JSON.stringify(mockMissingDates),
      )
    })

    it('returns only the missing dates of a specific cloud provider when configured', async () => {
      const mongoDbCacheManager = new MongoDbCacheManager()

      jest
        .spyOn(MongoDbCacheManager.prototype, 'createDbConnection')
        .mockImplementation(async () => {
          mongoDbCacheManager.mongoClient = mockClient as mongo.MongoClient
        })

      mockGetDates.mockReturnValue(mockMissingDates)
      const newRequest = {
        ...request,
        cloudProviderToSeed: 'AWS',
      }
      const aggregation = [
        {
          $group: {
            _id: null,
            dates: {
              $addToSet: {
                $cond: {
                  if: {
                    $eq: ['$cloudProvider', newRequest.cloudProviderToSeed],
                  },
                  then: '$timestamp',
                  else: '$$REMOVE',
                },
              },
            },
          },
        },
      ]

      await mongoDbCacheManager.createDbConnection()
      const missingDates = await mongoDbCacheManager.getMissingDates(
        newRequest,
        'day',
      )

      expect(mockAggregation).toHaveBeenCalledWith(aggregation, {
        allowDiskUse: true,
      })

      expect(JSON.stringify(missingDates)).toEqual(
        JSON.stringify([moment.utc(new Date('2022-01-02'))]),
      )
    })

    it('hits an error getting missing dates if requested dates is undefined', async () => {
      const mongoDbCacheManager = new MongoDbCacheManager()

      mockGetDates.mockReturnValue(undefined)

      jest.spyOn(Logger.prototype, 'warn').mockImplementation()

      jest
        .spyOn(MongoDbCacheManager.prototype, 'createDbConnection')
        .mockImplementation(async () => {
          mongoDbCacheManager.mongoClient = mockClient as mongo.MongoClient
        })

      await mongoDbCacheManager.createDbConnection()
      const missingDates = await mongoDbCacheManager.getMissingDates(
        request,
        'day',
      )

      expect(Logger.prototype.warn).toHaveBeenCalled()
      expect(missingDates).toEqual([])
    })
  })
})
