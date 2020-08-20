import { App } from '@application/App'
import AWSServices from '@application/AWSServices'
import UsageData from '@domain/IUsageData'
import { RawRequest } from '@application/EstimationRequest'
import FootprintEstimate from '@domain/FootprintEstimate'
import { AWS_REGIONS } from '@services/AWSRegions'
import { EstimationResult } from '@application/EstimationResult'
import { mocked } from 'ts-jest/utils'
import moment = require('moment')
import ICloudService from '@domain/ICloudService'

jest.mock('@application/AWSServices')

const servicesRegistered = mocked(AWSServices, true)

describe('App', () => {
  let app: App

  beforeEach(() => {
    app = new App()
  })

  describe('getEstimate', () => {
    const rawRequest: RawRequest = {
      startDate: moment('2020-06-07').toISOString(),
      endDate: moment('2020-06-07').add(1, 'weeks').toISOString(),
      region: AWS_REGIONS.US_EAST_1,
    }

    it('should return ebs estimates for a week', async () => {
      const mockGetEstimates: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
      setUpServices([mockGetEstimates], ['ebs'])

      const expectedStorageEstimate: FootprintEstimate[] = [...Array(7)].map((v, i) => {
        return {
          timestamp: moment('2020-12-07').add(i, 'days').toDate(),
          wattHours: 1.0944,
          co2e: 0.0007737845760000001,
        }
      })
      mockGetEstimates.mockResolvedValueOnce(expectedStorageEstimate)

      const estimationResult: EstimationResult[] = await app.getCostAndEstimates(rawRequest)

      const expectedEstimationResults: EstimationResult[] = [...Array(7)].map((v, i) => {
        return {
          timestamp: moment.utc('2020-12-07').add(i, 'days').toDate(),
          serviceEstimates: [
            {
              timestamp: moment.utc('2020-12-07').add(i, 'days').toDate(),
              serviceName: 'ebs',
              wattHours: 1.0944,
              co2e: 0.0007737845760000001,
              cost: 0,
            },
          ],
        }
      })

      expect(estimationResult).toEqual(expectedEstimationResults)
    })

    it('should return estimates for 2 services', async () => {
      const mockGetEstimates1: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
      const mockGetEstimates2: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
      setUpServices([mockGetEstimates1, mockGetEstimates2], ['serviceOne', 'serviceTwo'])

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

      const estimationResult: EstimationResult[] = await app.getCostAndEstimates(rawRequest)

      const expectedEstimationResults = [
        {
          timestamp: new Date('2019-01-01'),
          serviceEstimates: [
            {
              timestamp: new Date('2019-01-01'),
              serviceName: 'serviceOne',
              wattHours: 0,
              co2e: 0,
              cost: 0,
            },
            {
              timestamp: new Date('2019-01-01'),
              serviceName: 'serviceTwo',
              wattHours: 1,
              co2e: 1,
              cost: 0,
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

      await expect(() => app.getCostAndEstimates(rawRequest)).rejects.toThrow('Start date is not before end date')
    })

    it('should aggregate per day', async () => {
      const mockGetEstimates: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
      setUpServices([mockGetEstimates], ['serviceOne'])
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

      const estimationResult: EstimationResult[] = await app.getCostAndEstimates(rawRequest)

      const expectedEstimationResults = [
        {
          timestamp: new Date('2019-01-01'),
          serviceEstimates: [
            {
              timestamp: new Date('2019-01-01'),
              serviceName: 'serviceOne',
              wattHours: 2,
              co2e: 4,
              cost: 0,
            },
          ],
        },
      ]
      expect(estimationResult).toEqual(expectedEstimationResults)
    })
  })

  it('should return estimates for multiple regions', async () => {
    const mockGetEstimates: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
    setUpServices([mockGetEstimates], ['serviceOne'])

    const expectedStorageEstimate: FootprintEstimate[] = [
      {
        timestamp: new Date('2019-01-01'),
        wattHours: 0,
        co2e: 0,
      },
    ]
    mockGetEstimates.mockResolvedValue(expectedStorageEstimate)

    const startDate = moment('2020-06-07').toISOString()
    const endDate = moment('2020-06-07').add(1, 'weeks').toISOString()
    const rawRequest: RawRequest = {
      startDate,
      endDate,
      region: null,
    }

    await app.getCostAndEstimates(rawRequest)

    expect(mockGetEstimates).toHaveBeenNthCalledWith(1, new Date(startDate), new Date(endDate), 'us-east-1')
    expect(mockGetEstimates).toHaveBeenNthCalledWith(2, new Date(startDate), new Date(endDate), 'us-east-2')
    expect(mockGetEstimates).toHaveBeenNthCalledWith(3, new Date(startDate), new Date(endDate), 'us-west-1')
  })
})

function setUpServices(mockGetEstimates: jest.Mock<Promise<FootprintEstimate[]>>[], serviceNames: string[]) {
  let mockGetUsage: jest.Mock<Promise<UsageData[]>>
  const mockCloudServices: ICloudService[] = mockGetEstimates.map((mockGetEstimate, i) => {
    return {
      getEstimates: mockGetEstimate,
      serviceName: serviceNames[i],
      getUsage: mockGetUsage,
      getCosts: jest.fn().mockResolvedValue([]),
    }
  })
  servicesRegistered.mockReturnValue(mockCloudServices)
}
