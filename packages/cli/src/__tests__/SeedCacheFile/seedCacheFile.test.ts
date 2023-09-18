/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  configLoader,
  EstimationRequestValidationError,
  EstimationResult,
} from '@cloud-carbon-footprint/common'
import { MongoDbCacheManager } from '@cloud-carbon-footprint/app'
import moment from 'moment'
import seedCacheFile from '../../SeedCacheFile/seedCacheFile'
import * as common from '../../common'

const mockGetCostAndEstimates = jest.fn()
jest.mock('../../common')
const mockInputPrompts: jest.Mock = common.inputPrompt as jest.Mock
const mockListPrompts: jest.Mock = common.listPrompt as jest.Mock

const defaultConsoleInfo = console.info

jest.mock('@cloud-carbon-footprint/app', () => ({
  ...(jest.requireActual('@cloud-carbon-footprint/app') as Record<
    string,
    unknown
  >),
  App: jest.fn().mockImplementation(() => {
    return {
      getCostAndEstimates: mockGetCostAndEstimates,
    }
  }),
  cache: jest.fn(),
}))

jest.mock('@cloud-carbon-footprint/common', () => ({
  ...(jest.requireActual('@cloud-carbon-footprint/common') as Record<
    string,
    unknown
  >),
  configLoader: jest.fn().mockImplementation(() => ({
    CACHE_MODE: '',
  })),
}))

describe('seedCacheFile', () => {
  beforeEach(() => {
    console.info = jest.fn()
  })
  afterEach(() => {
    console.info = defaultConsoleInfo
  })
  describe('given: successful request', () => {
    beforeEach(() => {
      mockInputPrompts
        .mockResolvedValueOnce('2020-07-01')
        .mockResolvedValueOnce('2020-07-07')
        .mockResolvedValueOnce('')

      mockListPrompts
        .mockResolvedValueOnce('day')
        .mockResolvedValueOnce('single')
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('logs success when cache file is seeded using the app', async () => {
      const expectedResponse: EstimationResult[] = []
      mockGetCostAndEstimates.mockResolvedValueOnce(expectedResponse)
      await seedCacheFile()

      expect(mockGetCostAndEstimates).toHaveBeenCalledWith({
        startDate: new Date('2020-07-01T00:00:00.000Z'),
        endDate: new Date('2020-07-07T00:00:00.000Z'),
        groupBy: 'day',
        limit: 1,
        skip: 0,
        cloudProviderToSeed: '',
        ignoreCache: false,
      })

      expect(console.info).toHaveBeenNthCalledWith(
        1,
        'Seeding cache file using a single request...',
      )
      expect(console.info).toHaveBeenNthCalledWith(
        2,
        'Fetching estimates from 2020-07-01 to 2020-07-07...',
      )
      expect(console.info).toHaveBeenNthCalledWith(
        3,
        'Done! Estimates have been successfully seeded to the cache file!',
      )
    })
  })

  describe('start and end date parameter validation', () => {
    describe('given: invalid dates', () => {
      beforeEach(() => {
        mockInputPrompts
          .mockResolvedValueOnce('2020-07-08')
          .mockResolvedValueOnce('2020-07-07')
          .mockResolvedValueOnce('AWS')

        mockListPrompts
          .mockResolvedValueOnce('day')
          .mockResolvedValueOnce('single')
      })

      afterEach(() => {
        jest.restoreAllMocks()
      })

      it('throws an estimation validation error', async () => {
        const expectedResponse: EstimationResult[] = []
        mockGetCostAndEstimates.mockResolvedValueOnce(expectedResponse)

        await expect(() => seedCacheFile()).rejects.toThrow(
          'Start date is after end date',
          EstimationRequestValidationError,
        )
      })
    })
  })

  describe('optional parameter validation', () => {
    describe('given: invalid cloud provider', () => {
      beforeEach(() => {
        mockInputPrompts
          .mockResolvedValueOnce('2020-07-01')
          .mockResolvedValueOnce('2020-07-08')
          .mockResolvedValueOnce('asw')

        mockListPrompts
          .mockResolvedValueOnce('day')
          .mockResolvedValueOnce('single')
      })

      afterEach(() => {
        jest.restoreAllMocks()
      })

      it('throws an estimation validation error', async () => {
        const expectedResponse: EstimationResult[] = []
        mockGetCostAndEstimates.mockResolvedValueOnce(expectedResponse)

        await expect(() => seedCacheFile()).rejects.toThrow(
          'Not a valid cloud provider to seed',
          EstimationRequestValidationError,
        )
      })
    })
  })

  describe('request splitting', () => {
    describe('given: split request option', () => {
      beforeEach(() => {
        mockInputPrompts
          .mockResolvedValueOnce('2020-07-01')
          .mockResolvedValueOnce('2020-07-03')

        mockListPrompts
          .mockResolvedValueOnce('day')
          .mockResolvedValueOnce('split')
      })

      afterEach(() => {
        jest.restoreAllMocks()
      })

      it('makes separate requests for each day by default', async () => {
        mockInputPrompts.mockResolvedValueOnce('') // No option given for daysPerRequest
        mockInputPrompts.mockResolvedValueOnce('') // No option given for cloud provider to seed

        const expectedResponse: EstimationResult[] = []
        mockGetCostAndEstimates.mockRestore()
        mockGetCostAndEstimates.mockResolvedValue(expectedResponse)

        await seedCacheFile()

        expect(mockGetCostAndEstimates).toHaveBeenCalledTimes(3)

        expect(console.info).toHaveBeenNthCalledWith(
          1,
          'Seeding cache file using split requests...',
        )
        expect(console.info).toHaveBeenNthCalledWith(
          2,
          'Fetching estimates for 2020-07-01...',
        )
        expect(console.info).toHaveBeenNthCalledWith(
          3,
          'Fetching estimates for 2020-07-02...',
        )
        expect(console.info).toHaveBeenNthCalledWith(
          4,
          'Fetching estimates for 2020-07-03...',
        )

        expect(console.info).lastCalledWith(
          'Done! Estimates have been successfully seeded to the cache file!',
        )
      })

      // it('makes separate requests for a specified per day frequency', async () => {
      //   mockInputPrompts.mockResolvedValueOnce(2) // option given for daysPerRequest
      //   mockInputPrompts.mockResolvedValueOnce('') // No option given for cloud provider to seed
      //
      //   const expectedResponse: EstimationResult[] = []
      //   mockGetCostAndEstimates.mockRestore()
      //   mockGetCostAndEstimates.mockResolvedValue(expectedResponse)
      //
      //   await seedCacheFile()
      //
      //   expect(mockGetCostAndEstimates).toHaveBeenCalledTimes(2)
      //
      //   expect(console.info).toHaveBeenNthCalledWith(
      //     1,
      //     'Seeding cache file using split requests...',
      //   )
      //   expect(console.info).toHaveBeenNthCalledWith(
      //     2,
      //     'Fetching estimates from 2020-07-01 to 2020-07-02...',
      //   )
      //   expect(console.info).toHaveBeenNthCalledWith(
      //     3,
      //     'Fetching estimates for 2020-07-03...',
      //   )
      //
      //   expect(console.info).lastCalledWith(
      //     'Done! Estimates have been successfully seeded to the cache file!',
      //   )
      // })

      it.each([
        ['day', '2020-07-02'],
        ['week', '2020-07-08'],
        ['month', '2020-08-01'],
        ['quarter', '2020-10-01'],
        ['year', '2021-07-01'],
      ])(
        'makes separate requests for a specified per %s frequency',
        async (groupBy: string, nextDate: string) => {
          // Required for setup between each parameterized test
          mockInputPrompts.mockRestore()
          mockListPrompts.mockRestore()
          mockInputPrompts.mockResolvedValueOnce('2020-07-01')

          // create a variable that adds 1 unit of the groupBy parameter to the nextDate
          const endDate = moment
            .utc('2020-07-01')
            .add(2, groupBy as moment.unitOfTime.DurationConstructor)
            .format('YYYY-MM-DD')
          mockInputPrompts.mockResolvedValueOnce(endDate) // option given for end date

          mockListPrompts
            .mockResolvedValueOnce(groupBy)
            .mockResolvedValueOnce('split')

          mockInputPrompts.mockResolvedValueOnce(2) // option given for request frequency
          mockInputPrompts.mockResolvedValueOnce('') // No option given for cloud provider to seed

          mockListPrompts.mockResolvedValueOnce(groupBy)

          const expectedResponse: EstimationResult[] = []
          mockGetCostAndEstimates.mockRestore()
          mockGetCostAndEstimates.mockResolvedValue(expectedResponse)

          await seedCacheFile()

          expect(mockGetCostAndEstimates).toHaveBeenCalledTimes(2)

          expect(console.info).toHaveBeenNthCalledWith(
            1,
            'Seeding cache file using split requests...',
          )
          expect(console.info).toHaveBeenNthCalledWith(
            2,
            `Fetching estimates from 2020-07-01 to ${nextDate}...`,
          )

          expect(console.info).lastCalledWith(
            'Done! Estimates have been successfully seeded to the cache file!',
          )
        },
      )
    })
  })

  describe('database connection', () => {
    it('should initialize MongoDB client when it is configured as the cache mode', async () => {
      ;(configLoader as jest.Mock).mockReturnValue({
        ...configLoader(),
        CACHE_MODE: 'MONGODB',
      })

      const mockCreateDbConnection = jest.fn()
      const mockMongoClient: any = { close: jest.fn() }

      MongoDbCacheManager.createDbConnection = mockCreateDbConnection
      MongoDbCacheManager.mongoClient = mockMongoClient

      mockInputPrompts
        .mockResolvedValueOnce('2020-07-01')
        .mockResolvedValueOnce('2020-07-07')
        .mockResolvedValueOnce('')

      mockListPrompts
        .mockResolvedValueOnce('day')
        .mockResolvedValueOnce('single')

      const mockResponse: EstimationResult[] = []
      mockGetCostAndEstimates.mockResolvedValueOnce(mockResponse)

      await seedCacheFile()

      expect(mockCreateDbConnection).toHaveBeenCalledTimes(1)
      expect(mockMongoClient.close).toHaveBeenCalledTimes(1)
    })
  })
})
