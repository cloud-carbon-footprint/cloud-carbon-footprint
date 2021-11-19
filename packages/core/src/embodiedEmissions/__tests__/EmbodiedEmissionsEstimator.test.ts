/*
 * © 2021 Thoughtworks, Inc.
 */

import EmbodiedEmissionsEstimator from '../EmbodiedEmissionsEstimator'

describe('EmbodiedEmissionsEstimator', () => {
  const serverExpectedLifespan = 35040
  it('does estimates for GCP US Central 1 region', () => {
    const input = [
      {
        usageTimePeriod: 24,
        instancevCpu: 1,
        largestInstancevCpu: 96,
        scopeThreeEmissions: 1.7957,
      },
    ]
    const gcpUsCentral1Region = 'us-central1'
    const gcpEmissionsFactors = {
      [gcpUsCentral1Region]: 0.000454,
    }
    const result = new EmbodiedEmissionsEstimator(
      serverExpectedLifespan,
    ).estimate(input, gcpUsCentral1Region, gcpEmissionsFactors)

    expect(result).toEqual([
      {
        co2e: 0.000012811786529680366,
        kilowattHours: 0.028219794118238693,
        timestamp: undefined,
      },
    ])
  })
})
