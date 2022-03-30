/*
 * © 2021 Thoughtworks, Inc.
 */

import seedCacheFile from '../../SeedCacheFile/seedCacheFile'
import * as common from '../../SeedCacheFile/common'
import { EstimationRequestValidationError, EstimationResult } from '@cloud-carbon-footprint/common'

const mockGetCostAndEstimates = jest.fn()
jest.mock('../../SeedCacheFile/common')
const mockInputPrompts: jest.Mock = common.inputPrompt as jest.Mock

jest.mock('@cloud-carbon-footprint/app', () => ({
  ...(jest.requireActual('@cloud-carbon-footprint/app') as Record<
    string,
    unknown
  >),
  App: jest.fn().mockImplementation(() => {
    return {
      getCostAndEstimates: mockGetCostAndEstimates
    }
  }),
  cache: jest.fn(),
}))

describe('seedCacheFile', () => {
  const originalLog = console.log
  const warnLog = console.warn

  beforeEach(() => {
    mockInputPrompts.mockClear()
      .mockResolvedValueOnce('2020-07-01').mockClear()
      .mockResolvedValueOnce('2020-07-07').mockClear()
      .mockResolvedValueOnce('day')
  })

  afterEach(() => {
    console.log = originalLog
    console.warn = warnLog
    jest.restoreAllMocks()
  })

  it('logs success when seeds cache file', async () => {
    const expectedResponse: EstimationResult[] = []
    mockGetCostAndEstimates.mockResolvedValueOnce(expectedResponse)
    console.log = jest.fn()
    await seedCacheFile()
    expect(mockInputPrompts.mock.calls).toMatchSnapshot()
    expect(console.log).toBeCalledWith("success")
  })

  it('throws an estimation validation error given invalid EstimationResult', async () => {
    const expectedResponse = null
    mockGetCostAndEstimates.mockResolvedValueOnce(expectedResponse)
    await seedCacheFile()
    expect(seedCacheFile).rejects.toThrowError(EstimationRequestValidationError)
  })

  describe('start and end date parameter validation', () => {
    describe('given: invalid dates', () => {
      beforeEach(() => {
        mockInputPrompts
          .mockResolvedValueOnce('2020-07-08').mockClear()
          .mockResolvedValueOnce('2020-07-07').mockClear()
          .mockResolvedValueOnce('day')
      })

      it('throws an estimation validation error', async () => {
        const expectedResponse: EstimationResult[] = []
        mockGetCostAndEstimates.mockResolvedValueOnce(expectedResponse)
        await seedCacheFile()
        expect(mockInputPrompts.mock.calls).toMatchSnapshot()
        await expect(seedCacheFile).rejects.toThrow(EstimationRequestValidationError)
      })
    })
  })
})