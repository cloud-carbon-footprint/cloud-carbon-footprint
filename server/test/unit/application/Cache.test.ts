import EstimatorCache from '@application/EstimatorCache'
import cache from '@application/Cache'
import { EstimationResult } from '@application/EstimationResult'
import moment from 'moment'
import { RawRequest } from '@view/RawRequest'

let mockSetEstimates: jest.Mock
let mockGetEstimates: jest.Mock

jest.mock('@application/EstimatorCacheInMemory', () => {
  return jest.fn().mockImplementation(() => {
    mockSetEstimates = jest.fn()
    mockGetEstimates = jest.fn()
    const mockEstimatorCache: EstimatorCache = { getEstimates: mockGetEstimates, setEstimates: mockSetEstimates }
    return mockEstimatorCache
  })
})

function buildFootprintEstimates(startDate: string, consecutiveDays: number) {
  return [...Array(consecutiveDays)].map((v, i) => {
    return {
      timestamp: moment.utc(startDate).add(i, 'days').toDate(),
      serviceEstimates: [],
    }
  })
}

describe('Cache', () => {
  let cacheDecorator: (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void
  let originalFunction: jest.Mock
  let propertyDescriptor: PropertyDescriptor

  beforeEach(() => {
    cacheDecorator = cache()
    originalFunction = jest.fn()
    propertyDescriptor = { value: originalFunction }
  })

  describe('cache returned function', () => {
    it('should call original function if cache returns undefined', async () => {
      //setup

      //run
      cacheDecorator({}, 'propertyTest', propertyDescriptor)
      const request = {}
      await propertyDescriptor.value(request)
      //assert
      expect(originalFunction).toHaveBeenCalledWith(request)
    })

    it('should return cached data from cache service instead of calling the real method', async () => {
      //setup
      const rawRequest: RawRequest = {
        startDate: moment.utc('2020-01-01').toISOString(),
        endDate: moment.utc('2020-01-02').toISOString(),
        region: 'us-east-1',
      }

      const expectedEstimationResults: EstimationResult[] = buildFootprintEstimates('2020-01-01', 1)
      mockGetEstimates.mockResolvedValueOnce(expectedEstimationResults)

      const target = {}
      //run
      cacheDecorator(target, 'propertyTest', propertyDescriptor)
      const estimationResult: EstimationResult[] = await propertyDescriptor.value(rawRequest)

      //assert
      expect(estimationResult).toEqual(expectedEstimationResults)
    })

    it('should fetch dates not stored in cache', async () => {
      //setup
      const rawRequest: RawRequest = {
        startDate: moment.utc('2019-12-31').toISOString(),
        endDate: moment.utc('2020-01-08').toISOString(),
        region: 'us-east-1',
      }

      const cachedEstimates: EstimationResult[] = buildFootprintEstimates('2020-01-03', 2)

      mockGetEstimates.mockResolvedValueOnce(cachedEstimates)

      const computedEstimates1 = buildFootprintEstimates('2019-12-31', 3)
      const computedEstimates2 = buildFootprintEstimates('2020-01-05', 3)
      originalFunction.mockResolvedValueOnce(computedEstimates1).mockResolvedValueOnce(computedEstimates2)

      //run
      cacheDecorator({}, 'propertyTest', propertyDescriptor)
      const estimationResult: EstimationResult[] = await propertyDescriptor.value(rawRequest)

      //assert
      const expectedEstimationResults: EstimationResult[] = computedEstimates1.concat(
        cachedEstimates,
        computedEstimates2,
      )

      expect(estimationResult).toEqual(expectedEstimationResults)
    })

    it('should save new data into cache', async () => {
      //setup
      const rawRequest: RawRequest = {
        startDate: moment.utc('2019-12-31').toISOString(),
        endDate: moment.utc('2020-01-01').toISOString(),
        region: 'us-east-1',
      }

      const cachedEstimates: EstimationResult[] = []

      mockGetEstimates.mockResolvedValueOnce(cachedEstimates)

      const computedEstimates = buildFootprintEstimates('2019-12-31', 1)
      originalFunction.mockResolvedValueOnce(computedEstimates)

      //run
      cacheDecorator({}, 'propertyTest', propertyDescriptor)
      const estimationResult: EstimationResult[] = await propertyDescriptor.value(rawRequest)

      //assert
      expect(mockSetEstimates).toHaveBeenCalledWith(computedEstimates)
    })
  })
})
