/*
 * © 2021 ThoughtWorks, Inc.
 */

import { HDDStorageService, SSDStorageService } from '../StorageService'
import StorageUsage from '../StorageUsage'
import FootprintEstimate from '../FootprintEstimate'
import { StorageEstimator } from '../StorageEstimator'
import { CLOUD_CONSTANTS } from '../FootprintEstimationConstants'
import { AWS_REGIONS } from '../../services/aws/AWSRegions'
import Cost from '../Cost'

describe('StorageService', () => {
  describe('getEstimates', () => {
    class TestHDDService extends HDDStorageService {
      serviceName = 'testService'
      constructor() {
        super()
      }

      getUsage(): Promise<StorageUsage[]> {
        return undefined
      }

      getCosts(): Promise<Cost[]> {
        return undefined
      }
    }

    class TestSSDService extends SSDStorageService {
      serviceName = 'testService'
      constructor() {
        super()
      }

      getUsage(): Promise<StorageUsage[]> {
        return undefined
      }

      getCosts(): Promise<Cost[]> {
        return undefined
      }
    }

    let testHDDService: TestHDDService
    let testSDDService: TestSSDService
    let getUsageMock: jest.Mock<Promise<StorageUsage[]>>
    beforeEach(() => {
      testHDDService = new TestHDDService()
      testSDDService = new TestSSDService()
      getUsageMock = jest.fn()
      testHDDService.getUsage = getUsageMock
      testSDDService.getUsage = getUsageMock
    })

    it('should return estimates for the HDD storage usage of a day', async () => {
      //setup
      const date = new Date('2020-07-07')
      const usage = [
        {
          timestamp: date,
          terabyteHours: 10,
        },
      ]
      getUsageMock.mockResolvedValue(usage)

      //run
      const estimates: FootprintEstimate[] = await testHDDService.getEstimates(
        date,
        date,
        AWS_REGIONS.US_EAST_1,
        'AWS',
      )

      //assert
      expect(estimates).toEqual(
        new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT).estimate(
          [
            {
              timestamp: date,
              terabyteHours: 10,
            },
          ],
          AWS_REGIONS.US_EAST_1,
          'AWS',
        ),
      )
      expect(getUsageMock).toBeCalledWith(date, date, AWS_REGIONS.US_EAST_1)
    })

    it('should return estimates for the SSD storage usage of a day', async () => {
      //setup
      const date = new Date('2020-07-07')
      const usage = [
        {
          timestamp: date,
          terabyteHours: 10,
        },
      ]
      getUsageMock.mockResolvedValue(usage)

      //run
      const estimates: FootprintEstimate[] = await testSDDService.getEstimates(
        date,
        date,
        AWS_REGIONS.US_EAST_1,
        'AWS',
      )

      //assert
      expect(estimates).toEqual(
        new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT).estimate(
          [
            {
              timestamp: date,
              terabyteHours: 10,
            },
          ],
          AWS_REGIONS.US_EAST_1,
          'AWS',
        ),
      )
      expect(getUsageMock).toBeCalledWith(date, date, AWS_REGIONS.US_EAST_1)
    })
  })
})
