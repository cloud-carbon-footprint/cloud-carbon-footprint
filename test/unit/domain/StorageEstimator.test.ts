import { StorageEstimator } from '@domain/StorageEstimator'
import FootprintEstimate from '@domain/FootprintEstimate'

describe('StorageEstimator', () => {
  const SSD_COEFFICIENT = 1.52
  const US_WATTAGE_CARBON_RATIO = 0.70704
  describe('estimating a single result', () => {
    const estimator: StorageEstimator = new StorageEstimator(SSD_COEFFICIENT, US_WATTAGE_CARBON_RATIO)

    const results: FootprintEstimate[] = estimator.estimate([
      {
        sizeGb: 1.0,
        timestamp: new Date('1998-01-01'),
      },
    ])

    it('creates one estimate', () => {
      expect(results.length).toEqual(1)
    })

    it('uses the start date of the time period as the timestamp', () => {
      expect(results[0].timestamp).toEqual(new Date('1998-01-01T00:00:00Z'))
    })

    it('calculates the wattage of an SSD using its GB per month usage for the start date of the time period', () => {
      expect(results[0].wattHours).toEqual(1.0944)
    })

    it('calculates the co2 emissions based on the wattage and us wattage carbon for the start date of the time period', () => {
      expect(results[0].co2e).toEqual(0.0007737845760000001)
    })
  })

  describe('estimating multiple results', () => {
    it('provides one result for each input', () => {
      const estimator: StorageEstimator = new StorageEstimator(SSD_COEFFICIENT, US_WATTAGE_CARBON_RATIO)

      const results = estimator.estimate([
        {
          sizeGb: 1.0,
          timestamp: new Date('2008-01-01'),
        },
        {
          sizeGb: 2.0,
          timestamp: new Date('1998-01-01'),
        },
      ])

      expect(results).toEqual([
        {
          co2e: 0.0007737845760000001,
          timestamp: new Date('2008-01-01T00:00:00.000Z'),
          wattHours: 1.0944,
        },
        {
          co2e: 0.0015475691520000002,
          timestamp: new Date('1998-01-01T00:00:00.000Z'),
          wattHours: 2.1888,
        },
      ])
    })
  })
})
