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

      const footprintData = { data, error, loading: false }
      const datesExist = checkFootprintDates(footprintData)

      expect(datesExist.length > 0).toBe(true)
    })
  })

  describe('groupBy day', () => {
    it('does not have last 30 day total', () => {
      const dates = [...new Array(2)].map((i, n) =>
        moment.utc().startOf('day').subtract(n, 'days').toDate(),
      )

      const data = dates.map((date) => {
        return {
          timestamp: date,
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: GroupBy.day,
        }
      })

      const footprintData = { data, error, loading: false }
      const datesExist = checkFootprintDates(footprintData)

      expect(datesExist.length > 0).toBe(true)
    })

    it('has last 30 day total', () => {
      const dates = [...new Array(30)].map((i, n) =>
        moment.utc().startOf('day').subtract(n, 'days').toDate(),
      )

      const data = dates.map((date) => {
        return {
          timestamp: date,
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: GroupBy.day,
        }
      })

      const footprintData = { data, error, loading: false }
      const datesExist = checkFootprintDates(footprintData)

      expect(datesExist.length > 0).toBe(false)
    })
  })

  describe('groupBy week', () => {
    it('does not have last 30 day total', () => {
      const dates = [...new Array(2)].map((i, n) =>
        moment.utc().startOf('week').subtract(n, 'weeks').toDate(),
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

      const footprintData = { data, error, loading: false }
      const datesExist = checkFootprintDates(footprintData)

      expect(datesExist.length > 0).toBe(true)
    })

    it('has last 30 day total', () => {
      const dates = [...new Array(4)].map((i, n) =>
        moment.utc().startOf('week').subtract(n, 'weeks').toDate(),
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

      const footprintData = { data, error, loading: false }
      const datesExist = checkFootprintDates(footprintData)

      expect(datesExist.length > 0).toBe(false)
    })
  })

  describe('groupBy month', () => {
    it('does not have last 30 day total', () => {
      const data: EstimationResult[] = [
        {
          timestamp: moment.utc('2020-01-01').startOf('month').toDate(),
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: GroupBy.month,
        },
      ]

      const footprintData = { data, error, loading: false }
      const datesExist = checkFootprintDates(footprintData)

      expect(datesExist.length > 0).toBe(true)
    })

    it('has last 30 day total', () => {
      const dates = [...new Array(1)].map((i, n) =>
        moment.utc().startOf('month').subtract(n, 'months').toDate(),
      )

      const data = dates.map((date) => {
        return {
          timestamp: date,
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: GroupBy.month,
        }
      })

      const footprintData = { data, error, loading: false }
      const datesExist = checkFootprintDates(footprintData)

      expect(datesExist.length > 0).toBe(false)
    })
  })

  describe('groupBy quarter', () => {
    it('does not have last 30 day total', () => {
      const data: EstimationResult[] = [
        {
          timestamp: moment.utc('2020-01-01').startOf('quarter').toDate(),
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: GroupBy.quarter,
        },
      ]

      const footprintData = { data, error, loading: false }
      const datesExist = checkFootprintDates(footprintData)

      expect(datesExist.length > 0).toBe(true)
    })

    it('has last 30 day total', () => {
      const dates = [...new Array(1)].map((i, n) =>
        moment.utc().startOf('quarter').subtract(n, 'quarters').toDate(),
      )

      const data = dates.map((date) => {
        return {
          timestamp: date,
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: GroupBy.quarter,
        }
      })

      const footprintData = { data, error, loading: false }
      const datesExist = checkFootprintDates(footprintData)

      expect(datesExist.length > 0).toBe(false)
    })
  })

  describe('groupBy year', () => {
    it('does not have last 30 day total', () => {
      const data: EstimationResult[] = [
        {
          timestamp: moment.utc('2020-01-01').startOf('year').toDate(),
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: GroupBy.year,
        },
      ]

      const footprintData = { data, error, loading: false }
      const datesExist = checkFootprintDates(footprintData)

      expect(datesExist.length > 0).toBe(true)
    })

    it('has last 30 day total', () => {
      const dates = [...new Array(1)].map((i, n) =>
        moment.utc().startOf('year').subtract(n, 'years').toDate(),
      )

      const data = dates.map((date) => {
        return {
          timestamp: date,
          serviceEstimates: [],
          periodStartDate: new Date(''),
          periodEndDate: new Date(''),
          groupBy: GroupBy.year,
        }
      })

      const footprintData = { data, error, loading: false }
      const datesExist = checkFootprintDates(footprintData)

      expect(datesExist.length > 0).toBe(false)
    })
  })
})
