/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import { EstimationResult, GroupBy } from '@cloud-carbon-footprint/common'
import { checkFootprintDates } from './handleDates'

describe('checks footprint dates', () => {
  const error: Error | null = null
  describe('no data', () => {
    it('does not have last 30 day total', () => {
      const data: EstimationResult[] = []

      const footprint = { data, error, loading: false }
      const groupBy = 'day' as GroupBy.day
      const { missingDates } = checkFootprintDates({ footprint, groupBy })

      expect(missingDates.length > 0).toBe(true)
    })
  })

  describe('groupBy day', () => {
    const groupBy = 'day' as GroupBy.day
    it('does not have last 30 day total', () => {
      const dates = [...new Array(2)].map((i, n) =>
        moment.utc().startOf(groupBy).subtract(n, `${groupBy}s`).toDate(),
      )

      const data = dates.map((date) => {
        return {
          timestamp: date,
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: groupBy,
        }
      })

      const footprint = { data, error, loading: false }
      const { missingDates } = checkFootprintDates({ footprint, groupBy })

      expect(missingDates.length > 0).toBe(true)
    })

    it('has last 30 day total', () => {
      const dates = [...new Array(30)].map((i, n) =>
        moment.utc().startOf(groupBy).subtract(n, `${groupBy}s`).toDate(),
      )

      const data = dates.map((date) => {
        return {
          timestamp: date,
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: groupBy,
        }
      })

      const footprint = { data, error, loading: false }
      const { missingDates } = checkFootprintDates({ footprint, groupBy })

      expect(missingDates.length > 0).toBe(false)
    })
  })

  describe('groupBy week', () => {
    const groupBy = 'week' as GroupBy.week
    it('does not have last 30 day total', () => {
      const dates = [...new Array(2)].map((i, n) =>
        moment.utc().startOf(groupBy).subtract(n, `${groupBy}s`).toDate(),
      )

      const data = dates.map((date) => {
        return {
          timestamp: date,
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: GroupBy.week,
        }
      })

      const footprint = { data, error, loading: false }
      const { missingDates } = checkFootprintDates({ footprint, groupBy })

      expect(missingDates.length > 0).toBe(true)
    })

    it('has last 30 day total', () => {
      const dates = [...new Array(4)].map((i, n) =>
        moment.utc().startOf(groupBy).subtract(n, `${groupBy}s`).toDate(),
      )

      const data = dates.map((date) => {
        return {
          timestamp: date,
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: groupBy,
        }
      })

      const footprint = { data, error, loading: false }
      const { missingDates } = checkFootprintDates({ footprint, groupBy })

      expect(missingDates.length > 0).toBe(false)
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

      const footprint = { data, error, loading: false }
      const { missingDates } = checkFootprintDates({ footprint, groupBy })

      expect(missingDates.length > 0).toBe(true)
    })

    it('has last 30 day total', () => {
      const dates = [...new Array(1)].map((i, n) =>
        moment.utc().startOf(groupBy).subtract(n, `${groupBy}s`).toDate(),
      )

      const data = dates.map((date) => {
        return {
          timestamp: date,
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: groupBy,
        }
      })

      const footprint = { data, error, loading: false }
      const { missingDates } = checkFootprintDates({ footprint, groupBy })

      expect(missingDates.length > 0).toBe(false)
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

      const footprint = { data, error, loading: false }
      const { missingDates } = checkFootprintDates({ footprint, groupBy })

      expect(missingDates.length > 0).toBe(true)
    })

    it('has last 30 day total', () => {
      const dates = [...new Array(1)].map((i, n) =>
        moment.utc().startOf(groupBy).subtract(n, `${groupBy}s`).toDate(),
      )

      const data = dates.map((date) => {
        return {
          timestamp: date,
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: groupBy,
        }
      })

      const footprint = { data, error, loading: false }
      const { missingDates } = checkFootprintDates({ footprint, groupBy })

      expect(missingDates.length > 0).toBe(false)
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

      const footprint = { data, error, loading: false }
      const { missingDates } = checkFootprintDates({ footprint, groupBy })

      expect(missingDates.length > 0).toBe(true)
    })

    it('has last 30 day total', () => {
      const dates = [...new Array(1)].map((i, n) =>
        moment.utc().startOf(groupBy).subtract(n, `${groupBy}s`).toDate(),
      )

      const data = dates.map((date) => {
        return {
          timestamp: date,
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: groupBy,
        }
      })

      const footprint = { data, error, loading: false }
      const { missingDates } = checkFootprintDates({ footprint, groupBy })

      expect(missingDates.length > 0).toBe(false)
    })
  })
})
