/*
 * © 2021 Thoughtworks, Inc.
 */

import CloudProviderAccount from '../CloudProviderAccount'
import { mockCloudService } from './__mocks__/CloudService'
import { CloudConstantsEmissionsFactors } from '../CloudConstantsTypes'
import Region from '../Region'

const mockGetEstimates = jest.fn()
const mockGetCosts = jest.fn()
const testService = new mockCloudService()

jest.mock('../Region', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getEstimates: mockGetEstimates,
      getCosts: mockGetCosts,
      services: [testService],
    }
  })
})

describe('CloudProviderAccount', () => {
  const dayOne = new Date('2021-01-01')
  const dayTwo = new Date('2021-01-02')

  const testCloudProvider = new CloudProviderAccount()

  const testEmissionsFactors: CloudConstantsEmissionsFactors = {
    'test-region': 0.123,
  }
  const testRegion = new Region(
    'test-region',
    [testService],
    testEmissionsFactors,
    {},
  )

  it('getRegionData', async () => {
    // given
    const mockEstimates = {
      [testService.serviceName]: [
        {
          timestamp: dayOne,
          kilowattHours: 1000,
          co2e: 20,
          usesAverageCPUConstant: true,
        },
        {
          timestamp: dayTwo,
          kilowattHours: 500,
          co2e: 200,
          usesAverageCPUConstant: false,
        },
      ],
    }

    const mockCosts = {
      [testService.serviceName]: [
        {
          timestamp: dayOne,
          amount: 100,
          currency: 'USD',
        },
        {
          timestamp: dayTwo,
          amount: 200,
          currency: 'USD',
        },
      ],
    }

    mockGetEstimates.mockResolvedValue(mockEstimates)
    mockGetCosts.mockResolvedValue(mockCosts)
    // when

    const result = await testCloudProvider.getRegionData(
      'test-cloud-provider',
      testRegion,
      dayOne,
      dayTwo,
    )

    // then
    const expectedResult = [
      {
        serviceEstimates: [
          {
            cloudProvider: 'test-cloud-provider',
            co2e: 20,
            cost: 100,
            kilowattHours: 1000,
            serviceName: 'test-service',
            usesAverageCPUConstant: true,
          },
        ],
        timestamp: dayOne,
      },
      {
        serviceEstimates: [
          {
            cloudProvider: 'test-cloud-provider',
            co2e: 200,
            cost: 200,
            kilowattHours: 500,
            serviceName: 'test-service',
            usesAverageCPUConstant: false,
          },
        ],
        timestamp: dayTwo,
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('getRegionData with missing cost data', async () => {
    const mockEstimates = {
      [testService.serviceName]: [
        {
          timestamp: dayOne,
          kilowattHours: 1000,
          co2e: 20,
          usesAverageCPUConstant: true,
        },
      ],
    }

    const mockCosts = {
      [testService.serviceName]: [
        {
          timestamp: dayOne,
        },
      ],
    }

    mockGetEstimates.mockResolvedValue(mockEstimates)
    mockGetCosts.mockResolvedValue(mockCosts)
    // when

    const result = await testCloudProvider.getRegionData(
      'test-cloud-provider',
      testRegion,
      dayOne,
      dayTwo,
    )

    // then
    const expectedResult = [
      {
        serviceEstimates: [
          {
            cloudProvider: 'test-cloud-provider',
            co2e: 20,
            cost: 0,
            kilowattHours: 1000,
            serviceName: 'test-service',
            usesAverageCPUConstant: true,
          },
        ],
        timestamp: dayOne,
      },
    ]
    expect(result).toEqual(expectedResult)
  })
})
