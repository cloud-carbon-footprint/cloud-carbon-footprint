import moment = require('moment')
import { App } from '@application/App'
import { EstimationResult } from '@application/EstimationResult'
import { mocked } from 'ts-jest/utils'
import FootprintEstimate from '@domain/FootprintEstimate'
import AWSServices from '@application/AWSServices'
import UsageData from '@domain/IUsageData'
import { RawRequest } from '@application/EstimationRequest'
import { AWS_REGIONS } from '@services/AWSRegions'

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
        region: AWS_REGIONS.US_EAST_1,
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
          timestamp: moment.utc('2020-12-07').add(i, 'days').toDate(),
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
        region: AWS_REGIONS.US_EAST_1,
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
        region: AWS_REGIONS.US_EAST_1,
      }

      await expect(() => app.getEstimate(rawRequest)).rejects.toThrow('Start date is not before end date')
    })

    it('should aggregate per day', async () => {
      //setup
      const mockGetEstimates: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
      let mockGetUsage: jest.Mock<Promise<UsageData[]>>
      const mockCloudServices = [{ getEstimates: mockGetEstimates, serviceName: 'serviceOne', getUsage: mockGetUsage }]

      AWSMock.mockReturnValue(mockCloudServices)

      const expectedStorageEstimate: FootprintEstimate[] = [
        {
          timestamp: new Date('2019-01-01T01:00:00Z'),
          wattHours: 1,
          co2e: 2,
        },
        {
          timestamp: new Date('2019-01-01T23:59:59Z'),
          wattHours: 1,
          co2e: 2,
        },
      ]

      mockGetEstimates.mockResolvedValueOnce(expectedStorageEstimate)

      const rawRequest: RawRequest = {
        startDate: moment('2020-06-07').toISOString(),
        endDate: moment('2020-06-07').add(1, 'weeks').toISOString(),
        region: AWS_REGIONS.US_EAST_1,
      }

      //run
      const estimationResult: EstimationResult[] = await app.getEstimate(rawRequest)

      //assert
      const expectedEstimationResults: EstimationResult[] = [
        {
          timestamp: new Date('2019-01-01'),
          estimates: [
            {
              serviceName: 'serviceOne',
              wattHours: 2,
              co2e: 4,
            }
          ],
        },
      ]

      expect(estimationResult).toEqual(expectedEstimationResults)
    })
  })
})
