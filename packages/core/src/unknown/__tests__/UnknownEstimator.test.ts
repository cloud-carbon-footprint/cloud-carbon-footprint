/*
 * © 2021 Thoughtworks, Inc.
 */

import UnknownEstimator, { EstimateUnknownUsageBy } from '../UnknownEstimator'

describe('UnknownEstimator', () => {
  describe('Classification by service and usage unit', () => {
    it('does estimates for unknown usage type for AWS, based on cost', () => {
      const service = 'testService'
      const usageUnit = 'testUsageUnit'
      const input = [
        {
          timestamp: new Date('2021-01-01'),
          cost: 1000,
          usageUnit: usageUnit,
          service: service,
        },
      ]
      const awsUsEast1Region = 'us-east-1'
      const awsEmissionsFactors = {
        [awsUsEast1Region]: 0.000415755,
      }

      const awsConstants = {
        kilowattHoursByServiceAndUsageUnit: {
          [service]: {
            [usageUnit]: {
              cost: 50,
              kilowattHours: 20,
            },
          },
        },
      }
      const result = new UnknownEstimator(EstimateUnknownUsageBy.COST).estimate(
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
          usesAverageCPUConstant: false,
        },
      ])
    })
    it('does estimates for unknown usage type for AWS, based on cost, using totals for that usage unit', () => {
      const service = 'testService'
      const usageUnit = 'testUsageUnit'
      const input = [
        {
          timestamp: new Date('2021-01-01'),
          cost: 1000,
          usageUnit: usageUnit,
          service: service,
        },
      ]
      const awsUsEast1Region = 'us-east-1'
      const awsEmissionsFactors = {
        [awsUsEast1Region]: 0.000415755,
      }

      const awsConstants = {
        kilowattHoursByServiceAndUsageUnit: {
          total: {
            [usageUnit]: {
              cost: 50,
              kilowattHours: 22,
            },
          },
        },
      }
      const result = new UnknownEstimator(EstimateUnknownUsageBy.COST).estimate(
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
    it('does not estimate for unknown usage type for AWS, where usage unit is not in known usage', () => {
      const service = 'testService'
      const usageUnit = 'testUsageUnit'
      const input = [
        {
          timestamp: new Date('2021-01-01'),
          cost: 2000,
          usageUnit: usageUnit,
          service: service,
        },
      ]
      const awsUsEast1Region = 'us-east-1'
      const awsEmissionsFactors = {
        [awsUsEast1Region]: 0.000415755,
      }

      const awsConstants = {
        kilowattHoursByServiceAndUsageUnit: {
          total: {
            testUsageUnitTwo: {
              cost: 50,
              kilowattHours: 22,
            },
            testUsageUnitThree: {
              cost: 30,
              kilowattHours: 10,
            },
          },
        },
      }
      const result = new UnknownEstimator(EstimateUnknownUsageBy.COST).estimate(
        input,
        awsUsEast1Region,
        awsEmissionsFactors,
        awsConstants,
      )

      expect(result).toEqual([
        {
          co2e: 0,
          timestamp: new Date('2021-01-01T00:00:00.000Z'),
          kilowattHours: 0,
          usesAverageCPUConstant: false,
        },
      ])
    })
  })
})
