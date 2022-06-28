/**
 * © 2021 Thoughtworks, Inc.
 */

import * as mongo from 'mongodb'
import { configLoader } from "@cloud-carbon-footprint/common"
import MongoDbCacheManager from "../MongoDbCacheManager"

jest.mock('mongodb', () => {
    // const requireActual = jest.requireActual('mongodb')
    return {
        // ...requireActual,
        MongoClient: jest.fn().mockImplementation(() => { return {} })
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
    Logger: jest.fn().mockImplementation(() => {
        return {
            warn: jest.fn(),
        }
    }),
}))

describe('MongoDbCacheManager', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })
    it ('connects to the mongodb server', async () => {
        const mongoDbCacheManager = new MongoDbCacheManager()
        await mongoDbCacheManager.createDbConnection()


        expect(mongo.MongoClient).toHaveBeenCalledWith('test-mongo-uri')
    })

    it ( 'throws an error when there is no uri set', async() => {
        ;(configLoader as jest.Mock).mockReturnValue({
            ...configLoader(),
            MONGO_URI: null
        })

        ;(mongo.MongoClient as unknown as jest.Mock).mockReturnValue({
            ...mongo.MongoClient,
            MongoClient: jest.fn().mockImplementation(() => {
                Promise.reject(new Error())
            })
        })

        const mongoDbCacheManager = new MongoDbCacheManager()
        // await mongoDbCacheManager.createDbConnection()

        // const targetFunctionSpy = jest.spyOn(mongo, 'MongoClient')
        // ;(targetFunctionSpy as jest.Mock).mockReturnValue(new Error())
        // expect(mongo.MongoClient).toHaveBeenCalledWith(null)
        expect(await mongoDbCacheManager.createDbConnection()).toThrowError('error')
    })
})