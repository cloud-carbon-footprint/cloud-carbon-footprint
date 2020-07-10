import StorageEstimator from '../../../src/domain/StorageEstimator'
import FootprintEstimate from '../../../src/domain/FootprintEstimate'

describe('StorageEstimator', () => {
  describe('estimating a single result', () => {
    const estimator: StorageEstimator = new StorageEstimator([
      {
        sizeGb: 1.0,
        timestamp: new Date('1998-01-01'),
      },
    ])

    const results: FootprintEstimate[] = estimator.estimate()

    it('creates one estimate', () => {
      expect(results.length).toEqual(1)
    })

    it('uses the start date of the time period as the timestamp', () => {
      expect(results[0].timestamp).toEqual(new Date('1998-01-01T00:00:00Z'))
    })

    it('calculates the wattage of an SSD using its GB per month usage for the start date of the time period', () => {
      expect(results[0].wattage).toEqual(1.0944)
    })

    it('calculates the co2 emissions based on the wattage and a magic number for the start date of the time period', () => {
      expect(results[0].co2).toEqual(0.0007737845760000001)
    })
  })
})
