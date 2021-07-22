/*
 * © 2021 Thoughtworks, Inc.
 */
import moment from 'moment'
import { PassThrough } from 'stream'
import EstimatorCache from '../EstimatorCache'
import EstimatorCacheGoogleCloudStorage from '../EstimatorCacheGoogleCloudStorage'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import { EstimationRequest } from '../CreateValidRequest'

const creatReadStreamMock = jest.fn()
const writeGcsFile = jest.fn()

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
              }
            }),
          }
        }),
      }
    }),
  }
})

jest.mock('@cloud-carbon-footprint/common', () => ({
  ...(jest.requireActual('@cloud-carbon-footprint/core') as Record<
    string,
    unknown
  >),
  Logger: jest.fn(),
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
  return [...Array(consecutiveDays)].map((v, i) => {
    return {
      timestamp: moment.utc(startDate).add(i, 'days').toDate(),
      serviceEstimates: [],
    }
  })
}

describe('CacheManager', () => {
  let estimatorCacheGoogleCloudStorage: EstimatorCache

  beforeEach(() => {
    const bucketName = 'test-bucket-name'
    estimatorCacheGoogleCloudStorage = new EstimatorCacheGoogleCloudStorage(
      bucketName,
    )
  })

  const originalWarn = console.warn
  afterEach(() => {
    console.warn = originalWarn
    jest.clearAllMocks()
  })

  describe('getEstimates', () => {
    it('should get estimates from GCS file', async () => {
      //setup
      const startDate = '2020-10-01'
      const endDate = '2020-10-02'

      const mockedStream = new PassThrough()
      mockedStream.push(JSON.stringify(buildFootprintEstimates(startDate, 1)))
      mockedStream.end()

      creatReadStreamMock.mockReturnValue(mockedStream)

      const cachedData: EstimationResult[] = buildFootprintEstimates(
        startDate,
        1,
      )

      //run
      const request: EstimationRequest = {
        startDate: moment.utc(startDate).toDate(),
        endDate: moment.utc(endDate).toDate(),
      }
      const estimates = await estimatorCacheGoogleCloudStorage.getEstimates(
        request,
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
      }
      await estimatorCacheGoogleCloudStorage.getEstimates(request)

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
      const write = await estimatorCacheGoogleCloudStorage.setEstimates(
        cachedData,
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
      await estimatorCacheGoogleCloudStorage.setEstimates(cachedData)

      //assert
      expect(console.warn).toHaveBeenCalled()
    })
  })
})
