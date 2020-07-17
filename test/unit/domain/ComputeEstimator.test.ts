import ComputeEstimator from '../../../src/domain/ComputeEstimator'

describe('ComputeEstimator', () => {
  it('do', () => {
    const input = [
      {
        timestamp: new Date('2020-01-01'),
        cpuUtilizationAverage: 1.0,
        numberOfvCpus: 1.0,
      },
    ]

    const result = new ComputeEstimator().estimate(input)

    expect(result).toEqual([
      { co2e: 0.00044925321599999994, timestamp: new Date('2020-01-01T00:00:00.000Z'), wattHours: 0.6354 },
    ])
  })
})
