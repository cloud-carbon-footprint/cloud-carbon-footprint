import StorageService from '@domain/StorageService'
import StorageUsage from '@domain/StorageUsage'
import FootprintEstimate from '@domain/FootprintEstimate'
import { StorageEstimator } from '@domain/StorageEstimator'
import { AWS_POWER_USAGE_EFFECTIVENESS } from '@domain/constants'

describe('StorageService', () => {
  describe('getEstimates', () => {
    class TestService extends StorageService {
      serviceName = 'testService'
      static COEFFICIENT = 1.2

      constructor() {
        super(TestService.COEFFICIENT)
      }

      getUsage(start: Date, end: Date): Promise<StorageUsage[]> {
        return undefined
      }
    }

    let testService: TestService
    let getUsageMock: jest.Mock<Promise<StorageUsage[]>>
    beforeEach(() => {
      testService = new TestService()
      getUsageMock = jest.fn()
      testService.getUsage = getUsageMock
    })

    it('should return estimates for the storage usage of a day', async () => {
      //setup
      const date = new Date('2020-07-07')
      const usage = [
        {
          timestamp: date,
          sizeGb: 10,
        },
      ]
      getUsageMock.mockResolvedValueOnce(usage)

      //run
      const estimates: FootprintEstimate[] = await testService.getEstimates(date, date, 'us-east-1')

      //assert
      expect(estimates).toEqual(
        new StorageEstimator(TestService.COEFFICIENT, AWS_POWER_USAGE_EFFECTIVENESS).estimate(
          [
            {
              timestamp: date,
              sizeGb: 10,
            },
          ],
          'us-east-1',
        ),
      )
      expect(getUsageMock).toBeCalledWith(date, date)
    })
  })
})
