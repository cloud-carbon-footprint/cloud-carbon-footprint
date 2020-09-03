import App from '@application/App'
import AWSServices from '@application/AWSServices'
import UsageData from '@domain/IUsageData'
import { validate } from '@application/EstimationRequest'
import FootprintEstimate from '@domain/FootprintEstimate'
import { EstimationResult } from '@application/EstimationResult'
import { mocked } from 'ts-jest/utils'
import moment = require('moment')
import ICloudService from '@domain/ICloudService'
import Cost from '@domain/Cost'
import { RawRequest } from '@view/RawRequest'

jest.mock('@application/AWSServices')

const servicesRegistered = mocked(AWSServices, true)

describe('App', () => {
  let app: App
  const startDate = '2020-08-07'
  const endDate = '2020-08-10'
  const region = 'us-east-1'
  const rawRequest: RawRequest = {
    startDate: moment(startDate).toISOString(),
    endDate: moment(endDate).add(1, 'weeks').toISOString(),
    region: region,
  }
  const estimationRequest = validate(rawRequest)

  beforeEach(() => {
    app = new App()
  })

  describe('getEstimate', () => {
    it('should return ebs estimates for a week', async () => {
      const mockGetCostAndEstimatesPerService: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
      setUpServices([mockGetCostAndEstimatesPerService], ['ebs'])

      const expectedUsageEstimate: FootprintEstimate[] = [...Array(7)].map((v, i) => {
        return {
          timestamp: moment(startDate).add(i, 'days').toDate(),
          wattHours: 1.0944,
          co2e: 0.0007737845760000001,
        }
      })
      mockGetCostAndEstimatesPerService.mockResolvedValueOnce(expectedUsageEstimate)

      const estimationResult: EstimationResult[] = await app.getCostAndEstimates(rawRequest)

      const expectedEstimationResults: EstimationResult[] = [...Array(7)].map((v, i) => {
        return {
          timestamp: moment.utc(startDate).add(i, 'days').toDate(),
          serviceEstimates: [
            {
              timestamp: moment.utc(startDate).add(i, 'days').toDate(),
              serviceName: 'ebs',
              wattHours: 1.0944,
              co2e: 0.0007737845760000001,
              cost: 0,
              region: region,
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
          timestamp: new Date(startDate),
          wattHours: 2,
          co2e: 2,
        },
      ]
      mockGetEstimates1.mockResolvedValueOnce(expectedStorageEstimate)

      const expectedStorageEstimate2: FootprintEstimate[] = [
        {
          timestamp: new Date(startDate),
          wattHours: 1,
          co2e: 1,
        },
      ]
      mockGetEstimates2.mockResolvedValueOnce(expectedStorageEstimate2)

      const estimationResult: EstimationResult[] = await app.getCostAndEstimates(rawRequest)

      const expectedEstimationResults = [
        {
          timestamp: new Date(startDate),
          serviceEstimates: [
            {
              timestamp: new Date(startDate),
              serviceName: 'serviceOne',
              wattHours: 2,
              co2e: 2,
              cost: 0,
              region: region,
            },
            {
              timestamp: new Date(startDate),
              serviceName: 'serviceTwo',
              wattHours: 1,
              co2e: 1,
              cost: 0,
              region: region,
            },
          ],
        },
      ]

      expect(estimationResult).toEqual(expectedEstimationResults)
    })

    it('should return error if start date is greater than end date', async () => {
      const rawRequest: RawRequest = {
        startDate: moment(endDate).toISOString(),
        endDate: moment(startDate).toISOString(),
        region: region,
      }

      await expect(() => app.getCostAndEstimates(rawRequest)).rejects.toThrow('Start date is not before end date')
    })

    it('should aggregate per day', async () => {
      const mockGetEstimates: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
      setUpServices([mockGetEstimates], ['serviceOne'])
      const expectedStorageEstimate: FootprintEstimate[] = [
        {
          timestamp: new Date(startDate + 'T01:00:00Z'),
          wattHours: 1,
          co2e: 2,
        },
        {
          timestamp: new Date(startDate + 'T12:59:59Z'),
          wattHours: 1,
          co2e: 2,
        },
        {
          timestamp: new Date(startDate + 'T23:59:59Z'),
          wattHours: 1,
          co2e: 2,
        },
      ]
      mockGetEstimates.mockResolvedValueOnce(expectedStorageEstimate)

      const estimationResult: EstimationResult[] = await app.getCostAndEstimates(rawRequest)

      const expectedEstimationResults = [
        {
          timestamp: new Date(startDate),
          serviceEstimates: [
            {
              timestamp: new Date(startDate),
              serviceName: 'serviceOne',
              wattHours: 3,
              co2e: 6,
              cost: 0,
              region: region,
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
        timestamp: new Date(startDate),
        wattHours: 0,
        co2e: 0,
      },
    ]
    mockGetEstimates.mockResolvedValue(expectedStorageEstimate)

    const start = moment(startDate).toISOString()
    const end = moment(startDate).add(1, 'weeks').toISOString()
    const rawRequest: RawRequest = {
      startDate: start,
      endDate: end,
      region: null,
    }

    await app.getCostAndEstimates(rawRequest)

    expect(mockGetEstimates).toHaveBeenNthCalledWith(1, new Date(start), new Date(end), 'us-east-1')
    expect(mockGetEstimates).toHaveBeenNthCalledWith(2, new Date(start), new Date(end), 'us-east-2')
    expect(mockGetEstimates).toHaveBeenNthCalledWith(3, new Date(start), new Date(end), 'us-west-1')
  })

  it('gets costs', async () => {
    const mockGetCosts: jest.Mock<Promise<Cost[]>> = jest.fn()
    setUpServicesCost([mockGetCosts], ['serviceOne'])

    app.getCosts(AWSServices()[0], estimationRequest, region)

    expect(mockGetCosts).toHaveBeenCalled()
  })
})

function setUpServices(mockGetCostAndEstimates: jest.Mock<Promise<FootprintEstimate[]>>[], serviceNames: string[]) {
  let mockGetUsage: jest.Mock<Promise<UsageData[]>>
  const mockCloudServices: ICloudService[] = mockGetCostAndEstimates.map((mockGetCostAndEstimate, i) => {
    return {
      getEstimates: mockGetCostAndEstimate,
      serviceName: serviceNames[i],
      getUsage: mockGetUsage,
      getCosts: jest.fn().mockResolvedValue([]),
    }
  })
  servicesRegistered.mockReturnValue(mockCloudServices)
}

function setUpServicesCost(mockGetCosts: jest.Mock<Promise<Cost[]>>[], serviceNames: string[]) {
  let mockGetUsage: jest.Mock<Promise<UsageData[]>>
  const mockCloudServices: ICloudService[] = mockGetCosts.map((mockGetCost, i) => {
    return {
      getEstimates: jest.fn().mockResolvedValue([]),
      serviceName: serviceNames[i],
      getUsage: mockGetUsage,
      getCosts: mockGetCost,
    }
  })
  servicesRegistered.mockReturnValue(mockCloudServices)
}
