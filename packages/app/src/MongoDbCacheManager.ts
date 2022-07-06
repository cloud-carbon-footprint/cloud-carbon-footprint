/*
 * © 2021 Thoughtworks, Inc.
 */

import { MongoClient } from 'mongodb'
import { configLoader, EstimationResult } from '@cloud-carbon-footprint/common'
import CacheManager from './CacheManager'
import { EstimationRequest } from './CreateValidRequest'

export default class MongoDbCacheManager extends CacheManager {
  mongoClient: MongoClient
  mongoDbName: string
  constructor() {
    super()
    this.mongoDbName = 'ccf'
  }

  async createDbConnection() {
    const mongoURI = configLoader().MONGO_URI
    if (mongoURI) {
      this.mongoClient = new MongoClient(mongoURI)
      this.cacheLogger.info('Successfully connected to the mongoDB client')
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
    const startDate = new Date(request.startDate)
    const endDate = new Date(request.endDate)
    return new Promise(function (resolve, reject) {
      db.listCollections({ name: collectionName }).next(
        async (err: Error, collectionInfo: any) => {
          if (err) reject(err)
          if (collectionInfo) {
            const estimates = db.collection(collectionName)
            console.info(
              `Successfully connected to database collection: ${collectionName}`,
            )

            resolve(
              estimates
                .aggregate(
                  [
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
                    {
                      $match: { timestamp: { $gte: startDate, $lte: endDate } },
                    },
                  ],
                  { allowDiskUse: true },
                )
                .toArray() as EstimationResult[],
            )
          } else {
            // The collection does not exist - so we can create it
            console.info(`Creating new database collection: ${collectionName}`)
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
    this.cacheLogger.info('Using mongo database...')
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

      return estimates ? estimates : []
    } catch (e) {
      this.cacheLogger.warn(
        `There was an error getting estimates from MongoDB: ${e.message}`,
      )
      return []
    } finally {
      // Ensures that the client will close when you finish/error
      await this.mongoClient.close()
    }
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
            periodStartDate: estimate['periodStartDate'],
            periodEndDate: estimate['periodEndDate'],
            groupBy: estimate['groupBy'],
          }
          newEstimates.push(newDocument)
        })
      })

      await collection.insertMany(newEstimates)
    } finally {
      // Ensures that the client will close when you finish/error
      await this.mongoClient.close()
    }
  }
}
