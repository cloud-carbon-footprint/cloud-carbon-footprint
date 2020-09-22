import App from '@application/App'
import AWSServices from '@application/AWSServices'
import GCPServices from '@application/GCPServices'
import UsageData from '@domain/IUsageData'
import FootprintEstimate from '@domain/FootprintEstimate'
import { EstimationResult } from '@application/EstimationResult'
import { mocked } from 'ts-jest/utils'
import moment = require('moment')
import ICloudService from '@domain/ICloudService'
import Cost from '@domain/Cost'
import cache from '@application/Cache'
import { EstimationRequest } from '@application/CreateValidRequest'

jest.mock('@application/AWSServices')
jest.mock('@application/GCPServices')
jest.mock('@application/Cache')

const testRegions = ['us-east-1', 'us-east-2']

jest.mock('@application/Config.json', () => {
  return {
    AWS: {
      NAME: 'aws',
      CURRENT_REGIONS: ['us-east-1', 'us-east-2'],
    },
    GCP: {
      NAME: 'gcp',
      CURRENT_REGIONS: ['us-east1'],
    },
  }
})

const AWSServicesRegistered: jest.Mock<any> = mocked(AWSServices, true)
const GCPServicesRegistered: jest.Mock<any> = mocked(GCPServices, true)

describe('App', () => {
  let app: App
  const startDate = '2020-08-07'
  const endDate = '2020-08-10'
  const region = 'us-east-1'
  const request: EstimationRequest = {
    startDate: moment(startDate).toDate(),
    endDate: moment(endDate).add(1, 'weeks').toDate(),
    region: region,
  }

  beforeEach(() => {
    app = new App()
  })

  describe('getCostAndEstimates', () => {
    it('returns ebs estimates for a week', async () => {
      const mockGetCostAndEstimatesPerService: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
      const mockGetCostPerService: jest.Mock<Promise<Cost[]>> = jest.fn()
      setUpServices(AWSServicesRegistered, [mockGetCostAndEstimatesPerService], ['ebs'], [mockGetCostPerService])

      const expectedUsageEstimate: FootprintEstimate[] = [...Array(7)].map((v, i) => {
        return {
          timestamp: moment(startDate).add(i, 'days').toDate(),
          wattHours: 1.0944,
          co2e: 0.0007737845760000001,
        }
      })
      mockGetCostAndEstimatesPerService.mockResolvedValueOnce(expectedUsageEstimate)

      const costs: Cost[] = [...Array(7)].map((v, i) => {
        return {
          timestamp: moment(startDate).add(i, 'days').toDate(),
          currency: '$',
          amount: 5,
        }
      })
      mockGetCostPerService.mockResolvedValueOnce(costs)

      const estimationResult: EstimationResult[] = await app.getCostAndEstimates(request)

      const expectedEstimationResults: EstimationResult[] = [...Array(7)].map((v, i) => {
        return {
          timestamp: moment.utc(startDate).add(i, 'days').toDate(),
          serviceEstimates: [
            {
              cloudProvider: 'aws',
              serviceName: 'ebs',
              wattHours: 1.0944,
              co2e: 0.0007737845760000001,
              cost: 5,
              region: region,
            },
          ],
        }
      })

      expect(estimationResult).toEqual(expectedEstimationResults)
    })

    it('returns estimates for 2 services', async () => {
      const mockGetEstimates1: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
      const mockGetEstimates2: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
      const mockGetCostPerService1: jest.Mock<Promise<Cost[]>> = jest.fn()
      const mockGetCostPerService2: jest.Mock<Promise<Cost[]>> = jest.fn()
      setUpServices(
        AWSServicesRegistered,
        [mockGetEstimates1, mockGetEstimates2],
        ['serviceOne', 'serviceTwo'],
        [mockGetCostPerService1, mockGetCostPerService2],
      )

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

      const expectedCosts: Cost[] = [
        {
          timestamp: new Date(startDate),
          currency: '$',
          amount: 3,
        },
      ]
      mockGetCostPerService1.mockResolvedValueOnce(expectedCosts)

      const expectedCosts2: Cost[] = [
        {
          timestamp: new Date(startDate),
          currency: '$$',
          amount: 4,
        },
      ]
      mockGetCostPerService2.mockResolvedValueOnce(expectedCosts2)

      const estimationResult: EstimationResult[] = await app.getCostAndEstimates(request)

      const expectedEstimationResults = [
        {
          timestamp: new Date(startDate),
          serviceEstimates: [
            {
              cloudProvider: 'aws',
              serviceName: 'serviceOne',
              wattHours: 2,
              co2e: 2,
              cost: 3,
              region: region,
            },
            {
              cloudProvider: 'aws',
              serviceName: 'serviceTwo',
              wattHours: 1,
              co2e: 1,
              cost: 4,
              region: region,
            },
          ],
        },
      ]

      expect(estimationResult).toEqual(expectedEstimationResults)
    })

    it('aggregates per day', async () => {
      const mockGetEstimates: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
      setUpServices(AWSServicesRegistered, [mockGetEstimates], ['serviceOne'], [jest.fn().mockResolvedValue([])])
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

      const estimationResult: EstimationResult[] = await app.getCostAndEstimates(request)

      const expectedEstimationResults = [
        {
          timestamp: new Date(startDate),
          serviceEstimates: [
            {
              cloudProvider: 'aws',
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

    it('uses cache decorator', async () => {
      const mockGetCostAndEstimatesPerService: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
      setUpServices(
        AWSServicesRegistered,
        [mockGetCostAndEstimatesPerService],
        ['ebs'],
        [jest.fn().mockResolvedValue([])],
      )
      mockGetCostAndEstimatesPerService.mockResolvedValueOnce([])

      await app.getCostAndEstimates(request)
      expect(cache).toHaveBeenCalled()
    })

    it('returns ebs estimates ordered by timestamp ascending', async () => {
      const mockGetCostAndEstimatesPerService: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
      setUpServices(
        AWSServicesRegistered,
        [mockGetCostAndEstimatesPerService],
        ['ebs'],
        [jest.fn().mockResolvedValue([])],
      )

      const expectedUsageEstimate: FootprintEstimate[] = [...Array(7)].map((v, i) => {
        return {
          timestamp: moment(startDate).subtract(i, 'days').toDate(),
          wattHours: 1.0944,
          co2e: 0.0007737845760000001,
        }
      })
      mockGetCostAndEstimatesPerService.mockResolvedValueOnce(expectedUsageEstimate)

      const estimationResult: EstimationResult[] = await app.getCostAndEstimates(request)

      const expectedEstimationResults: EstimationResult[] = [...Array(7)].map((v, i) => {
        return {
          timestamp: moment
            .utc(startDate)
            .subtract(6 - i, 'days')
            .toDate(),
          serviceEstimates: [
            {
              cloudProvider: 'aws',
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
  })

  it('returns estimates for multiple regions', async () => {
    const mockGetEstimates: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
    setUpServices(AWSServicesRegistered, [mockGetEstimates], ['serviceOne'], [jest.fn().mockResolvedValue([])])
    setUpServices(GCPServicesRegistered, [jest.fn().mockResolvedValue([])], [], [jest.fn().mockResolvedValue([])])

    const expectedStorageEstimate: FootprintEstimate[] = [
      {
        timestamp: new Date(startDate),
        wattHours: 3,
        co2e: 6,
      },
    ]
    mockGetEstimates.mockResolvedValue(expectedStorageEstimate)

    const start = moment(startDate).toDate()
    const end = moment(startDate).add(1, 'day').toDate()
    const request: EstimationRequest = {
      startDate: start,
      endDate: end,
    }

    const result = await app.getCostAndEstimates(request)

    const expectedEstimationResults = [
      {
        timestamp: new Date(startDate),
        serviceEstimates: [
          {
            cloudProvider: 'aws',
            serviceName: 'serviceOne',
            wattHours: 3,
            co2e: 6,
            cost: 0,
            region: testRegions[0],
          },
          {
            cloudProvider: 'aws',
            serviceName: 'serviceOne',
            wattHours: 3,
            co2e: 6,
            cost: 0,
            region: testRegions[1],
          },
        ],
      },
    ]

    expect(mockGetEstimates).toHaveBeenNthCalledWith(1, new Date(start), new Date(end), 'us-east-1')
    expect(mockGetEstimates).toHaveBeenNthCalledWith(2, new Date(start), new Date(end), 'us-east-2')

    expect(result).toEqual(expectedEstimationResults)
  })

  it('returns estimates for multiple services in multiple regions', async () => {
    const mockGetEstimates: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
    const mockGetEstimates2: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
    const mockGetCostPerService1: jest.Mock<Promise<Cost[]>> = jest.fn()
    const mockGetCostPerService2: jest.Mock<Promise<Cost[]>> = jest.fn()

    setUpServices(
      AWSServicesRegistered,
      [mockGetEstimates, mockGetEstimates2],
      ['serviceOne', 'serviceTwo'],
      [mockGetCostPerService1, mockGetCostPerService2],
    )
    setUpServices(GCPServicesRegistered, [jest.fn().mockResolvedValue([])], [], [jest.fn().mockResolvedValue([])])

    const expectedStorageEstimate: FootprintEstimate[] = [
      {
        timestamp: new Date(startDate),
        wattHours: 3,
        co2e: 6,
      },
    ]
    mockGetEstimates.mockResolvedValue(expectedStorageEstimate)

    const expectedStorageEstimate2: FootprintEstimate[] = [
      {
        timestamp: new Date(startDate),
        wattHours: 4,
        co2e: 8,
      },
    ]
    mockGetEstimates2.mockResolvedValue(expectedStorageEstimate2)

    const expectedCosts: Cost[] = [
      {
        timestamp: new Date(startDate),
        currency: '$',
        amount: 3,
      },
    ]
    mockGetCostPerService1.mockResolvedValue(expectedCosts)
    mockGetCostPerService2.mockResolvedValue(expectedCosts)

    const start = moment(startDate).toDate()
    const end = moment(startDate).add(1, 'day').toDate()
    const request: EstimationRequest = {
      startDate: start,
      endDate: end,
    }

    const result = await app.getCostAndEstimates(request)

    const expectedEstimationResults = [
      {
        timestamp: new Date(startDate),
        serviceEstimates: [
          {
            cloudProvider: 'aws',
            serviceName: 'serviceOne',
            wattHours: 3,
            co2e: 6,
            cost: 3,
            region: testRegions[0],
          },
          {
            cloudProvider: 'aws',
            serviceName: 'serviceTwo',
            wattHours: 4,
            co2e: 8,
            cost: 3,
            region: testRegions[0],
          },
          {
            cloudProvider: 'aws',
            serviceName: 'serviceOne',
            wattHours: 3,
            co2e: 6,
            cost: 3,
            region: testRegions[1],
          },
          {
            cloudProvider: 'aws',
            serviceName: 'serviceTwo',
            wattHours: 4,
            co2e: 8,
            cost: 3,
            region: testRegions[1],
          },
        ],
      },
    ]

    expect(mockGetEstimates).toHaveBeenNthCalledWith(1, new Date(start), new Date(end), 'us-east-1')
    expect(mockGetEstimates).toHaveBeenNthCalledWith(2, new Date(start), new Date(end), 'us-east-2')

    expect(result).toEqual(expectedEstimationResults)
  })

  it('returns estimates for multiple regions in multiple cloud providers', async () => {
    const mockGetAWSEstimates: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
    setUpServices(AWSServicesRegistered, [mockGetAWSEstimates], ['serviceOne'], [jest.fn().mockResolvedValue([])])

    const mockGetGCPEstimates: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
    setUpServices(GCPServicesRegistered, [mockGetGCPEstimates], ['serviceTwo'], [jest.fn().mockResolvedValue([])])

    const expectedStorageEstimate: FootprintEstimate[] = [
      {
        timestamp: new Date(startDate),
        wattHours: 3,
        co2e: 6,
      },
    ]
    mockGetAWSEstimates.mockResolvedValue(expectedStorageEstimate)

    const expectedStorageEstimate2: FootprintEstimate[] = [
      {
        timestamp: new Date(startDate),
        wattHours: 4,
        co2e: 8,
      },
    ]
    mockGetGCPEstimates.mockResolvedValue(expectedStorageEstimate2)

    const start = moment(startDate).toDate()
    const end = moment(startDate).add(1, 'day').toDate()
    const request: EstimationRequest = {
      startDate: start,
      endDate: end,
    }

    const result = await app.getCostAndEstimates(request)

    const expectedEstimationResults = [
      {
        timestamp: new Date(startDate),
        serviceEstimates: [
          {
            cloudProvider: 'aws',
            serviceName: 'serviceOne',
            wattHours: 3,
            co2e: 6,
            cost: 0,
            region: 'us-east-1',
          },
          {
            cloudProvider: 'aws',
            serviceName: 'serviceOne',
            wattHours: 3,
            co2e: 6,
            cost: 0,
            region: 'us-east-2',
          },
          {
            cloudProvider: 'gcp',
            serviceName: 'serviceTwo',
            wattHours: 4,
            co2e: 8,
            cost: 0,
            region: 'us-east1',
          },
        ],
      },
    ]

    expect(mockGetAWSEstimates).toHaveBeenNthCalledWith(1, new Date(start), new Date(end), 'us-east-1')
    expect(mockGetAWSEstimates).toHaveBeenNthCalledWith(2, new Date(start), new Date(end), 'us-east-2')

    expect(mockGetGCPEstimates).toHaveBeenNthCalledWith(1, new Date(start), new Date(end), 'us-east1')
    expect(result).toEqual(expectedEstimationResults)
  })
})

function setUpServices(
  servicesRegistered: jest.Mock<ICloudService[]>,
  mockGetEstimates: jest.Mock<Promise<FootprintEstimate[]>>[],
  serviceNames: string[],
  mockGetCosts: jest.Mock<Promise<Cost[]>>[],
) {
  let mockGetUsage: jest.Mock<Promise<UsageData[]>>
  const mockCloudServices: ICloudService[] = mockGetEstimates.map((mockGetEstimate, i) => {
    return {
      getEstimates: mockGetEstimate,
      serviceName: serviceNames[i],
      getUsage: mockGetUsage,
      getCosts: mockGetCosts[i],
    }
  })
  servicesRegistered.mockReturnValue(mockCloudServices)
}
