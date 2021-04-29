/*
 * © 2021 ThoughtWorks, Inc.
 */

import MemoryEstimator from '../MemoryEstimator'
import { GCP_REGIONS } from '../../services/gcp/GCPRegions'
import { CLOUD_CONSTANTS } from '../FootPrintEstimationConstants'

describe('MemoryEstimator', () => {
  it('does estimates for GCP US Central 1', () => {
    const input = [
      {
        timestamp: new Date('2021-01-01'),
        gigabyteHours: 41329608237.34059,
      },
    ]

    const result = new MemoryEstimator(
      CLOUD_CONSTANTS.GCP.MEMORY_COEFFICIENT,
    ).estimate(input, GCP_REGIONS.US_CENTRAL1, 'GCP')

    expect(result).toEqual([
      {
        co2e: 7760.377879508967,
        timestamp: new Date('2021-01-01T00:00:00.000Z'),
        kilowattHours: 16201206.429037511,
      },
    ])
  })
})
