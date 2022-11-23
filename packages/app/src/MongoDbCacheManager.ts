/*
 * © 2021 Thoughtworks, Inc.
 */

import moment, { Moment } from 'moment'
import { MongoClient, ServerApiVersion } from 'mongodb'
import { configLoader, EstimationResult } from '@cloud-carbon-footprint/common'
import CacheManager from './CacheManager'
import { EstimationRequest } from './CreateValidRequest'
import { getDatesWithinRequestTimeFrame } from './common/helpers'

export default class MongoDbCacheManager extends CacheManager {
  mongoClient: MongoClient
  mongoDbName: string
  constructor() {
    super()
    this.mongoDbName = 'ccf'
  }

  async createDbConnection() {
    const mongoURI = configLoader().MONGODB.URI
    const mongoCredentials = configLoader().MONGODB.CREDENTIALS
    if (mongoCredentials && mongoURI) {
      this.mongoClient = new MongoClient(mongoURI, {
        sslKey: mongoCredentials,
        sslCert: mongoCredentials,
        serverApi: ServerApiVersion.v1,
      })
      this.cacheLogger.debug('Successfully connected to the mongoDB client')
    } else if (mongoURI) {
      this.mongoClient = new MongoClient(mongoURI)
      this.cacheLogger.debug('Successfully connected to the mongoDB client')
    } else {
      this.cacheLogger.warn(
        `There was an error connecting to the MongoDB client, please provide a valid URI`,
      )
    }
  }

  async loadEstimates(
    db: any,
    collectionName: string,
    request: EstimationRequest,
  ): Promise<EstimationResult[]> {
    const unitOfTime =
      request.groupBy === 'week'
        ? 'isoWeek'
        : (request.groupBy as moment.unitOfTime.StartOf)
    const startDate = new Date(
      moment.utc(request.startDate).startOf(unitOfTime) as unknown as Date,
    )
    const endDate = new Date(request.endDate)

    const filters = this.createAggregationFilters(request, startDate, endDate)
    const aggregationStages = this.createAggregationStages(request, filters)

    return new Promise(function (resolve, reject) {
      db.listCollections({ name: collectionName }).next(
        async (err: Error, collectionInfo: any) => {
          if (err) reject(err)
          if (collectionInfo) {
            const estimates = db.collection(collectionName)

            resolve(
              estimates
                .aggregate(aggregationStages, { allowDiskUse: true })
                .toArray() as EstimationResult[],
            )
          } else {
            // The collection does not exist - so we can create it
            db.createCollection(collectionName)
            resolve([])
          }
        },
      )
    })
  }

  async getEstimates(
    request: EstimationRequest,
    grouping: string,
  ): Promise<EstimationResult[]> {
    let savedEstimates: EstimationResult[] = []
    try {
      await this.createDbConnection()
      // Connect the client to the server
      await this.mongoClient.connect()

      // Specify a database to query
      const collectionName = `estimates-by-${grouping}`
      const database = this.mongoClient.db(this.mongoDbName)

      const estimates = await this.loadEstimates(
        database,
        collectionName,
        request,
      )

      savedEstimates = estimates ?? []
    } catch (e) {
      this.cacheLogger.warn(
        `There was an error getting estimates from MongoDB: ${e.message}`,
      )
    } finally {
      // Ensures that the client will close when you finish/error
      await this.mongoClient.close()
    }
    return savedEstimates
  }

  async setEstimates(
    estimates: EstimationResult[],
    grouping: string,
  ): Promise<void> {
    try {
      await this.createDbConnection()
      await this.mongoClient.connect()

      const collectionName = `estimates-by-${grouping}`
      const database = this.mongoClient.db(this.mongoDbName)
      const collection = database.collection(collectionName)

      const newEstimates: any[] = []
      estimates.forEach((estimate) => {
        estimate.serviceEstimates.forEach((serviceEstimate) => {
          const newDocument = {
            ...serviceEstimate,
            timestamp: estimate['timestamp'],
            groupBy: estimate['groupBy'],
          }
          newEstimates.push(newDocument)
        })
      })

      await collection.insertMany(newEstimates)
    } catch (e) {
      this.cacheLogger.warn(
        `There was an error setting estimates from MongoDB: ${e.message}`,
      )
    } finally {
      // Ensures that the client will close when you finish/error
      await this.mongoClient.close()
    }
  }

  async getMissingDates(
    request: EstimationRequest,
    grouping: string,
  ): Promise<Moment[]> {
    this.cacheLogger.info('Using mongo database...')
    const requestedDates = getDatesWithinRequestTimeFrame(grouping, request)

    if (request.ignoreCache) {
      return requestedDates
    }

    try {
      await this.createDbConnection()
      await this.mongoClient.connect()

      const collectionName = `estimates-by-${grouping}`
      const database = this.mongoClient.db(this.mongoDbName)

      const aggResult: any = await new Promise((resolve, reject) => {
        database
          .listCollections({ name: collectionName })
          .next(async (err: Error, collectionInfo: any) => {
            if (err) reject(err)

            if (!collectionInfo) {
              resolve([{ dates: [] }])
            }

            const estimates = database.collection(collectionName)
            await estimates.countDocuments((err, count) => {
              if (!err && count === 0) {
                resolve([{ dates: [] }])
              }
            })

            let addToSet: unknown = {
              $dateToString: {
                date: '$timestamp',
                format: '%Y-%m-%d',
              },
            }

            if (request.cloudProviderToSeed) {
              addToSet = {
                $cond: {
                  if: {
                    $eq: ['$cloudProvider', request.cloudProviderToSeed],
                  },
                  then: '$timestamp',
                  else: '$$REMOVE',
                },
              }
            }

            resolve(
              await estimates
                .aggregate(
                  [
                    {
                      $group: {
                        _id: null,
                        dates: {
                          $addToSet: addToSet,
                        },
                      },
                    },
                  ],
                  { allowDiskUse: true },
                )
                .toArray(),
            )
          })
      })

      const cachedDates = aggResult[0].dates
      const missingDates = requestedDates.filter((a) => {
        const index = cachedDates.findIndex((cachedDate: string) =>
          moment.utc(cachedDate).isSame(a),
        )
        return index < 0
      })

      return missingDates.map((date: Moment) => {
        return date
      })
    } catch (e) {
      this.cacheLogger.warn(
        `There was an error getting missing dates from MongoDB: ${e.message}`,
      )
      return []
    }
  }

  private createAggregationFilters(
    request: EstimationRequest,
    startDate: Date,
    endDate: Date,
  ) {
    const { cloudProviders, accounts, services, regions, tags } = request
    const filterTable = {
      cloudProvider: cloudProviders,
      accountId: accounts,
      serviceName: services,
      region: regions,
    }
    let aggregationFilters = {
      timestamp: { $gte: startDate, $lte: endDate },
    }

    for (const [key, value] of Object.entries(filterTable)) {
      if (value && value.length > 0) {
        aggregationFilters = {
          [key]: { $in: value },
          ...aggregationFilters,
        }
      }
    }

    if (tags && Object.entries(tags)[0])
      for (const [key, value] of Object.entries(tags)) {
        aggregationFilters = {
          [`tags.${key}`]: { $eq: value },
          ...aggregationFilters,
        }
      }

    return aggregationFilters
  }

  private createAggregationStages(
    request: EstimationRequest,
    filters: unknown,
  ) {
    // Init with pre-query stages
    const aggregationStages: unknown[] = [
      {
        $match: filters,
      },
      {
        $sort: {
          timestamp: 1,
          _id: 1,
        },
      },
    ]

    // Optionally build pagination stages
    if (!isNaN(request.skip)) aggregationStages.push({ $skip: request.skip })
    if (!isNaN(request.limit)) aggregationStages.push({ $limit: request.limit })

    if (request.skip || request.limit) {
      const skip = request.skip || 0
      const limitMsg = request.skip + request.limit || request.limit || 'end'
      this.cacheLogger.info(`Paginating documents: ${skip} to ${limitMsg}`)
    }

    // Add remaining post-query stages
    aggregationStages.push(
      {
        $group: {
          _id: '$timestamp',
          timestamp: { $first: '$timestamp' },
          serviceEstimates: { $push: '$$ROOT' },
          groupBy: { $first: '$groupBy' },
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
    )

    return aggregationStages
  }
}
