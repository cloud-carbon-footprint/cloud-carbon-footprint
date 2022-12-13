/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  EstimationRequestValidationError,
  EstimationResult,
} from '@cloud-carbon-footprint/common'
import seedCacheFile from '../../SeedCacheFile/seedCacheFile'
import * as common from '../../common'

const mockGetCostAndEstimates = jest.fn()
jest.mock('../../common')
const mockInputPrompts: jest.Mock = common.inputPrompt as jest.Mock

jest.mock('@cloud-carbon-footprint/app', () => ({
  ...(jest.requireActual('@cloud-carbon-footprint/app') as Record<
    string,
    unknown
  >),
  App: jest.fn().mockImplementation(() => {
    return {
      getCostAndEstimates: mockGetCostAndEstimates,
    }
  }),
  cache: jest.fn(),
}))

describe('seedCacheFile', () => {
  describe('given: successful request', () => {
    beforeEach(() => {
      mockInputPrompts
        .mockClear()
        .mockResolvedValueOnce('2020-07-01')
        .mockClear()
        .mockResolvedValueOnce('2020-07-07')
        .mockClear()
        .mockResolvedValueOnce('day')
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('logs success when cache file is seeded', async () => {
      const expectedResponse: EstimationResult[] = []
      mockGetCostAndEstimates.mockResolvedValueOnce(expectedResponse)
      jest.spyOn(console, 'info').mockImplementation()
      jest.spyOn(process, 'exit').mockImplementation((number) => {
        return number
      })
      await seedCacheFile()

      expect(mockInputPrompts.mock.calls).toMatchSnapshot()
      expect(console.info).toBeCalledWith(
        'Cache file has successfully been seeded!',
      )
      expect(process.exit).toBeCalledWith(0)
    })
  })

  describe('start and end date parameter validation', () => {
    describe('given: invalid dates', () => {
      beforeEach(() => {
        mockInputPrompts
          .mockResolvedValueOnce('2020-07-08')
          .mockClear()
          .mockResolvedValueOnce('2020-07-07')
          .mockClear()
          .mockResolvedValueOnce('day')
          .mockClear()
          .mockResolvedValueOnce('AWS')
      })

      it('throws an estimation validation error', async () => {
        const expectedResponse: EstimationResult[] = []
        mockGetCostAndEstimates.mockResolvedValueOnce(expectedResponse)

        expect(mockInputPrompts.mock.calls).toMatchSnapshot()
        await expect(() => seedCacheFile()).rejects.toThrow(
          'Start date is after end date',
          EstimationRequestValidationError,
        )
      })
    })
  })

  describe('optional parameter validation', () => {
    describe('given: invalid cloud provider', () => {
      beforeEach(() => {
        mockInputPrompts
          .mockResolvedValueOnce('2020-07-01')
          .mockClear()
          .mockResolvedValueOnce('2020-07-08')
          .mockClear()
          .mockResolvedValueOnce('day')
          .mockClear()
          .mockResolvedValueOnce('asw')
      })

      it('throws an estimation validation error', async () => {
        const expectedResponse: EstimationResult[] = []
        mockGetCostAndEstimates.mockResolvedValueOnce(expectedResponse)

        expect(mockInputPrompts.mock.calls).toMatchSnapshot()
        await expect(() => seedCacheFile()).rejects.toThrow(
          'Not a valid cloud provider to seed',
          EstimationRequestValidationError,
        )
      })
    })
  })
})
