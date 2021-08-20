/*
 * © 2021 Thoughtworks, Inc.
 */

import { UnknownEstimator } from '../.'
import { EstimateClassification } from '../../FootprintEstimate'

describe('UnknownEstimator', () => {
  const unknownUsageTypesList = {
    Hrs: 'compute',
  }

  it('does estimates for unknown usage type', () => {
    const input = [
      {
        timestamp: new Date('2021-01-01'),
        cost: 1000,
        usageUnit: 'Hrs',
      },
    ]
    const awsUsEast1Region = 'us-east-1'
    const awsEmissionsFactors = {
      [awsUsEast1Region]: 0.000415755,
    }
    const awsConstants = {
      co2ePerCost: {
        [EstimateClassification.COMPUTE]: {
          cost: 50,
          co2e: 0.000987654321,
        },
      },
    }
    const result = new UnknownEstimator(unknownUsageTypesList).estimate(
      input,
      awsUsEast1Region,
      awsEmissionsFactors,
      awsConstants,
    )

    expect(result).toEqual([
      {
        co2e: 0.01975308642,
        timestamp: new Date('2021-01-01T00:00:00.000Z'),
        kilowattHours: 47.511362268643786,
        usesAverageCPUConstant: true,
      },
    ])
  })
  it('does estimates for unknown usage types that stay classified as unknown', () => {
    const input = [
      {
        timestamp: new Date('2021-01-01'),
        cost: 1000,
        usageUnit: 'Dollar',
      },
    ]
    const awsUsEast1Region = 'us-east-1'
    const awsEmissionsFactors = {
      [awsUsEast1Region]: 0.000415755,
    }
    const awsConstants = {
      co2ePerCost: {
        total: {
          cost: 50,
          co2e: 0.000987654321,
        },
      },
    }
    const result = new UnknownEstimator(unknownUsageTypesList).estimate(
      input,
      awsUsEast1Region,
      awsEmissionsFactors,
      awsConstants,
    )

    expect(result).toEqual([
      {
        co2e: 0.01975308642,
        timestamp: new Date('2021-01-01T00:00:00.000Z'),
        kilowattHours: 47.511362268643786,
        usesAverageCPUConstant: false,
      },
    ])
  })
})
