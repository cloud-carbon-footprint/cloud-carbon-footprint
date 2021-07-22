/*
 * © 2021 Thoughtworks, Inc.
 */

import { CloudWatch, CostExplorer, CloudWatchLogs } from 'aws-sdk'
import { FootprintEstimate, Cost } from '@cloud-carbon-footprint/core'
import RDS from '../lib/RDS'
import RDSStorage from '../lib/RDSStorage'
import RDSComputeService from '../lib/RDSCompute'
import { ServiceWrapper } from '../lib/ServiceWrapper'

describe('RDS Service', function () {
  const startDate = '2020-08-16'
  const endDate = '2020-08-17'
  const region = 'us-east-1'
  const getServiceWrapper = () =>
    new ServiceWrapper(
      new CloudWatch(),
      new CloudWatchLogs(),
      new CostExplorer(),
    )

  it('Combines the results from both the RDSCompute and RDSStorage services ', async () => {
    const rdsComputeEstimate: FootprintEstimate[] = [
      {
        co2e: 1,
        timestamp: new Date(startDate),
        kilowattHours: 4,
      },
    ]

    const rdsStorageEstimate: FootprintEstimate[] = [
      {
        co2e: 2,
        timestamp: new Date(startDate),
        kilowattHours: 1,
      },
    ]

    const rdsComputeMockGetEstimates: jest.Mock<Promise<FootprintEstimate[]>> =
      jest.fn()
    const rdsComputeMock: RDSComputeService = new RDSComputeService(
      getServiceWrapper(),
    )
    rdsComputeMock.getEstimates = rdsComputeMockGetEstimates
    rdsComputeMockGetEstimates.mockResolvedValueOnce(rdsComputeEstimate)

    const rdsStorageMockGetEstimates: jest.Mock<Promise<FootprintEstimate[]>> =
      jest.fn()
    const rdsStorageMock: RDSStorage = new RDSStorage(getServiceWrapper())
    rdsStorageMock.getEstimates = rdsStorageMockGetEstimates
    rdsStorageMockGetEstimates.mockResolvedValueOnce(rdsStorageEstimate)

    const rdsService: RDS = new RDS(rdsComputeMock, rdsStorageMock)

    const emissionsFactors = {
      [region]: 0.000415755,
    }
    const constants = {
      powerUsageEffectiveness: 1.135,
    }
    const rdsEstimates = await rdsService.getEstimates(
      new Date(startDate),
      new Date(endDate),
      region,
      emissionsFactors,
      constants,
    )

    expect(rdsEstimates).toEqual([
      {
        co2e: 3,
        timestamp: new Date(startDate),
        kilowattHours: 5,
      },
    ])
  })

  it('combines the cost from RDS compute and RDS storage', async () => {
    const rdsComputeMockGetCost: jest.Mock<Promise<Cost[]>> = jest.fn()
    const rdsComputeMock: RDSComputeService = new RDSComputeService(
      getServiceWrapper(),
    )
    rdsComputeMock.getCosts = rdsComputeMockGetCost
    rdsComputeMockGetCost.mockResolvedValueOnce([
      {
        timestamp: new Date(startDate),
        amount: 33.33,
        currency: 'USD',
      },
    ])

    const rdsStorageMockGetCost: jest.Mock<Promise<Cost[]>> = jest.fn()
    const rdsStorageMock: RDSStorage = new RDSStorage(getServiceWrapper())
    rdsStorageMock.getCosts = rdsStorageMockGetCost
    rdsStorageMockGetCost.mockResolvedValueOnce([
      {
        timestamp: new Date(startDate),
        amount: 66.66,
        currency: 'USD',
      },
    ])

    const rdsService: RDS = new RDS(rdsComputeMock, rdsStorageMock)
    const res = await rdsService.getCosts(
      new Date(startDate),
      new Date(startDate),
      region,
    )

    expect(rdsComputeMockGetCost).toBeCalledWith(
      new Date(startDate),
      new Date(startDate),
      region,
    )
    expect(rdsStorageMockGetCost).toBeCalledWith(
      new Date(startDate),
      new Date(startDate),
      region,
    )
    expect(res).toEqual([
      {
        timestamp: new Date(startDate),
        amount: 99.99,
        currency: 'USD',
      },
    ])
  })

  it('combines the cost from RDS compute and RDS storage for 2 days', async () => {
    const rdsComputeMockGetCost: jest.Mock<Promise<Cost[]>> = jest.fn()
    const rdsComputeMock: RDSComputeService = new RDSComputeService(
      getServiceWrapper(),
    )
    rdsComputeMock.getCosts = rdsComputeMockGetCost
    rdsComputeMockGetCost.mockResolvedValueOnce([
      {
        timestamp: new Date(startDate),
        amount: 33.33,
        currency: 'USD',
      },
      {
        timestamp: new Date(endDate),
        amount: 11.11,
        currency: 'USD',
      },
    ])

    const rdsStorageMockGetCost: jest.Mock<Promise<Cost[]>> = jest.fn()
    const rdsStorageMock: RDSStorage = new RDSStorage(getServiceWrapper())
    rdsStorageMock.getCosts = rdsStorageMockGetCost
    rdsStorageMockGetCost.mockResolvedValueOnce([
      {
        timestamp: new Date(startDate),
        amount: 66.66,
        currency: 'USD',
      },
      {
        timestamp: new Date(endDate),
        amount: 22.22,
        currency: 'USD',
      },
    ])

    const rdsService: RDS = new RDS(rdsComputeMock, rdsStorageMock)

    const res = await rdsService.getCosts(
      new Date(startDate),
      new Date(endDate),
      region,
    )

    expect(rdsComputeMockGetCost).toBeCalledWith(
      new Date(startDate),
      new Date(endDate),
      region,
    )
    expect(rdsStorageMockGetCost).toBeCalledWith(
      new Date(startDate),
      new Date(endDate),
      region,
    )
    expect(res).toEqual([
      {
        timestamp: new Date(startDate),
        amount: 99.99,
        currency: 'USD',
      },
      {
        timestamp: new Date(endDate),
        amount: 33.33,
        currency: 'USD',
      },
    ])
  })
})
