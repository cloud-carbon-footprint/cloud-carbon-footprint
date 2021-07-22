/*
 * © 2021 Thoughtworks, Inc.
 */

import { CloudConstantsEmissionsFactors } from '../CloudConstantsTypes'
import Region from '../Region'
import { mockCloudService } from './__mocks__/CloudService'

describe('Region', () => {
  const startDate = new Date('2021-01-01')
  const endDate = new Date('2021-01-02')
  const testService = new mockCloudService()
  const testEmissionsFactors: CloudConstantsEmissionsFactors = {
    'test-region': 0.123,
  }
  const testRegion = new Region(
    'test-region',
    [testService],
    testEmissionsFactors,
    {},
  )

  it('getEstimates', async () => {
    // given

    const expectedEstimates = [
      {
        timestamp: new Date(startDate),
        kilowattHours: 100,
        co2e: 10,
        usesAverageCPUConstant: false,
      },
      {
        timestamp: new Date(endDate),
        kilowattHours: 100,
        co2e: 10,
        usesAverageCPUConstant: false,
      },
    ]

    // when
    const result = await testRegion.getEstimates(startDate, endDate)

    // then
    const expectedResults = {
      [testService.serviceName]: expectedEstimates,
    }
    expect(result).toEqual(expectedResults)
  })

  it('getCosts', async () => {
    // given
    const expectedCosts = [
      {
        timestamp: new Date(startDate),
        amount: 10,
        currency: 'USD',
      },
      {
        timestamp: new Date(endDate),
        amount: 100,
        currency: 'USD',
      },
    ]

    // when
    const result = await testRegion.getCosts(startDate, endDate)

    // then
    const expectedResults = {
      [testService.serviceName]: expectedCosts,
    }
    expect(result).toEqual(expectedResults)
  })
})
