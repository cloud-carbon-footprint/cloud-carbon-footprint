/**
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import fs, { promises } from 'fs'
import { env } from 'process'
import { GroupBy } from '@cloud-carbon-footprint/common'
import { writeToFile } from '../common/helpers'
import EstimatorCacheFileSystem from '../EstimatorCacheFileSystem'
import { EstimationRequest } from '../CreateValidRequest'
import { FileHandle } from 'fs/promises'

jest.mock('fs', () => {
  const actual = jest.requireActual('fs')
  return {
    ...actual,
    readFileSync: actual.readFileSync,
    promises: { access: jest.fn(), writeFile: jest.fn(), open: jest.fn() },
  }
})

jest.mock('../common/helpers', () => {
  const requireActual = jest.requireActual('../common/helpers')
  return {
    ...requireActual,
    writeToFile: jest.fn(),
  }
})

const mockWrite = writeToFile as jest.Mocked<never>
const mockFs = promises as jest.Mocked<typeof promises>

function buildFootprintEstimates(startDate: string, consecutiveDays: number) {
  const grouping = 'day' as GroupBy
  return [...Array(consecutiveDays)].map((v, i) => {
    return {
      timestamp: moment.utc(startDate).add(i, 'days').toDate(),
      serviceEstimates: [],
      periodStartDate: undefined,
      periodEndDate: undefined,
      groupBy: grouping,
    }
  })
}

describe('EstimatorCacheFileSystem', () => {
  let estimatorCache: EstimatorCacheFileSystem

  beforeEach(() => {
    estimatorCache = new EstimatorCacheFileSystem()
    jest.resetModules() // Most important - it clears the cache
    jest.resetAllMocks()
    env.TEST_MODE = 'true'
  })

  it('reads estimations from file when asked to load', async () => {
    const mockContent = JSON.parse(
      fs.readFileSync('mock-estimates.json', 'utf8'),
    )

    const estimates = await estimatorCache.getEstimates(
      {} as EstimationRequest,
      'day',
    )

    await expect(estimates).toEqual(mockContent)
  })

  it('will create a new empty file if fails to load cache', async () => {
    mockFs.access.mockImplementation(() => {
      throw new Error('failed to open cache')
    })

    await estimatorCache.getEstimates({} as EstimationRequest, 'day')

    expect(mockFs.writeFile).toHaveBeenCalledWith(
      'mock-estimates.json',
      '[]',
      'utf8',
    )
  })

  it('will concatenate estimates to cache', async () => {
    const estimates = buildFootprintEstimates('2020-01-01', 1)

    mockFs.open.mockResolvedValue({
      close: jest.fn(),
    } as unknown as FileHandle)

    await estimatorCache.setEstimates(estimates, GroupBy.day)

    await expect(mockWrite).toHaveBeenCalledWith(
      expect.anything(),
      estimates,
      expect.anything(),
    )
  })
})
