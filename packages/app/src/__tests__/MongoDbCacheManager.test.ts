/**
 * © 2021 Thoughtworks, Inc.
 */

import * as mongo from 'mongodb'
import { configLoader } from "@cloud-carbon-footprint/common"
import MongoDbCacheManager from "../MongoDbCacheManager"

// const mockLogger = jest.fn().mockImplementation(() => {
//     return {
//         warn: jest.fn(),
//     }
// })

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
    // Logger: mockLogger,
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
            MONGO_URI: ''
        })

        const mongoDbCacheManager = new MongoDbCacheManager()
        await mongoDbCacheManager.createDbConnection()

        expect(mongo.MongoClient).not.toHaveBeenCalled()
        // expect(mockLogger).toHaveBeenCalled()
    })
    it('gets estimates', async () => {
        const request = {
            startDate: new Date('2022-01-01'),
            endDate: new Date('2022-01-02'),
            ignoreCache: false
        }

        const result = [
            {
                timestamp: new Date('2022-01-01'),
                groupBy: 'day',
                serviceEstimates: [{}]
            }
        ]




        const mongoDbCacheManager = new MongoDbCacheManager()

        const getEstimatesSpy = jest.spyOn(mongoDbCacheManager, 'getEstimates')
        ;(getEstimatesSpy as jest.Mock).mockResolvedValue(result)

        const estimates = await mongoDbCacheManager.getEstimates(request, 'day')

        expect(estimates).toEqual(result)
    })
})