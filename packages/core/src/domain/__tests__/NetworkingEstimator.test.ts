/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { AWS_REGIONS } from '../../services/aws/AWSRegions'
import NetworkingEstimator from '../NetworkingEstimator'
import { GCP_REGIONS } from '../../services/gcp/GCPRegions'

describe('NetworkingEstimator', () => {
  it('does estimates for AWS US East 1 region', () => {
    const input = [
      {
        timestamp: new Date('2021-01-01'),
        gigabytes: 10000000,
      },
    ]

    const result = new NetworkingEstimator().estimate(
      input,
      AWS_REGIONS.US_EAST_1,
      'AWS',
    )

    expect(result).toEqual([
      {
        co2e: 5.454,
        timestamp: new Date('2021-01-01T00:00:00.000Z'),
        kilowattHours: 12000,
      },
    ])
  })

  it('does estimates for GCP South America East 1', () => {
    const input = [
      {
        timestamp: new Date('2021-01-01'),
        gigabytes: 10000000,
      },
    ]

    const result = new NetworkingEstimator().estimate(
      input,
      GCP_REGIONS.SOUTHAMERICA_EAST1,
      'GCP',
    )

    expect(result).toEqual([
      {
        co2e: 0.8066,
        timestamp: new Date('2021-01-01T00:00:00.000Z'),
        kilowattHours: 10900,
      },
    ])
  })
})
