/*
 * © 2021 Thoughtworks, Inc.
 */

import StorageUsage from '../StorageUsage'
import { HDDStorageService, SSDStorageService } from '../StorageService'
import { StorageEstimator } from '../StorageEstimator'
import { FootprintEstimate } from '../../.'
import { Cost } from '../../cost'

describe('StorageService', () => {
  const ssdCoefficient = 1.2
  const hddCoefficient = 0.65
  describe('getEstimates', () => {
    class TestHDDService extends HDDStorageService {
      serviceName = 'testService'
      constructor() {
        super(hddCoefficient)
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
        super(ssdCoefficient)
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

    const awsUsEast1Region = 'us-east-1'
    const awsEmissionsFactors = {
      [awsUsEast1Region]: 0.000415755,
    }
    const awsConstants = {
      powerUsageEffectiveness: 1.135,
    }

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
        awsUsEast1Region,
        awsEmissionsFactors,
        awsConstants,
      )

      //assert
      expect(estimates).toEqual(
        new StorageEstimator(hddCoefficient).estimate(
          [
            {
              timestamp: date,
              terabyteHours: 10,
            },
          ],
          awsUsEast1Region,
          awsEmissionsFactors,
          awsConstants,
        ),
      )
      expect(getUsageMock).toBeCalledWith(date, date, awsUsEast1Region)
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
        awsUsEast1Region,
        awsEmissionsFactors,
        awsConstants,
      )

      //assert
      expect(estimates).toEqual(
        new StorageEstimator(ssdCoefficient).estimate(
          [
            {
              timestamp: date,
              terabyteHours: 10,
            },
          ],
          awsUsEast1Region,
          awsEmissionsFactors,
          awsConstants,
        ),
      )
      expect(getUsageMock).toBeCalledWith(date, date, awsUsEast1Region)
    })
  })
})
