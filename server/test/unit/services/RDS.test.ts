import RDS from '@services/RDS'
import FootprintEstimate from '@domain/FootprintEstimate'
import RDSStorage from '@services/RDSStorage'
import RDSComputeService from '@services/RDSCompute'
import Cost from '@domain/Cost'

describe('RDS Service', function () {
  it('Combines the results from both the RDSCompute and RDSStorage services ', async () => {
    // given
    const startDate = new Date('2020-01-01')
    const endDate = new Date('2020-01-02')
    const region = 'us-east-1'

    const rdsComputeEstimate: FootprintEstimate[] = [
      {
        co2e: 1,
        timestamp: new Date('2020-01-01T00:00:00.000Z'),
        wattHours: 4,
      },
    ]

    const rdsStorageEstimate: FootprintEstimate[] = [
      {
        co2e: 2,
        timestamp: new Date('2020-01-01T00:00:00.000Z'),
        wattHours: 1,
      },
    ]

    const rdsComputeMockGetEstimates: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
    const rdsComputeMock: RDSComputeService = new RDSComputeService()
    rdsComputeMock.getEstimates = rdsComputeMockGetEstimates
    rdsComputeMockGetEstimates.mockResolvedValueOnce(rdsComputeEstimate)

    const rdsStorageMockGetEstimates: jest.Mock<Promise<FootprintEstimate[]>> = jest.fn()
    const rdsStorageMock: RDSStorage = new RDSStorage()

    rdsStorageMock.getEstimates = rdsStorageMockGetEstimates
    rdsStorageMockGetEstimates.mockResolvedValueOnce(rdsStorageEstimate)

    // when
    const rdsService: RDS = new RDS(rdsComputeMock, rdsStorageMock)

    const rdsEstimates = await rdsService.getEstimates(startDate, endDate, region)

    // then
    expect(rdsEstimates).toEqual([
      {
        co2e: 3,
        timestamp: new Date('2020-01-01T00:00:00.000Z'),
        wattHours: 5,
      },
    ])
  })

  it('combines the cost from RDS compute and RDS storage', async () => {
    // given
    const rdsComputeMockGetCost: jest.Mock<Promise<Cost[]>> = jest.fn()
    const rdsComputeMock: RDSComputeService = new RDSComputeService()
    rdsComputeMock.getCosts = rdsComputeMockGetCost
    rdsComputeMockGetCost.mockResolvedValueOnce([
      {
        timestamp: new Date('2020-08-17'),
        amount: 33.33,
        currency: 'USD',
      },
    ])

    const rdsStorageMockGetCost: jest.Mock<Promise<Cost[]>> = jest.fn()
    const rdsStorageMock: RDSStorage = new RDSStorage()
    rdsStorageMock.getCosts = rdsStorageMockGetCost
    rdsStorageMockGetCost.mockResolvedValueOnce([
      {
        timestamp: new Date('2020-08-17'),
        amount: 66.66,
        currency: 'USD',
      },
    ])

    const rdsService: RDS = new RDS(rdsComputeMock, rdsStorageMock)

    // when
    const res = await rdsService.getCosts(new Date('2020-08-17'), new Date('2020-08-17'), 'us-east-1')

    // then
    expect(rdsComputeMockGetCost).toBeCalledWith(new Date('2020-08-17'), new Date('2020-08-17'), 'us-east-1')
    expect(rdsStorageMockGetCost).toBeCalledWith(new Date('2020-08-17'), new Date('2020-08-17'), 'us-east-1')
    expect(res).toEqual([
      {
        timestamp: new Date('2020-08-17'),
        amount: 99.99,
        currency: 'USD',
      },
    ])
  })

  it('combines the cost from RDS compute and RDS storage for 2 days', async () => {
    // given
    const rdsComputeMockGetCost: jest.Mock<Promise<Cost[]>> = jest.fn()
    const rdsComputeMock: RDSComputeService = new RDSComputeService()
    rdsComputeMock.getCosts = rdsComputeMockGetCost
    rdsComputeMockGetCost.mockResolvedValueOnce([
      {
        timestamp: new Date('2020-08-16'),
        amount: 33.33,
        currency: 'USD',
      },
      {
        timestamp: new Date('2020-08-17'),
        amount: 11.11,
        currency: 'USD',
      },
    ])

    const rdsStorageMockGetCost: jest.Mock<Promise<Cost[]>> = jest.fn()
    const rdsStorageMock: RDSStorage = new RDSStorage()
    rdsStorageMock.getCosts = rdsStorageMockGetCost
    rdsStorageMockGetCost.mockResolvedValueOnce([
      {
        timestamp: new Date('2020-08-16'),
        amount: 66.66,
        currency: 'USD',
      },
      {
        timestamp: new Date('2020-08-17'),
        amount: 22.22,
        currency: 'USD',
      },
    ])

    const rdsService: RDS = new RDS(rdsComputeMock, rdsStorageMock)

    // when
    const res = await rdsService.getCosts(new Date('2020-08-17'), new Date('2020-08-17'), 'us-east-1')

    // then
    expect(rdsComputeMockGetCost).toBeCalledWith(new Date('2020-08-17'), new Date('2020-08-17'), 'us-east-1')
    expect(rdsStorageMockGetCost).toBeCalledWith(new Date('2020-08-17'), new Date('2020-08-17'), 'us-east-1')
    expect(res).toEqual([
      {
        timestamp: new Date('2020-08-16'),
        amount: 99.99,
        currency: 'USD',
      },
      {
        timestamp: new Date('2020-08-17'),
        amount: 33.33,
        currency: 'USD',
      },
    ])
  })
})
