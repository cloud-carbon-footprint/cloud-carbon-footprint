/*
 * © 2021 Thoughtworks, Inc.
 */
import moment from 'moment'
import { PassThrough } from 'stream'
import CacheManager from '../CacheManager'
import GoogleCloudCacheManager from '../GoogleCloudCacheManager'
import { EstimationResult, GroupBy } from '@cloud-carbon-footprint/common'
import { EstimationRequest } from '../CreateValidRequest'

const creatReadStreamMock = jest.fn()
const writeGcsFile = jest.fn()
const existsMock = jest.fn()

jest.mock('@google-cloud/storage', () => {
  return {
    Storage: jest.fn().mockImplementation(() => {
      return {
        bucket: jest.fn().mockImplementation(() => {
          return {
            file: jest.fn().mockImplementation(() => {
              return {
                createReadStream: creatReadStreamMock,
                save: writeGcsFile,
                exists: existsMock,
              }
            }),
          }
        }),
      }
    }),
  }
})

jest.mock('@cloud-carbon-footprint/common', () => ({
  ...(jest.requireActual('@cloud-carbon-footprint/common') as Record<
    string,
    unknown
  >),
  Logger: jest.fn().mockImplementation(() => {
    return {
      info: jest.fn(),
    }
  }),
  cache: jest.fn(),
  configLoader: jest.fn().mockImplementation(() => {
    return {
      GCP: {
        CACHE_BUCKET_NAME: 'test-bucket-name',
      },
      CACHE_MODE: 'GCS',
    }
  }),
}))

function buildFootprintEstimates(startDate: string, consecutiveDays: number) {
  const grouping = 'day' as GroupBy
  return [...Array(consecutiveDays)].map((v, i) => {
    const timestamp = moment.utc(startDate).add(i, 'days').toDate()
    return {
      timestamp,
      serviceEstimates: [],
      periodStartDate: undefined,
      periodEndDate: undefined,
      groupBy: grouping,
    }
  })
}

describe('CacheManager', () => {
  let googleCloudCacheManager: CacheManager

  beforeEach(() => {
    console.warn = jest.fn()
    googleCloudCacheManager = new GoogleCloudCacheManager()
  })

  const originalWarn = console.warn
  afterEach(() => {
    console.warn = originalWarn
    jest.clearAllMocks()
  })

  describe('getEstimates', () => {
    function buildFootprintJSONEstimates(startDate: string) {
      return JSON.stringify(buildFootprintEstimates(startDate, 1))
        .replace(/^\[/, '[\n')
        .replace(/]$/, '\n]')
    }

    it('should get estimates from GCS file', async () => {
      //setup
      const startDate = '2020-10-01'
      const endDate = '2020-10-02'

      const mockedStream = new PassThrough()
      const jsonString = buildFootprintJSONEstimates(startDate)

      mockedStream.push(jsonString)
      mockedStream.end()

      creatReadStreamMock.mockReturnValue(mockedStream)
      existsMock.mockReturnValue([true])

      const cachedData: EstimationResult[] = buildFootprintEstimates(
        startDate,
        1,
      )

      //run
      const request: EstimationRequest = {
        startDate: moment.utc(startDate).toDate(),
        endDate: moment.utc(endDate).toDate(),
        ignoreCache: false,
      }
      const estimates = await googleCloudCacheManager.getEstimates(
        request,
        'day',
      )

      //assert
      expect(estimates).toEqual(cachedData)
    })

    it('should console.warn on file writing error', async () => {
      //setup
      const startDate = '2020-10-01'
      const endDate = '2020-10-02'

      const mockedStream = new PassThrough()
      mockedStream.push(JSON.stringify(buildFootprintEstimates(startDate, 1)))
      mockedStream.end()

      creatReadStreamMock.mockRejectedValue('ERROR')

      console.warn = jest.fn()

      //run
      const request: EstimationRequest = {
        startDate: moment.utc(startDate).toDate(),
        endDate: moment.utc(endDate).toDate(),
        ignoreCache: false,
      }
      await googleCloudCacheManager.getEstimates(request, 'day')

      //assert
      expect(console.warn).toHaveBeenCalled()
    })
  })

  describe('setEstimates', () => {
    it('should set estimates to GCS File', async () => {
      //setup
      const startDate = '2020-10-01'
      const cachedData: EstimationResult[] = buildFootprintEstimates(
        startDate,
        1,
      )

      const mockedStream = new PassThrough()
      mockedStream.push(JSON.stringify(buildFootprintEstimates(startDate, 1)))
      mockedStream.end()

      creatReadStreamMock.mockReturnValue(mockedStream)

      writeGcsFile.mockResolvedValue(true)

      //run
      const write = await googleCloudCacheManager.setEstimates(
        cachedData,
        'day',
      )

      //assert
      expect(write).resolves
    })

    it('should console.warn on file writing error', async () => {
      //setup
      const startDate = '2020-10-01'
      const cachedData: EstimationResult[] = buildFootprintEstimates(
        startDate,
        1,
      )

      const mockedStream = new PassThrough()
      mockedStream.push(JSON.stringify(buildFootprintEstimates(startDate, 1)))
      mockedStream.end()

      creatReadStreamMock.mockReturnValue(mockedStream)

      writeGcsFile.mockRejectedValue('ERROR')

      console.warn = jest.fn()

      //run
      await googleCloudCacheManager.setEstimates(cachedData, 'day')

      //assert
      expect(console.warn).toHaveBeenCalled()
    })
  })
})
