/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import ComputeEstimator from '@domain/ComputeEstimator'
import { AWS_REGIONS } from '@services/aws/AWSRegions'

describe('ComputeEstimator', () => {
  it('do', () => {
    const input = [
      {
        timestamp: new Date('2020-01-01'),
        cpuUtilizationAverage: 1.0,
        numberOfvCpus: 1.0,
        usesAverageCPUConstant: false,
      },
    ]

    const result = new ComputeEstimator().estimate(input, AWS_REGIONS.US_EAST_1, 'AWS')

    expect(result).toEqual([
      {
        co2e: 2.5031085614020794e-7,
        timestamp: new Date('2020-01-01T00:00:00.000Z'),
        wattHours: 0.7429199999999999,
        usesAverageCPUConstant: false,
      },
    ])
  })
})
