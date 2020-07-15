import moment = require('moment')
import { App } from '@application/App'
import { EstimationResult } from '@application/EstimationResult'
import { mocked } from 'ts-jest/utils'
import FootprintEstimate from '@domain/FootprintEstimate'
import AWS from '@domain/AWS'
import UsageData from '@domain/UsageData'
import { RawRequest } from '@application/EstimationRequest'

jest.mock('@domain/AWS')

const AWSMock = mocked(AWS, true)

describe('App', () => {
  let app: App
  let mockGetEstimates: jest.Mock<Promise<FootprintEstimate[]>>
  let mockGetUsage: jest.Mock<Promise<UsageData[]>>
  beforeAll(() => {
    app = new App()

    mockGetEstimates = jest.fn()
    const mockCloudService = { getEstimates: mockGetEstimates, serviceName: 'ebs', getUsage: mockGetUsage }

    AWSMock.mockReturnValueOnce([mockCloudService])
  })

  describe('getEstimate', () => {
    it('should return ebs estimates for a week', async () => {
      //setup
      const rawRequest: RawRequest = {
        startDate: moment('2020-06-07').toISOString(),
        endDate: moment('2020-06-07').add(1, 'weeks').toISOString(),
      }

      const expectedStorageEstimate: FootprintEstimate[] = [...Array(7)].map((v, i) => {
        return {
          timestamp: moment('2020-12-07').add(i, 'days').toDate(),
          wattHours: 1.0944,
          co2e: 0.0007737845760000001,
        }
      })
      mockGetEstimates.mockResolvedValueOnce(expectedStorageEstimate)

      //run
      const estimationResult: EstimationResult[] = await app.getEstimate(rawRequest)

      //assert
      const expectedEstimationResults: EstimationResult[] = [...Array(7)].map((v, i) => {
        return {
          timestamp: moment('2020-12-07').add(i, 'days').toDate(),
          estimates: [
            {
              serviceName: 'ebs',
              wattHours: 1.0944,
              co2e: 0.0007737845760000001,
            },
          ],
        }
      })

      expect(estimationResult).toEqual(expectedEstimationResults)
    })

    it('should return error if start date is greater than end date', async () => {
      //setup
      const rawRequest: RawRequest = {
        startDate: moment('2020-06-07').toISOString(),
        endDate: moment('2020-06-06').toISOString(),
      }

      await expect(() => app.getEstimate(rawRequest)).rejects.toThrow('Start date is not before end date')
    })
  })
})
