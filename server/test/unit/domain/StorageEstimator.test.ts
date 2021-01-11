/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { StorageEstimator } from '@domain/StorageEstimator'
import FootprintEstimate from '@domain/FootprintEstimate'
import { CLOUD_CONSTANTS } from '@domain/FootprintEstimationConstants'
import { AWS_REGIONS } from '@services/aws/AWSRegions'

describe('StorageEstimator', () => {
  const SSD_COEFFICIENT = 1.2
  const HDD_COEFFICIENT = 0.67

  describe('estimating a single SSD result', () => {
    const estimator: StorageEstimator = new StorageEstimator(
      SSD_COEFFICIENT,
      CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS,
    )

    const results: FootprintEstimate[] = estimator.estimate(
      [
        {
          sizeGb: 1.0,
          timestamp: new Date('1998-01-01'),
        },
      ],
      AWS_REGIONS.US_EAST_1,
      'AWS',
    )

    it('creates one estimate', () => {
      expect(results.length).toEqual(1)
    })

    it('uses the start date of the time period as the timestamp', () => {
      expect(results[0].timestamp).toEqual(new Date('1998-01-01T00:00:00Z'))
    })

    it('calculates the wattage of an SSD using its GB per month usage for the start date of the time period', () => {
      expect(results[0].wattHours).toEqual(0.03456)
    })

    it('calculates the co2 emissions based on the wattage and us wattage carbon for the start date of the time period', () => {
      expect(results[0].co2e).toEqual(0.00000011644245932544)
    })
  })

  describe('estimating a single HDD result', () => {
    const estimator: StorageEstimator = new StorageEstimator(
      HDD_COEFFICIENT,
      CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS,
    )

    const results: FootprintEstimate[] = estimator.estimate(
      [
        {
          sizeGb: 1.0,
          timestamp: new Date('1998-01-01'),
        },
      ],
      AWS_REGIONS.US_EAST_1,
      'AWS',
    )

    it('creates one estimate', () => {
      expect(results.length).toEqual(1)
    })

    it('uses the start date of the time period as the timestamp', () => {
      expect(results[0].timestamp).toEqual(new Date('1998-01-01T00:00:00Z'))
    })

    it('calculates the wattage of an SSD using its GB per month usage for the start date of the time period', () => {
      expect(results[0].wattHours).toEqual(0.019296)
    })

    it('calculates the co2 emissions based on the wattage and us wattage carbon for the start date of the time period', () => {
      expect(results[0].co2e).toEqual(0.000000065013706456704)
    })
  })

  describe('estimating multiple results', () => {
    it('provides one result for each SSD input', () => {
      const estimator: StorageEstimator = new StorageEstimator(
        SSD_COEFFICIENT,
        CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS,
      )

      const results = estimator.estimate(
        [
          {
            sizeGb: 1.0,
            timestamp: new Date('2008-01-01'),
          },
          {
            sizeGb: 2.0,
            timestamp: new Date('1998-01-01'),
          },
        ],
        AWS_REGIONS.US_EAST_1,
        'AWS',
      )

      expect(results).toEqual([
        {
          co2e: 0.00000011644245932544,
          timestamp: new Date('2008-01-01T00:00:00.000Z'),
          wattHours: 0.03456,
        },
        {
          co2e: 0.00000023288491865088,
          timestamp: new Date('1998-01-01T00:00:00.000Z'),
          wattHours: 0.06912,
        },
      ])
    })

    it('provides one result for each HDD input', () => {
      const estimator: StorageEstimator = new StorageEstimator(
        HDD_COEFFICIENT,
        CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS,
      )

      const results = estimator.estimate(
        [
          {
            sizeGb: 1.0,
            timestamp: new Date('2008-01-01'),
          },
          {
            sizeGb: 2.0,
            timestamp: new Date('1998-01-01'),
          },
        ],
        AWS_REGIONS.US_EAST_1,
        'AWS',
      )

      expect(results).toEqual([
        {
          co2e: 0.000000065013706456704,
          timestamp: new Date('2008-01-01T00:00:00.000Z'),
          wattHours: 0.019296,
        },
        {
          co2e: 0.000000130027412913408,
          timestamp: new Date('1998-01-01T00:00:00.000Z'),
          wattHours: 0.038592,
        },
      ])
    })
  })
})
