/*
 * © 2021 Thoughtworks, Inc.
 */

import seedCacheFile from '../../SeedCacheFile/seedCacheFile'
import { EstimationRequestValidationError, EstimationResult } from '@cloud-carbon-footprint/common'

const mockGetCostAndEstimates = jest.fn()

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
    const start = '2020-07-01'
    const end = '2020-07-07'
    const groupBy = 'day'
    const rawRequest = [
      'executable',
      'file',
      '--startDate',
      start,
      '--endDate',
      end,
      '--groupBy',
      groupBy
    ]

      
      const originalLog = console.log
      const warnLog = console.warn

      afterEach(() => {
        console.log = originalLog
        console.warn = warnLog
        jest.restoreAllMocks()
      })

    it('logs success when seeds cache file', async () => {
        const expectedResponse: EstimationResult[] = []
        mockGetCostAndEstimates.mockResolvedValueOnce(expectedResponse)
        console.log = jest.fn()
        await seedCacheFile(rawRequest)
        expect(console.log).toHaveBeenCalledWith('success')
    })

    it('throws an estimation validation error given invalid EstimationResult', async () => {
        const expectedResponse = null
        mockGetCostAndEstimates.mockResolvedValueOnce(expectedResponse)
        console.warn = jest.fn()
        await seedCacheFile(rawRequest)
        expect(seedCacheFile).rejects.toThrowError(EstimationRequestValidationError)
    })

    describe('start and end date parameter validation', () => {
        describe('given: invalid dates', () => {
          it('throws an estimation validation error', async () => {
            // setup
            const start = '2020-06-16'
            const end = '2020-06-15'
            const command = [
              'executable',
              'file',
              '--startDate',
              start,
              '--endDate',
              end,
            ]
    
            //assert
            await expect(() => {
              return seedCacheFile([...command])
            }).rejects.toThrow(EstimationRequestValidationError)
          })
        })
      })
})