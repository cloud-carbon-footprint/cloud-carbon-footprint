/*
 * © 2021 Thoughtworks, Inc.
 */

import { reduceByTimestamp } from '../EstimationResult'

describe('Estimation Result', () => {
  const estimateOne = {
    cloudProvider: 'AWS',
    accountId: 'test account id',
    accountName: 'test account',
    serviceName: 'service test',
    kilowattHours: 25,
    co2e: 56,
    cost: 24,
    region: 'us-east-1',
    usesAverageCPUConstant: false,
  }
  const estimateTwo = {
    cloudProvider: 'GCP',
    accountId: 'test account id',
    accountName: 'test account',
    serviceName: 'service test',
    kilowattHours: 25,
    co2e: 56,
    cost: 24,
    region: 'us-east-1',
    usesAverageCPUConstant: false,
  }

  const exampleDate = new Date('2021-05-21')

  it('reduces by timestamp', () => {
    // given
    const initialData = [
      {
        timestamp: exampleDate,
        serviceEstimates: [estimateOne],
      },
      {
        timestamp: exampleDate,
        serviceEstimates: [estimateTwo],
      },
    ]

    // when
    const result = reduceByTimestamp(initialData)

    // then
    const expectedResult = [
      {
        timestamp: exampleDate,
        serviceEstimates: [estimateOne, estimateTwo],
      },
    ]

    expect(result).toEqual(expectedResult)
  })
})
