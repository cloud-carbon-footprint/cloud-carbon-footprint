/*
 * © 2021 Thoughtworks, Inc.
 */

import MemoryEstimator from '../MemoryEstimator'

describe('MemoryEstimator', () => {
  const memoryCoefficient = 0.000392
  it('does estimates for GCP US Central 1', () => {
    const input = [
      {
        timestamp: new Date('2021-01-01'),
        gigabyteHours: 90,
      },
    ]
    const gcpUsCentral1Region = 'us - central1'
    const gcpEmissionsFactors = {
      [gcpUsCentral1Region]: 0.000479,
    }
    const gcpConstants = {
      powerUsageEffectiveness: 1.11,
      replicationFactor: 2,
    }
    const result = new MemoryEstimator(memoryCoefficient).estimate(
      input,
      gcpUsCentral1Region,
      gcpEmissionsFactors,
      gcpConstants,
    )

    expect(result).toEqual([
      {
        co2e: 0.000037516046400000004,
        timestamp: new Date('2021-01-01T00:00:00.000Z'),
        kilowattHours: 0.0783216,
      },
    ])
  })

  it('does estimates for AWS US East 1 region', () => {
    const input = [
      {
        timestamp: new Date('2021-02-01'),
        gigabyteHours: 80,
      },
    ]
    const awsUsEast1Region = 'us-east-1'
    const awsEmissionsFactors = {
      [awsUsEast1Region]: 0.000415755,
    }
    const awsConstants = {
      powerUsageEffectiveness: 1.135,
    }
    const result = new MemoryEstimator(memoryCoefficient).estimate(
      input,
      awsUsEast1Region,
      awsEmissionsFactors,
      awsConstants,
    )

    expect(result).toEqual([
      {
        co2e: 0.000014798217168,
        timestamp: new Date('2021-02-01T00:00:00.000Z'),
        kilowattHours: 0.035593599999999996,
      },
    ])
  })
})
