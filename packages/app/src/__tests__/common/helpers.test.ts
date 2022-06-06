/*
 * © 2021 Thoughtworks, Inc.
 */

import { getCachedData, writeToFile } from '../../common/helpers'
import { Readable, Stream } from 'stream'
import { EstimationResult, GroupBy } from '@cloud-carbon-footprint/common'

describe('common/helpers.ts', () => {
  it('reads cached data formatted with [] and newlines separators', async () => {
    const mockData = Readable.from([
      '[\n',
      '{"this": "that", "timestamp": "2020-01-01"}',
      '\n]',
    ])

    const cachedData = await getCachedData(mockData)

    const expectedData = [{ this: 'that', timestamp: new Date('2020-01-01') }]

    expect(cachedData).toEqual(expectedData)
  })

  it('writes cache file with correct separators', async () => {
    const dataToBeCached: EstimationResult[] = [
      {
        timestamp: new Date('2020-01-01'),
        serviceEstimates: [],
        periodStartDate: undefined,
        periodEndDate: undefined,
        groupBy: GroupBy.day,
      },
    ]

    // intercept file writing calls
    const writable = new Stream.Writable()
    let cachedData = ''
    writable._write = (chunk, encoding, next) => {
      cachedData += chunk.toString()
      next()
    }

    await writeToFile(writable, dataToBeCached)

    const expectedCachedString =
      '[\n{"timestamp":"2020-01-01T00:00:00.000Z","serviceEstimates":[],"groupBy":"day"}\n]'

    expect(cachedData).toEqual(expectedCachedString)
  })
})
