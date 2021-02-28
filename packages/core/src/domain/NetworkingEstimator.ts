/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import IFootprintEstimator from '@domain/IFootprintEstimator'
import FootprintEstimate from '@domain/FootprintEstimate'
import { CLOUD_CONSTANTS, estimateCo2 } from '@domain/FootprintEstimationConstants'
import NetworkingUsage from '@domain/NetworkingUsage'

export default class NetworkingEstimator implements IFootprintEstimator {
  estimate(data: NetworkingUsage[], region: string, cloudProvider: string): FootprintEstimate[] {
    return data.map((data: NetworkingUsage) => {
      const estimatedKilowattHours = this.estimateKilowattHours(data.gigabytes, cloudProvider, region)
      const estimatedCO2Emissions = estimateCo2(estimatedKilowattHours, cloudProvider, region)
      return {
        timestamp: data.timestamp,
        kilowattHours: estimatedKilowattHours,
        co2e: estimatedCO2Emissions,
      }
    })
  }
  private estimateKilowattHours(gigaBytes: number, cloudProvider: string, region: string) {
    // This function multiplies the usage amount in gigabytes by the networking coefficient, then the cloud provider PUE,
    // to get estimated kilowatt hours.
    return (
      gigaBytes * CLOUD_CONSTANTS[cloudProvider].NETWORKING_COEFFICIENT * CLOUD_CONSTANTS[cloudProvider].getPUE(region)
    )
  }
}
