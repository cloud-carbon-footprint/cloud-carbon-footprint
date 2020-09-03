import EstimatorCache from '@application/EstimatorCache'
import cache from '@application/Cache'
import { EstimationResult, ServiceData } from '@application/EstimationResult'
import moment from 'moment'
import { RawRequest } from '@view/RawRequest'

let mockSetEstimates: jest.Mock
let mockGetEstimates: jest.Mock

jest.mock('@application/EstimatorCacheFileSystem', () => {
  return jest.fn().mockImplementation(() => {
    mockSetEstimates = jest.fn()
    mockGetEstimates = jest.fn()
    const mockEstimatorCache: EstimatorCache = { getEstimates: mockGetEstimates, setEstimates: mockSetEstimates }
    return mockEstimatorCache
  })
})

const dummyServiceEstimate: ServiceData[] = [
  {
    timestamp: new Date(),
    serviceName: '',
    wattHours: 0,
    co2e: 0,
    cost: 0,
    region: '',
  },
]

function buildFootprintEstimates(startDate: string, consecutiveDays: number, serviceEstimates: ServiceData[] = []) {
  return [...Array(consecutiveDays)].map((v, i) => {
    return {
      timestamp: moment.utc(startDate).add(i, 'days').toDate(),
      serviceEstimates: [...serviceEstimates],
    }
  })
}

describe('Cache', () => {
  let cacheDecorator: (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void
  let originalFunction: jest.Mock
  let propertyDescriptor: PropertyDescriptor

  beforeEach(() => {
    jest.clearAllMocks()
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

      const expectedEstimationResults: EstimationResult[] = buildFootprintEstimates(
        '2020-01-01',
        1,
        dummyServiceEstimate,
      )
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

      const cachedEstimates: EstimationResult[] = buildFootprintEstimates('2020-01-03', 2, dummyServiceEstimate)

      mockGetEstimates.mockResolvedValueOnce(cachedEstimates)

      const computedEstimates1 = buildFootprintEstimates('2019-12-31', 3, dummyServiceEstimate)
      const computedEstimates2 = buildFootprintEstimates('2020-01-05', 3, dummyServiceEstimate)
      originalFunction.mockResolvedValueOnce(computedEstimates1).mockResolvedValueOnce(computedEstimates2)

      //run
      cacheDecorator({}, 'propertyTest', propertyDescriptor)
      const estimationResult: EstimationResult[] = await propertyDescriptor.value(rawRequest)

      //assert
      const expectedEstimationResults: EstimationResult[] = [
        ...computedEstimates1,
        ...cachedEstimates,
        ...computedEstimates2,
      ]

      expect(estimationResult).toEqual(expectedEstimationResults)
    })

    it('should call original function with the expected request', async () => {
      //setup
      const rawRequest: RawRequest = {
        startDate: moment.utc('2019-12-31').toISOString(),
        endDate: moment.utc('2020-01-02').toISOString(),
        region: 'us-east-1',
      }

      const cachedEstimates: EstimationResult[] = buildFootprintEstimates('2019-12-31', 1)

      mockGetEstimates.mockResolvedValueOnce(cachedEstimates)

      const computedEstimates = buildFootprintEstimates('2020-01-01', 1)
      originalFunction.mockResolvedValueOnce(computedEstimates)

      //run
      cacheDecorator({}, 'propertyTest', propertyDescriptor)
      await propertyDescriptor.value(rawRequest)

      //assert
      expect(originalFunction).toHaveBeenCalledWith({
        startDate: moment.utc('2020-01-01').toISOString(),
        endDate: moment.utc('2020-01-02').toISOString(),
        region: 'us-east-1',
      })
    })

    it('should not fetch dates when cache service return unordered estimates', async () => {
      //setup
      const rawRequest: RawRequest = {
        startDate: moment.utc('2020-07-31').toISOString(),
        endDate: moment.utc('2020-08-01').toISOString(),
        region: 'us-east-1',
      }

      //unordered dates
      const cachedEstimates: EstimationResult[] = buildFootprintEstimates('2020-08-01', 1, dummyServiceEstimate).concat(
        buildFootprintEstimates('2020-07-31', 1, dummyServiceEstimate),
      )

      mockGetEstimates.mockResolvedValueOnce(cachedEstimates)

      //run
      cacheDecorator({}, 'propertyTest', propertyDescriptor)
      const estimationResult: EstimationResult[] = await propertyDescriptor.value(rawRequest)

      //assert
      const expectedEstimationResults: EstimationResult[] = buildFootprintEstimates(
        '2020-07-31',
        2,
        dummyServiceEstimate,
      )

      expect(originalFunction).not.toHaveBeenCalled()
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
      await propertyDescriptor.value(rawRequest)

      //assert
      expect(mockSetEstimates).toHaveBeenCalledWith(computedEstimates)
    })

    it('should cache dates with empty estimates if original function returns no results', async () => {
      //setup
      const rawRequest: RawRequest = {
        startDate: moment.utc('2020-07-10').toISOString(),
        endDate: moment.utc('2020-07-20').toISOString(),
        region: 'us-east-1',
      }

      const cachedEstimates: EstimationResult[] = []
      mockGetEstimates.mockResolvedValueOnce(cachedEstimates)

      const computedEstimates: EstimationResult[] = buildFootprintEstimates('2020-07-10', 5, [
        {
          timestamp: new Date(),
          serviceName: '',
          wattHours: 0,
          co2e: 0,
          cost: 0,
          region: '',
        },
      ])
      originalFunction.mockResolvedValueOnce(computedEstimates)

      //run
      cacheDecorator({}, 'propertyTest', propertyDescriptor)
      await propertyDescriptor.value(rawRequest)

      //assert
      expect(mockSetEstimates).toHaveBeenCalledWith(computedEstimates.concat(buildFootprintEstimates('2020-07-15', 5)))
    })

    it('should remove empty estimates', async () => {
      //setup
      const rawRequest: RawRequest = {
        startDate: moment.utc('2020-07-10').toISOString(),
        endDate: moment.utc('2020-07-20').toISOString(),
        region: 'us-east-1',
      }

      const cachedEstimates: EstimationResult[] = buildFootprintEstimates('2020-07-15', 5)
      mockGetEstimates.mockResolvedValueOnce(cachedEstimates)

      const computedEstimates: EstimationResult[] = buildFootprintEstimates('2020-07-10', 5, [
        {
          timestamp: new Date(),
          serviceName: '',
          wattHours: 0,
          co2e: 0,
          cost: 0,
          region: '',
        },
      ])
      originalFunction.mockResolvedValueOnce(computedEstimates)

      //run
      cacheDecorator({}, 'propertyTest', propertyDescriptor)
      const results = await propertyDescriptor.value(rawRequest)

      //assert
      expect(results).toEqual(computedEstimates)
    })
  })
})
