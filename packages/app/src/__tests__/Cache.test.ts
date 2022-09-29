/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import {
  EstimationResult,
  getPeriodEndDate,
  GroupBy,
  ServiceData,
} from '@cloud-carbon-footprint/common'
import cache from '../Cache'
import { EstimationRequest } from '../CreateValidRequest'
import DurationConstructor = moment.unitOfTime.DurationConstructor
import LocalCacheManager from '../LocalCacheManager'

let mockSetEstimates: jest.Mock
let mockGetEstimates: jest.Mock
let mockGetMissingDates: jest.Mock

jest.mock('../LocalCacheManager', () => {
  return jest.fn().mockImplementation(() => {
    mockSetEstimates = jest.fn()
    mockGetEstimates = jest.fn()
    mockGetMissingDates = jest.fn()
    return {
      getEstimates: mockGetEstimates,
      setEstimates: mockSetEstimates,
      getMissingDates: mockGetMissingDates,
    }
  })
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
}))

const dummyServiceEstimate: ServiceData[] = [
  {
    cloudProvider: '',
    accountId: '',
    accountName: '',
    serviceName: '',
    kilowattHours: 0,
    co2e: 0,
    cost: 0,
    region: '',
    usesAverageCPUConstant: false,
  },
]

function buildFootprintEstimates(
  startDate: string,
  consecutiveTimestamps: number,
  serviceEstimates: ServiceData[] = [],
  timestampUnit: DurationConstructor = 'days',
  groupBy = GroupBy.day,
) {
  return [...Array(consecutiveTimestamps)].map((_value, index) => {
    const timestamp = moment.utc(startDate).add(index, timestampUnit).toDate()
    return {
      timestamp,
      serviceEstimates: [...serviceEstimates],
      periodStartDate: timestamp,
      periodEndDate: getPeriodEndDate(timestamp, GroupBy.day),
      groupBy,
    }
  })
}

describe('Cache', () => {
  let cacheDecorator: (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => void
  let originalFunction: jest.Mock
  let propertyDescriptor: PropertyDescriptor

  beforeEach(() => {
    jest.clearAllMocks()
    cacheDecorator = cache()
    originalFunction = jest.fn()
    propertyDescriptor = { value: originalFunction }
  })

  it('returns cached data from cache service instead of calling the real method', async () => {
    //setup
    const rawRequest: EstimationRequest = {
      startDate: moment.utc('2020-01-01').toDate(),
      endDate: moment.utc('2020-01-02').toDate(),
      ignoreCache: false,
      groupBy: GroupBy.day,
    }

    mockGetMissingDates.mockResolvedValueOnce([])

    const expectedEstimationResults: EstimationResult[] =
      buildFootprintEstimates('2020-01-01', 2, dummyServiceEstimate)
    mockGetEstimates.mockResolvedValueOnce(expectedEstimationResults)

    const target = {}
    //run
    cacheDecorator(target, 'propertyTest', propertyDescriptor)
    const estimationResult: EstimationResult[] = await propertyDescriptor.value(
      rawRequest,
    )

    //assert
    expect(estimationResult).toEqual(expectedEstimationResults)
  })

  it('calls original function with the expected request', async () => {
    //setup
    const rawRequest: EstimationRequest = {
      startDate: moment.utc('2019-12-31').toDate(),
      endDate: moment.utc('2020-01-02').toDate(),
      region: 'us-east-1',
      ignoreCache: false,
      groupBy: GroupBy.day,
    }

    const cachedEstimates: EstimationResult[] = buildFootprintEstimates(
      '2019-12-31',
      1,
    )

    mockGetMissingDates.mockResolvedValueOnce([
      moment.utc('2020-01-01'),
      moment.utc('2020-01-02'),
    ])

    mockGetEstimates.mockResolvedValueOnce(cachedEstimates)

    const computedEstimates = buildFootprintEstimates('2020-01-01', 1)
    originalFunction.mockResolvedValueOnce(computedEstimates)

    //run
    cacheDecorator({}, 'propertyTest', propertyDescriptor)
    await propertyDescriptor.value(rawRequest)

    //assert
    expect(originalFunction).toHaveBeenCalledWith({
      startDate: moment.utc('2020-01-01').toDate(),
      endDate: moment.utc('2020-01-02').endOf(GroupBy.day).toDate(),
      ignoreCache: false,
      groupBy: GroupBy.day,
      region: 'us-east-1',
    })
  })

  it('calls original function with grouping in the request', async () => {
    //setup
    const rawRequest: EstimationRequest = {
      startDate: moment.utc('2019-12-31').toDate(),
      endDate: moment.utc('2020-01-02').toDate(),
      region: 'us-east-1',
      ignoreCache: false,
      groupBy: GroupBy.day,
    }

    const cachedEstimates: EstimationResult[] = buildFootprintEstimates(
      '2019-12-31',
      7,
    )

    mockGetMissingDates.mockResolvedValueOnce([])

    mockGetEstimates.mockResolvedValueOnce(cachedEstimates)

    //run
    cacheDecorator({}, 'propertyTest', propertyDescriptor)
    await propertyDescriptor.value(rawRequest)

    //assert
    expect(mockGetEstimates).toHaveBeenCalledWith(
      rawRequest,
      rawRequest.groupBy,
    )
  })

  it('does not fetch dates when cache service returns unordered estimates', async () => {
    //setup
    const rawRequest: EstimationRequest = {
      startDate: moment.utc('2020-07-31').toDate(),
      endDate: moment.utc('2020-08-01').toDate(),
      region: 'us-east-1',
      ignoreCache: false,
      groupBy: GroupBy.day,
    }

    //unordered dates
    const cachedEstimates: EstimationResult[] = buildFootprintEstimates(
      '2020-08-01',
      1,
      dummyServiceEstimate,
    ).concat(buildFootprintEstimates('2020-07-31', 1, dummyServiceEstimate))

    mockGetMissingDates.mockResolvedValueOnce([])

    mockGetEstimates.mockResolvedValueOnce(cachedEstimates)

    //run
    cacheDecorator({}, 'propertyTest', propertyDescriptor)
    const estimationResult: EstimationResult[] = await propertyDescriptor.value(
      rawRequest,
    )

    //assert
    const expectedEstimationResults: EstimationResult[] =
      buildFootprintEstimates('2020-07-31', 2, dummyServiceEstimate)

    expect(originalFunction).not.toHaveBeenCalled()
    expect(estimationResult).toEqual(expectedEstimationResults)
  })

  it('saves new data into cache', async () => {
    //setup
    const rawRequest: EstimationRequest = {
      startDate: moment.utc('2019-12-31').toDate(),
      endDate: moment.utc('2020-01-01').toDate(),
      region: 'us-east-1',
      ignoreCache: false,
      groupBy: GroupBy.day,
    }

    const cachedEstimates: EstimationResult[] = []

    mockGetMissingDates.mockResolvedValueOnce([
      moment.utc('2019-12-31'),
      moment.utc('2020-01-01'),
    ])

    mockGetEstimates.mockResolvedValueOnce(cachedEstimates)

    const computedEstimates = buildFootprintEstimates('2019-12-31', 2)
    originalFunction.mockResolvedValueOnce(computedEstimates)

    //run
    cacheDecorator({}, 'propertyTest', propertyDescriptor)
    await propertyDescriptor.value(rawRequest)

    //assert
    expect(mockSetEstimates).toHaveBeenCalledWith(computedEstimates, 'day')
  })

  it('should not save into cache when API response contains empty data', async () => {
    //setup
    const rawRequest: EstimationRequest = {
      startDate: moment.utc('2019-12-31').toDate(),
      endDate: moment.utc('2020-01-01').toDate(),
      region: 'us-east-1',
      ignoreCache: false,
      groupBy: GroupBy.day,
    }

    const cachedEstimates: EstimationResult[] = []

    mockGetMissingDates.mockResolvedValueOnce([
      moment.utc('2019-12-31'),
      moment.utc('2020-01-01'),
    ])

    mockGetEstimates.mockResolvedValueOnce(cachedEstimates)

    const computedEstimates = buildFootprintEstimates('2019-12-31', 1)
    originalFunction.mockResolvedValueOnce(computedEstimates)

    LocalCacheManager.prototype.setEstimates = jest.fn()

    const setEstimatesSpy = jest.spyOn(
      LocalCacheManager.prototype,
      'setEstimates',
    )

    //run
    cacheDecorator({}, 'propertyTest', propertyDescriptor)
    await propertyDescriptor.value(rawRequest)

    //assert
    expect(setEstimatesSpy).not.toHaveBeenCalled()
  })

  it('caches dates with empty estimates if original function returns no results', async () => {
    //setup
    const rawRequest: EstimationRequest = {
      startDate: moment.utc('2020-07-10').toDate(),
      endDate: moment.utc('2020-07-20').toDate(),
      ignoreCache: false,
      groupBy: GroupBy.day,
    }

    const cachedEstimates: EstimationResult[] = []
    mockGetEstimates.mockResolvedValueOnce(cachedEstimates)

    mockGetMissingDates.mockResolvedValueOnce([
      moment.utc('2020-07-15'),
      moment.utc('2020-07-16'),
      moment.utc('2020-07-17'),
      moment.utc('2020-07-18'),
      moment.utc('2020-07-19'),
      moment.utc('2020-07-20'),
    ])

    const computedEstimates: EstimationResult[] = buildFootprintEstimates(
      '2020-07-10',
      5,
      [
        {
          cloudProvider: '',
          accountId: '',
          accountName: '',
          serviceName: '',
          kilowattHours: 0,
          co2e: 0,
          cost: 0,
          region: '',
          usesAverageCPUConstant: false,
        },
      ],
    )
    originalFunction.mockResolvedValueOnce(computedEstimates)

    //run
    cacheDecorator({}, 'propertyTest', propertyDescriptor)
    await propertyDescriptor.value(rawRequest)

    //assert
    expect(mockSetEstimates).toHaveBeenCalledWith(
      computedEstimates.concat(buildFootprintEstimates('2020-07-15', 6)),
      'day',
    )
  })

  it('removes empty estimates', async () => {
    //setup
    const rawRequest: EstimationRequest = {
      startDate: moment.utc('2020-07-15').toDate(),
      endDate: moment.utc('2020-07-20').toDate(),
      ignoreCache: false,
      groupBy: GroupBy.day,
    }

    const cachedEstimates: EstimationResult[] = buildFootprintEstimates(
      '2020-07-15',
      6,
    )

    mockGetMissingDates.mockResolvedValueOnce([])

    mockGetEstimates.mockResolvedValueOnce(cachedEstimates)

    //run
    cacheDecorator({}, 'propertyTest', propertyDescriptor)
    const results = await propertyDescriptor.value(rawRequest)

    //assert
    expect(results).toEqual([])
  })

  it('should not read or write to cache when ignore cache is true', async () => {
    //setup
    const rawRequest: EstimationRequest = {
      startDate: moment.utc('2020-07-12').toDate(),
      endDate: moment.utc('2020-07-20').toDate(),
      ignoreCache: true,
      groupBy: GroupBy.month,
    }

    const cachedEstimates: EstimationResult[] = buildFootprintEstimates(
      '2020-07-15',
      6,
    )

    mockGetMissingDates.mockResolvedValueOnce([moment.utc('2020-07-01')])

    mockGetEstimates.mockResolvedValueOnce(cachedEstimates)

    originalFunction.mockResolvedValueOnce([])

    //run
    cacheDecorator({}, 'propertyTest', propertyDescriptor)
    await propertyDescriptor.value(rawRequest)

    //assert
    const expectedRequest = {
      startDate: moment.utc('2020-07-01').toDate(),
      endDate: moment.utc('2020-07-01').endOf('month').toDate(),
      ignoreCache: false,
      groupBy: GroupBy.month,
    }
    expect(originalFunction).toHaveBeenCalledWith(expectedRequest)
    expect(mockGetEstimates).not.toHaveBeenCalled()
    expect(mockSetEstimates).not.toHaveBeenCalled()
  })

  describe.skip('populates missing dates', () => {
    type TestCase = [string, EstimationRequest, MockRequestDateRanges]
    type MockEstimates = { [grouping: string]: EstimationResult[] }
    type MockRequests = { [grouping: string]: EstimationRequest }
    type MockRequestDateRanges = { [period: string]: Date }[]

    beforeEach(() => {
      jest.clearAllMocks()
      cacheDecorator = cache()
      originalFunction = jest.fn().mockReturnValue([])
      propertyDescriptor = { value: originalFunction }
    })

    // Mocked Estimates
    const cachedEstimates: MockEstimates = {
      day: buildFootprintEstimates('2020-01-02', 1, dummyServiceEstimate),
      week: buildFootprintEstimates(
        '2020-12-07',
        2,
        dummyServiceEstimate,
        'weeks',
        GroupBy.week,
      ),
      month: buildFootprintEstimates(
        '2020-12-01',
        2,
        dummyServiceEstimate,
        'month',
        GroupBy.month,
      ),
      quarter: buildFootprintEstimates(
        '2020-01-01',
        2,
        dummyServiceEstimate,
        'quarter',
        GroupBy.quarter,
      ),
      year: buildFootprintEstimates(
        '2020-01-01',
        1,
        dummyServiceEstimate,
        'year',
        GroupBy.year,
      ),
    }

    // Mocked requests
    const rawRequests: MockRequests = {
      day: {
        startDate: moment.utc('2019-12-31').toDate(),
        endDate: moment.utc('2020-01-05').toDate(),
        ignoreCache: false,
        groupBy: GroupBy.day,
      },
      week: {
        startDate: moment.utc('2020-12-06').toDate(),
        endDate: moment.utc('2020-12-28').toDate(),
        ignoreCache: false,
        groupBy: GroupBy.week,
      },
      month: {
        startDate: moment.utc('2020-11-01').toDate(),
        endDate: moment.utc('2021-01-01').toDate(),
        ignoreCache: false,
        groupBy: GroupBy.month,
      },
      quarter: {
        startDate: moment.utc('2020-01-01').toDate(),
        endDate: moment.utc('2020-09-01').toDate(),
        ignoreCache: false,
        groupBy: GroupBy.quarter,
      },
      year: {
        startDate: moment.utc('2020-01-01').toDate(),
        endDate: moment.utc('2021-01-01').toDate(),
        ignoreCache: false,
        groupBy: GroupBy.year,
      },
    }

    const expectedRequestRangesByDay: MockRequestDateRanges = [
      {
        start: moment.utc('2019-12-31').toDate(),
        end: moment.utc('2020-01-01').endOf('day').toDate(),
      },
      {
        start: moment.utc('2020-01-03').toDate(),
        end: moment.utc('2020-01-05').endOf('day').toDate(),
      },
    ]

    // Moment's weeks start on Mondays
    const expectedRequestRangesByWeek: MockRequestDateRanges = [
      {
        // Earlier than start date since week starts on Monday
        start: moment.utc('2020-11-30').toDate(),
        end: moment.utc('2020-11-30').endOf('week').toDate(),
      },
      {
        start: moment.utc('2020-12-21').toDate(),
        end: moment.utc('2020-12-28').endOf('week').toDate(),
      },
    ]

    const expectedRequestRangesByMonth: MockRequestDateRanges = [
      {
        start: moment.utc('2020-11-01').toDate(),
        end: moment.utc('2020-11-01').endOf('month').toDate(),
      },
    ]

    const expectedRequestRangesByQuarter: MockRequestDateRanges = [
      {
        start: moment.utc('2020-07-01').toDate(),
        end: moment.utc('2020-07-01').endOf('quarter').toDate(),
      },
    ]

    const expectedRequestRangesByYear: MockRequestDateRanges = [
      {
        start: moment.utc('2021-01-01').toDate(),
        end: moment.utc('2021-01-01').endOf('year').toDate(),
      },
    ]

    // Test Cases for each grouping method
    const missingDateTestCases: TestCase[] = [
      ['day', rawRequests.day, expectedRequestRangesByDay],
      ['week', rawRequests.week, expectedRequestRangesByWeek],
      ['month', rawRequests.month, expectedRequestRangesByMonth],
      ['quarter', rawRequests.quarter, expectedRequestRangesByQuarter],
      ['year', rawRequests.year, expectedRequestRangesByYear],
    ]

    it.each(missingDateTestCases)(
      'fetches dates not stored in cache when grouping by %s',
      async (
        grouping,
        rawRequest: EstimationRequest,
        expectedRequestDateRanges: MockRequestDateRanges,
      ) => {
        //setup
        mockGetEstimates.mockResolvedValueOnce(cachedEstimates[grouping])

        //run
        cacheDecorator({}, 'propertyTest', propertyDescriptor)
        await propertyDescriptor.value(rawRequest)

        //assert
        const expectedRequestArguments = expectedRequestDateRanges.map(
          (range) => [
            {
              startDate: range.start,
              endDate: range.end,
              ignoreCache: false,
              groupBy: grouping,
              region: rawRequest.region,
            },
          ],
        )
        // Expect each missing date to be called on getEstimates (decorated function) as a separate request
        expect(originalFunction.mock.calls).toEqual(expectedRequestArguments)
      },
    )

    it('does not make additional requests if there are no missing dates', async () => {
      //setup
      mockGetMissingDates.mockResolvedValueOnce([])
      mockGetEstimates.mockResolvedValueOnce(cachedEstimates.year)

      //run
      cacheDecorator({}, 'propertyTest', propertyDescriptor)
      await propertyDescriptor.value({
        startDate: moment.utc('2020-01-01').toDate(),
        endDate: moment.utc('2020-12-31').toDate(),
        ignoreCache: false,
        groupBy: GroupBy.year,
      })

      //assert
      expect(originalFunction).not.toHaveBeenCalled()
    })

    it('makes request for all dates in the range if there are no dates in the cache', async () => {
      //setup
      mockGetMissingDates.mockResolvedValueOnce([
        moment.utc('2020-12-21'),
        moment.utc('2020-12-28'),
      ])
      mockGetEstimates.mockResolvedValueOnce([])

      //run
      cacheDecorator({}, 'propertyTest', propertyDescriptor)
      await propertyDescriptor.value({
        startDate: moment.utc('2020-12-21').toDate(),
        endDate: moment.utc('2021-01-02').toDate(),
        ignoreCache: false,
        groupBy: GroupBy.week,
      })

      const range = expectedRequestRangesByWeek[1]

      //assert
      expect(originalFunction.mock.calls).toEqual([
        [
          {
            startDate: range.start,
            endDate: range.end,
            ignoreCache: false,
            groupBy: GroupBy.week,
            region: undefined,
          },
        ],
      ])
    })
  })
})
