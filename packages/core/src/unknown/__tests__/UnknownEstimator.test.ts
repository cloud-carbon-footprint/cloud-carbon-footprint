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
      co2ePerCost: {
        [EstimateClassification.COMPUTE]: {
          cost: 50,
          co2e: 0.000987654321,
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
        usageUnit: 'ConfigRuleEvaluations',
        reclassificationType: EstimateClassification.UNKNOWN,
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
    const result = new UnknownEstimator().estimate(
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
      co2ePerCost: {
        [EstimateClassification.STORAGE]: {
          cost: 50,
          co2e: 0.000987654321,
        },
        [EstimateClassification.MEMORY]: {
          cost: 75,
          co2e: 0.00987654321,
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
          co2e: 0.01975308642,
          timestamp: new Date('2021-01-01T00:00:00.000Z'),
          kilowattHours: 41.152263375,
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
          co2e: 0.13168724280000002,
          timestamp: new Date('2021-01-01T00:00:00.000Z'),
          kilowattHours: 274.3484225,
          usesAverageCPUConstant: false,
        },
      ])
    })
  })
})
