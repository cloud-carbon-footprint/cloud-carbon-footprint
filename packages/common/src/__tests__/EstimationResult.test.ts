/*
 * © 2021 Thoughtworks, Inc.
 */

import { reduceByTimestamp } from '../EstimationResult'
import { getPeriodEndDate } from '../helpers'
import { GroupBy } from '../Config'

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
    const grouping = GroupBy.day
    const initialData = [
      {
        timestamp: exampleDate,
        serviceEstimates: [estimateOne],
        periodStartDate: exampleDate,
        periodEndDate: getPeriodEndDate(exampleDate, grouping),
        groupBy: grouping,
      },
      {
        timestamp: exampleDate,
        serviceEstimates: [estimateTwo],
        periodStartDate: exampleDate,
        periodEndDate: getPeriodEndDate(exampleDate, grouping),
        groupBy: grouping,
      },
    ]

    // when
    const result = reduceByTimestamp(initialData)

    // then
    const expectedResult = [
      {
        timestamp: exampleDate,
        serviceEstimates: [estimateOne, estimateTwo],
        periodStartDate: exampleDate,
        periodEndDate: getPeriodEndDate(exampleDate, grouping),
        groupBy: grouping,
      },
    ]

    expect(result).toEqual(expectedResult)
  })
})
