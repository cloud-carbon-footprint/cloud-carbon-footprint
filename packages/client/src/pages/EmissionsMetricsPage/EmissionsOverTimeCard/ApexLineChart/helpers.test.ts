/*
 * © 2021 Thoughtworks, Inc.
 */

import { GroupBy } from '@cloud-carbon-footprint/common'
import { filterBy, sortByDate } from './helpers'

describe('ApexLineChart helpers', () => {
  const point = (ts: Date | string) => ({
    timestamp: ts,
    periodStartDate: new Date('2020-01-01T00:00:00.000Z'),
    periodEndDate: new Date('2020-01-01T00:00:00.000Z'),
    serviceEstimates: [],
    groupBy: GroupBy.day,
  })

  it('sorts mixed timestamp types in ascending order', () => {
    const data = [
      point(new Date('2020-01-03T00:00:00.000Z')),
      point('2020-01-01T00:00:00.000Z'),
      point(new Date('2020-01-02T00:00:00.000Z')),
    ]

    const sorted = sortByDate(data)
    expect(sorted.map((d) => new Date(d.timestamp).toISOString())).toEqual([
      '2020-01-01T00:00:00.000Z',
      '2020-01-02T00:00:00.000Z',
      '2020-01-03T00:00:00.000Z',
    ])
  })

  it('returns all data when date range is incomplete or default', () => {
    const data = [
      point('2020-01-01T00:00:00.000Z'),
      point('2020-01-02T00:00:00.000Z'),
    ]
    const fullRange = {
      min: new Date('2020-01-01T00:00:00.000Z'),
      max: new Date('2020-01-03T00:00:00.000Z'),
    }

    expect(
      filterBy(data, { min: null, max: fullRange.max }, fullRange),
    ).toEqual(data)
    expect(filterBy(data, fullRange, fullRange)).toEqual(data)
  })

  it('filters data to points within the selected range', () => {
    const data = [
      point('2020-01-01T00:00:00.000Z'),
      point('2020-01-02T00:00:00.000Z'),
      point('2020-01-03T00:00:00.000Z'),
    ]
    const range = {
      min: new Date('2020-01-02T00:00:00.000Z'),
      max: new Date('2020-01-03T00:00:00.000Z'),
    }
    const defaultRange = {
      min: new Date('2020-01-01T00:00:00.000Z'),
      max: new Date('2020-01-04T00:00:00.000Z'),
    }

    const filtered = filterBy(data, range, defaultRange)
    expect(filtered).toHaveLength(2)
    expect(filtered.map((d) => new Date(d.timestamp).toISOString())).toEqual([
      '2020-01-02T00:00:00.000Z',
      '2020-01-03T00:00:00.000Z',
    ])
  })
})
