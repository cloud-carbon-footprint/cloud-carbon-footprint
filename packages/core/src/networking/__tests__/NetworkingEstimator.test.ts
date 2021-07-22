/*
 * © 2021 Thoughtworks, Inc.
 */

import NetworkingEstimator from '../NetworkingEstimator'

describe('NetworkingEstimator', () => {
  const networkingCoefficient = 0.001
  it('does estimates for AWS US East 1 region', () => {
    const input = [
      {
        timestamp: new Date('2021-01-01'),
        gigabytes: 10000000,
      },
    ]
    const awsUsEast1Region = 'us-east-1'
    const awsEmissionsFactors = {
      [awsUsEast1Region]: 0.000415755,
    }
    const awsConstants = {
      powerUsageEffectiveness: 1.135,
    }
    const result = new NetworkingEstimator(networkingCoefficient).estimate(
      input,
      awsUsEast1Region,
      awsEmissionsFactors,
      awsConstants,
    )

    expect(result).toEqual([
      {
        co2e: 4.71881925,
        timestamp: new Date('2021-01-01T00:00:00.000Z'),
        kilowattHours: 11350,
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
    const gcpSouthAmericaEast1Region = 'southamerica-east1'
    const gcpEmissionsFactors = {
      [gcpSouthAmericaEast1Region]: 0.000109,
    }
    const gcpConstants = {
      powerUsageEffectiveness: 1.09,
    }
    const result = new NetworkingEstimator(networkingCoefficient).estimate(
      input,
      gcpSouthAmericaEast1Region,
      gcpEmissionsFactors,
      gcpConstants,
    )

    expect(result).toEqual([
      {
        co2e: 1.1881000000000002,
        timestamp: new Date('2021-01-01T00:00:00.000Z'),
        kilowattHours: 10900,
      },
    ])
  })
})
