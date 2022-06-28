/*
 * © 2021 Thoughtworks, Inc.
 */

import { MongoClient } from 'mongodb'
import { configLoader, EstimationResult } from "@cloud-carbon-footprint/common"
import CacheManager from "./CacheManager"
import { EstimationRequest } from "./CreateValidRequest"

export default class MongoDbCacheManager extends CacheManager {
    mongoClient: MongoClient
    mongoDbName: string
    constructor() {
        super()
        this.mongoDbName = 'ccf'
    }

    async createDbConnection() {
        try {
            this.mongoClient = new MongoClient(configLoader().MONGO_URI)
            console.log('try', this.mongoClient)
        } catch(e) {
            this.cacheLogger.warn(`There was an error connecting to the MongoDB client: ${e.message}`)
            console.log('catch', e.message)
        }
    }

    async getEstimates(
        request: EstimationRequest,
        grouping: string,
    ): Promise<EstimationResult[]> {
        this.cacheLogger.info('Using mongo database...')
        let result: EstimationResult[] = []
        try {
            // Connect the client to the server
            await this.mongoClient.connect()

            // Specify a database to query
            const database = this.mongoClient.db(this.mongoDbName)
            const estimates = database.collection(`estimates-by-${grouping}`)

            console.log("Connected successfully to server")
            const cursor = estimates.find()
            result = await cursor.toArray().then(data => data) as EstimationResult[]
        } catch(e) {
            this.cacheLogger.warn(`There was an error getting estimates from MongoDB: ${e.message}`)
        } finally {
            // Ensures that the client will close when you finish/error
            await this.mongoClient.close()
        }
        return result
    }

    async setEstimates(
        estimates: EstimationResult[],
        grouping: string,
    ): Promise<void> {}


}