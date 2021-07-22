/*
 * © 2021 Thoughtworks, Inc.
 */

import ComputeEstimator from '../ComputeEstimator'
import CloudConstants from '../../CloudConstantsTypes'

describe('ComputeEstimator', () => {
  it('do estimates for AWS US East 1 region', () => {
    const input = [
      {
        timestamp: new Date('2020-01-01'),
        cpuUtilizationAverage: 1.0,
        numberOfvCpus: 1.0,
        usesAverageCPUConstant: false,
      },
    ]
    const awsUsEast1Region = 'us-east-1'
    const awsEmissionsFactors = {
      [awsUsEast1Region]: 0.000415755,
    }
    const awsConstants: CloudConstants = {
      powerUsageEffectiveness: 1.135,
      minWatts: 0.71,
      maxWatts: 3.46,
      replicationFactor: 2,
    }
    const result = new ComputeEstimator().estimate(
      input,
      awsUsEast1Region,
      awsEmissionsFactors,
      awsConstants,
    )

    expect(result).toEqual([
      {
        co2e: 6.960258393749999e-7,
        timestamp: new Date('2020-01-01T00:00:00.000Z'),
        kilowattHours: 0.0016741249999999998,
        usesAverageCPUConstant: false,
      },
    ])
  })

  it('do estimates for AWS South Africa with default replication factor', () => {
    const input = [
      {
        timestamp: new Date('2020-01-01'),
        cpuUtilizationAverage: 1.0,
        numberOfvCpus: 1.0,
        usesAverageCPUConstant: false,
      },
    ]
    const awsAfSouth1Region = 'af-south-1'
    const awsEmissionsFactors = {
      [awsAfSouth1Region]: 0.000928,
    }
    const awsConstants: CloudConstants = {
      powerUsageEffectiveness: 1.135,
      minWatts: 0.71,
      maxWatts: 3.46,
    }
    const result = new ComputeEstimator().estimate(
      input,
      awsAfSouth1Region,
      awsEmissionsFactors,
      awsConstants,
    )

    expect(result).toEqual([
      {
        co2e: 7.76794e-7,
        timestamp: new Date('2020-01-01T00:00:00.000Z'),
        kilowattHours: 0.0008370624999999999,
        usesAverageCPUConstant: false,
      },
    ])
  })
})
