/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import { EstimationResult, GroupBy } from '@cloud-carbon-footprint/common'
import {
  checkFootprintDates,
  checkIfAllDatesExistForForecast,
  getEmissionDateRange,
  sliceFootprintDataByLastMonth,
} from './handleDates'

const compileDates = (groupBy: GroupBy, arrLength: number) => {
  return [...new Array(arrLength)].map((i, n) =>
    moment.utc().startOf(groupBy).subtract(n, `${groupBy}s`).toDate(),
  )
}

describe('checks footprint dates', () => {
  moment.now = function () {
    return +new Date('2023-01-31T00:00:00.000Z')
  }

  describe('no data', () => {
    it('does not have last 30 day total', () => {
      const data: EstimationResult[] = []

      const groupBy = 'day' as GroupBy.day
      const { missingDates } = checkFootprintDates(data, groupBy)

      expect(missingDates.length > 0).toBe(true)
    })
  })

  describe('groupBy day', () => {
    const groupBy = 'day' as GroupBy.day
    it('does not have last 30 day total', () => {
      const dates = compileDates(groupBy, 2)

      const data = dates.map((date) => {
        return {
          timestamp: date,
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: groupBy,
        }
      })

      const { missingDates } = checkFootprintDates(data, groupBy)

      expect(missingDates.length > 0).toBe(true)
    })

    it('has last 30 day total', () => {
      const dates = compileDates(groupBy, 30)

      const data = dates.map((date) => {
        return {
          timestamp: date,
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: groupBy,
        }
      })

      const { missingDates } = checkFootprintDates(data, groupBy)

      expect(missingDates.length > 0).toBe(false)
    })

    it('slices footprint data', () => {
      const data = [...new Array(35)].map((i, n) => {
        return {
          timestamp: moment
            .utc()
            .startOf(groupBy)
            .subtract(34, `${groupBy}s`)
            .add(n, `${groupBy}s`)
            .toDate(),
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: groupBy,
        }
      })

      const slicedFootprintData = sliceFootprintDataByLastMonth(data, groupBy)

      expect(slicedFootprintData).toEqual(data.slice(data.length - 30))
    })
  })

  describe('groupBy week', () => {
    const groupBy = 'week' as GroupBy.week
    it('does not have last 30 day total', () => {
      const dates = compileDates(groupBy, 2)

      const data = dates.map((date) => {
        return {
          timestamp: date,
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: GroupBy.week,
        }
      })

      const { missingDates } = checkFootprintDates(data, groupBy)

      expect(missingDates.length > 0).toBe(true)
    })

    it('has last 30 day total', () => {
      const dates = compileDates(groupBy, 4)

      const data = dates.map((date) => {
        return {
          timestamp: date,
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: groupBy,
        }
      })

      const { missingDates } = checkFootprintDates(data, groupBy)

      expect(missingDates.length > 0).toBe(false)
    })

    it('slices footprint data', () => {
      const data = [...new Array(6)].map((i, n) => {
        return {
          timestamp: moment
            .utc()
            .startOf(groupBy)
            .subtract(5, `${groupBy}s`)
            .add(n, `${groupBy}s`)
            .toDate(),
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: groupBy,
        }
      })

      const slicedFootprintData = sliceFootprintDataByLastMonth(data, groupBy)

      expect(slicedFootprintData).toEqual(data.slice(data.length - 4))
    })
  })

  describe('groupBy month', () => {
    const groupBy = 'month' as GroupBy.month
    it('does not have last 30 day total', () => {
      const data: EstimationResult[] = [
        {
          timestamp: moment.utc('2020-01-01').startOf(groupBy).toDate(),
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: groupBy,
        },
      ]

      const { missingDates } = checkFootprintDates(data, groupBy)

      expect(missingDates.length > 0).toBe(true)
    })

    it('has last 30 day total', () => {
      const dates = compileDates(groupBy, 1)

      const data = dates.map((date) => {
        return {
          timestamp: date,
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: groupBy,
        }
      })

      const { missingDates } = checkFootprintDates(data, groupBy)

      expect(missingDates.length > 0).toBe(false)
    })

    it('slices footprint data', () => {
      const data = [...new Array(3)].map((i, n) => {
        return {
          timestamp: moment
            .utc()
            .startOf(groupBy)
            .subtract(2, `${groupBy}s`)
            .add(n, `${groupBy}s`)
            .toDate(),
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: groupBy,
        }
      })

      const slicedFootprintData = sliceFootprintDataByLastMonth(data, groupBy)

      expect(slicedFootprintData).toEqual(data.slice(data.length - 1))
    })
  })

  describe('groupBy quarter', () => {
    const groupBy = 'quarter' as GroupBy.quarter
    it('does not have last 30 day total', () => {
      const data: EstimationResult[] = [
        {
          timestamp: moment.utc('2020-01-01').startOf(groupBy).toDate(),
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: groupBy,
        },
      ]

      const { missingDates } = checkFootprintDates(data, groupBy)

      expect(missingDates.length > 0).toBe(true)
    })

    it('has last 30 day total', () => {
      const dates = compileDates(groupBy, 1)

      const data = dates.map((date) => {
        return {
          timestamp: date,
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: groupBy,
        }
      })

      const { missingDates } = checkFootprintDates(data, groupBy)

      expect(missingDates.length > 0).toBe(false)
    })

    it('slices footprint data', () => {
      const data = [...new Array(3)].map((i, n) => {
        return {
          timestamp: moment
            .utc()
            .startOf(groupBy)
            .subtract(2, `${groupBy}s`)
            .add(n, `${groupBy}s`)
            .toDate(),
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: groupBy,
        }
      })

      const slicedFootprintData = sliceFootprintDataByLastMonth(data, groupBy)

      expect(slicedFootprintData).toEqual(data.slice(data.length - 1))
    })
  })

  describe('groupBy year', () => {
    const groupBy = 'year' as GroupBy.year
    it('does not have last 30 day total', () => {
      const data: EstimationResult[] = [
        {
          timestamp: moment.utc('2020-01-01').startOf(groupBy).toDate(),
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: groupBy,
        },
      ]

      const { missingDates } = checkFootprintDates(data, groupBy)

      expect(missingDates.length > 0).toBe(true)
    })

    it('has last 30 day total', () => {
      const dates = compileDates(groupBy, 1)

      const data = dates.map((date) => {
        return {
          timestamp: date,
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: groupBy,
        }
      })

      const { missingDates } = checkFootprintDates(data, groupBy)

      expect(missingDates.length > 0).toBe(false)
    })

    it('slices footprint data', () => {
      const data = [...new Array(3)].map((i, n) => {
        return {
          timestamp: moment
            .utc()
            .startOf(groupBy)
            .subtract(2, `${groupBy}s`)
            .add(n, `${groupBy}s`)
            .toDate(),
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: groupBy,
        }
      })

      const slicedFootprintData = sliceFootprintDataByLastMonth(data, groupBy)

      expect(slicedFootprintData).toEqual(data.slice(data.length - 1))
    })
  })
})

describe('getEmissionDateRange', () => {
  it('uses default config when config argument is omitted', () => {
    const { start, end } = getEmissionDateRange({})
    expect(moment.isMoment(start)).toBe(true)
    expect(moment.isMoment(end)).toBe(true)
  })

  it('uses PREVIOUS_YEAR_OF_USAGE when set', () => {
    const { start, end } = getEmissionDateRange({
      config: {
        DATE_RANGE: { TYPE: 'day', VALUE: '30' },
        MINIMAL_DATE_AGE: 0,
        PREVIOUS_YEAR_OF_USAGE: true,
        START_DATE: '',
        END_DATE: '2023-03-15',
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    expect(start.toISOString()).toEqual('2022-01-01T00:00:00.000Z')
    expect(end.toISOString()).toEqual('2023-03-15T00:00:00.000Z')
  })

  it('uses START_DATE when PREVIOUS_YEAR_OF_USAGE is false', () => {
    const { start, end } = getEmissionDateRange({
      config: {
        DATE_RANGE: { TYPE: 'month', VALUE: '2' },
        MINIMAL_DATE_AGE: 0,
        PREVIOUS_YEAR_OF_USAGE: false,
        START_DATE: '2021-09-01',
        END_DATE: '',
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    expect(start.toISOString()).toEqual('2021-09-01T00:00:00.000Z')
    expect(moment.isMoment(end)).toBe(true)
  })

  it('falls back to DATE_RANGE when PREVIOUS_YEAR_OF_USAGE and START_DATE are falsey', () => {
    const nowSpy = jest
      .spyOn(moment, 'now')
      .mockReturnValue(+new Date('2023-03-10T00:00:00.000Z'))
    const { start, end } = getEmissionDateRange({
      config: {
        DATE_RANGE: { TYPE: 'day', VALUE: '10' },
        MINIMAL_DATE_AGE: 0,
        PREVIOUS_YEAR_OF_USAGE: false,
        START_DATE: '',
        END_DATE: '',
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    expect(end.toISOString()).toEqual('2023-03-10T00:00:00.000Z')
    expect(start.toISOString()).toEqual('2023-02-28T00:00:00.000Z')
    nowSpy.mockRestore()
  })
})

describe('checkIfAllDatesExistForForecast', () => {
  it('returns true when all expected dates are missing', () => {
    expect(
      checkIfAllDatesExistForForecast({
        missingDates: [moment(), moment(), moment(), moment()],
        groupBy: 'week',
      }),
    ).toBe(true)
  })

  it('returns false when only some dates are missing', () => {
    expect(
      checkIfAllDatesExistForForecast({
        missingDates: [moment()],
        groupBy: 'week',
      }),
    ).toBe(false)
  })
})
