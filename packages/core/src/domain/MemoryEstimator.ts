/*
 * © 2021 ThoughtWorks, Inc.
 */

import IFootprintEstimator from './IFootprintEstimator'
import FootprintEstimate from './FootprintEstimate'
import { estimateCo2 } from './FootprintEstimationConstants'
import MemoryUsage from './MemoryUsage'

export default class MemoryEstimator implements IFootprintEstimator {
  coefficient: number

  constructor(coefficient: number) {
    this.coefficient = coefficient
  }

  estimate(
    data: MemoryUsage[],
    region: string,
    cloudProvider: string,
  ): FootprintEstimate[] {
    return data.map((data: MemoryUsage) => {
      const estimatedKilowattHours = this.estimateKilowattHours(
        data.gigabyteHours,
        data.gigabytes,
        data.numberOfvCpus,
        cloudProvider,
      )
      const estimatedCO2Emissions = estimateCo2(
        estimatedKilowattHours,
        cloudProvider,
        region,
      )
      return {
        timestamp: data.timestamp,
        kilowattHours: estimatedKilowattHours,
        co2e: estimatedCO2Emissions,
      }
    })
  }
  private estimateKilowattHours(
    gigabyteHours: number,
    gigabytes: number,
    numberOfvCpus: number,
    cloudProvider: string,
  ) {
    // This function multiplies the usage amount in gigabyte hours by the memory coefficient
    // to get estimated kilowatt hours.
    switch (cloudProvider) {
      case 'GCP':
        return gigabyteHours * this.coefficient
      case 'AWS':
        return gigabytes * this.coefficient * numberOfvCpus
    }
  }
}
