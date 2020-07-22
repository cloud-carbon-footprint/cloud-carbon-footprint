import moment = require('moment')
import { App } from '@application/App'
import { EstimationResult } from '@application/EstimationResult'
import { mocked } from 'ts-jest/utils'
import FootprintEstimate from '@domain/FootprintEstimate'
import AWSServices from '@application/AWSServices'
import UsageData from '@domain/UsageData'
import { RawRequest } from '@application/EstimationRequest'

jest.mock('@application/AWSServices')

const AWSMock = mocked(AWSServices, true)

describe('App', () => {
  let app: App

  beforeEach(() => {
    app = new App()
  })

  describe('getEstimate', () => {
    it('should return ebs estimates for a week', async () => {
      //setup
      const mockGetEstimates: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
      let mockGetUsage: jest.Mock<Promise<UsageData[]>>
      const mockCloudServices = { getEstimates: mockGetEstimates, serviceName: 'ebs', getUsage: mockGetUsage }

      AWSMock.mockReturnValue([mockCloudServices])

      const rawRequest: RawRequest = {
        startDate: moment('2020-06-07').toISOString(),
        endDate: moment('2020-06-07').add(1, 'weeks').toISOString(),
        region: 'us-east-1',
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

    it('should return estimates for 2 services', async () => {
      //setup
      const mockGetEstimates1: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
      const mockGetEstimates2: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
      let mockGetUsage: jest.Mock<Promise<UsageData[]>>
      const mockCloudServices = [
        { getEstimates: mockGetEstimates1, serviceName: 'serviceOne', getUsage: mockGetUsage },
        { getEstimates: mockGetEstimates2, serviceName: 'serviceTwo', getUsage: mockGetUsage },
      ]

      AWSMock.mockReturnValue(mockCloudServices)

      const rawRequest: RawRequest = {
        startDate: moment('2020-06-07').toISOString(),
        endDate: moment('2020-06-07').add(1, 'weeks').toISOString(),
        region: 'us-east-1',
      }

      const expectedStorageEstimate: FootprintEstimate[] = [
        {
          timestamp: new Date('2019-01-01'),
          wattHours: 0,
          co2e: 0,
        },
      ]

      mockGetEstimates1.mockResolvedValueOnce(expectedStorageEstimate)

      const expectedStorageEstimate2: FootprintEstimate[] = [
        {
          timestamp: new Date('2019-01-01'),
          wattHours: 1,
          co2e: 1,
        },
      ]

      mockGetEstimates2.mockResolvedValueOnce(expectedStorageEstimate2)

      //run
      const estimationResult: EstimationResult[] = await app.getEstimate(rawRequest)

      //assert
      const expectedEstimationResults: EstimationResult[] = [
        {
          timestamp: new Date('2019-01-01'),
          estimates: [
            {
              serviceName: 'serviceOne',
              wattHours: 0,
              co2e: 0,
            },
            {
              serviceName: 'serviceTwo',
              wattHours: 1,
              co2e: 1,
            },
          ],
        },
      ]

      expect(estimationResult).toEqual(expectedEstimationResults)
    })

    it('should return error if start date is greater than end date', async () => {
      //setup
      const rawRequest: RawRequest = {
        startDate: moment('2020-06-07').toISOString(),
        endDate: moment('2020-06-06').toISOString(),
        region: 'us-east-1',
      }

      await expect(() => app.getEstimate(rawRequest)).rejects.toThrow('Start date is not before end date')
    })
  })
})
