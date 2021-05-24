/*
 * © 2021 ThoughtWorks, Inc.
 */

import { reduceByTimestamp } from '../EstimationResult'

describe('Estimation Result', () => {
  it('reduces by timestamp', () => {
    // given
    const initialData = [
      {
        timestamp: new Date('2021-05-21'),
        serviceEstimates: [
          {
            cloudProvider: 'AWS',
            accountName: 'test account',
            serviceName: 'service test',
            kilowattHours: 25,
            co2e: 56,
            cost: 24,
            region: 'us-east-1',
            usesAverageCPUConstant: false,
          },
        ],
      },
      {
        timestamp: new Date('2021-05-21'),
        serviceEstimates: [
          {
            cloudProvider: 'GCP',
            accountName: 'test account',
            serviceName: 'service test',
            kilowattHours: 25,
            co2e: 56,
            cost: 24,
            region: 'us-east-1',
            usesAverageCPUConstant: false,
          },
        ],
      },
    ]

    // when
    const result = reduceByTimestamp(initialData)
    // then

    const expectedResult = [
      {
        timestamp: new Date('2021-05-21'),
        serviceEstimates: [
          {
            cloudProvider: 'AWS',
            accountName: 'test account',
            serviceName: 'service test',
            kilowattHours: 25,
            co2e: 56,
            cost: 24,
            region: 'us-east-1',
            usesAverageCPUConstant: false,
          },
          {
            cloudProvider: 'GCP',
            accountName: 'test account',
            serviceName: 'service test',
            kilowattHours: 25,
            co2e: 56,
            cost: 24,
            region: 'us-east-1',
            usesAverageCPUConstant: false,
          },
        ],
      },
    ]

    expect(result).toEqual(expectedResult)
  })
})
