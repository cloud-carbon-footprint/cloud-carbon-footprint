/*
 * © 2021 Thoughtworks, Inc.
 */

import UnknownEstimator from '../UnknownEstimator'
import { EstimateClassification } from '../../FootprintEstimate'

describe('UnknownEstimator', () => {
  it('does estimates for unknown usage type', () => {
    const input = [
      {
        timestamp: new Date('2021-01-01'),
        cost: 1000,
        usageUnit: 'Hrs',
        reclassificationType: EstimateClassification.COMPUTE,
      },
    ]
    const awsUsEast1Region = 'us-east-1'
    const awsEmissionsFactors = {
      [awsUsEast1Region]: 0.000415755,
    }
    const awsConstants = {
      kilowattHoursPerCost: {
        [EstimateClassification.COMPUTE]: {
          cost: 50,
          kilowattHours: 20,
        },
      },
    }
    const result = new UnknownEstimator().estimate(
      input,
      awsUsEast1Region,
      awsEmissionsFactors,
      awsConstants,
    )

    expect(result).toEqual([
      {
        co2e: 0.166302,
        timestamp: new Date('2021-01-01T00:00:00.000Z'),
        kilowattHours: 400,
        usesAverageCPUConstant: true,
      },
    ])
  })

  it('does estimates for unknown usage types that stay classified as unknown', () => {
    const input = [
      {
        timestamp: new Date('2021-01-01'),
        cost: 1000,
        usageUnit: 'ConfigRuleEvaluations',
        reclassificationType: EstimateClassification.UNKNOWN,
      },
    ]
    const awsUsEast1Region = 'us-east-1'
    const awsEmissionsFactors = {
      [awsUsEast1Region]: 0.000415755,
    }
    const awsConstants = {
      kilowattHoursPerCost: {
        total: {
          cost: 50,
          kilowattHours: 22,
        },
      },
    }
    const result = new UnknownEstimator().estimate(
      input,
      awsUsEast1Region,
      awsEmissionsFactors,
      awsConstants,
    )

    expect(result).toEqual([
      {
        co2e: 0.18293220000000002,
        timestamp: new Date('2021-01-01T00:00:00.000Z'),
        kilowattHours: 440,
        usesAverageCPUConstant: false,
      },
    ])
  })

  describe('gets the correct usage type classification', () => {
    const input = [
      {
        timestamp: new Date('2021-01-01'),
        cost: 1000,
        usageUnit: 'byte-seconds',
        usageType: 'Storage',
        reclassificationType: EstimateClassification.STORAGE,
      },
    ]
    const gcpUsEast1Region = 'us-east1'
    const gcpEmissionsFactors = {
      [gcpUsEast1Region]: 0.00048,
    }
    const gcpConstants = {
      kilowattHoursPerCost: {
        [EstimateClassification.STORAGE]: {
          cost: 50,
          kilowattHours: 20,
        },
        [EstimateClassification.MEMORY]: {
          cost: 75,
          kilowattHours: 20,
        },
      },
    }
    it('for storage', () => {
      const result = new UnknownEstimator().estimate(
        input,
        gcpUsEast1Region,
        gcpEmissionsFactors,
        gcpConstants,
      )

      expect(result).toEqual([
        {
          co2e: 0.192,
          timestamp: new Date('2021-01-01T00:00:00.000Z'),
          kilowattHours: 400,
          usesAverageCPUConstant: false,
        },
      ])
    })

    it('for memory', () => {
      const newInput = [
        {
          ...input[0],
          usageType: 'Memory',
          reclassificationType: EstimateClassification.MEMORY,
        },
      ]

      const result = new UnknownEstimator().estimate(
        newInput,
        gcpUsEast1Region,
        gcpEmissionsFactors,
        gcpConstants,
      )

      expect(result).toEqual([
        {
          co2e: 0.128,
          timestamp: new Date('2021-01-01T00:00:00.000Z'),
          kilowattHours: 266.6666666666667,
          usesAverageCPUConstant: false,
        },
      ])
    })
  })
})
