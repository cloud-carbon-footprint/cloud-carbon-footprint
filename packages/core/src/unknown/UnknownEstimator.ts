/*
 * © 2021 Thoughtworks, Inc.
 */

import { containsAny } from '@cloud-carbon-footprint/common'
import CloudConstants, {
  CloudConstantsEmissionsFactors,
} from '../CloudConstantsTypes'
import FootprintEstimate, {
  Co2ePerCost,
  estimateKwh,
  EstimateClassification,
} from '../FootprintEstimate'
import IFootprintEstimator from '../IFootprintEstimator'
import UnknownUsage from './UnknownUsage'

export default class UnknownEstimator implements IFootprintEstimator {
  constructor(private unknownUsageTypesMapping: { [key: string]: string[] }) {}

  estimate(
    data: UnknownUsage[],
    region: string,
    emissionsFactors: CloudConstantsEmissionsFactors,
    constants: CloudConstants,
  ): FootprintEstimate[] {
    return data.map((data: UnknownUsage) => {
      // consider adding a console error to add unknown usageUnit to map
      const classification = this.getClassification(data)
      const usesAverageCPUConstant =
        classification === EstimateClassification.COMPUTE
      const estimatedCO2Emissions = this.estimateCo2(
        data.cost,
        constants.co2ePerCost,
        classification,
      )
      const estimatedKilowattHours = estimateKwh(
        estimatedCO2Emissions,
        region,
        emissionsFactors,
      )
      return {
        timestamp: data.timestamp,
        kilowattHours: estimatedKilowattHours,
        co2e: estimatedCO2Emissions,
        usesAverageCPUConstant,
      }
    })
  }

  private getClassification(data: UnknownUsage) {
    if (
      this.unknownUsageTypesMapping[data.usageUnit]?.[1] ===
      EstimateClassification.MEMORY
    ) {
      if (containsAny(['Memory'], data.usageType)) {
        return EstimateClassification.MEMORY
      }
      return EstimateClassification.STORAGE
    }

    return this.unknownUsageTypesMapping[data.usageUnit]?.[0]
      ? this.unknownUsageTypesMapping[data.usageUnit][0]
      : EstimateClassification.UNKNOWN
  }

  private estimateCo2(
    cost: number,
    co2ePerCost: Co2ePerCost,
    classification: string,
  ): number {
    // This creates a coefficient based on the co2e per cost ratio of a given usage classification,
    // then multiplies the coefficient by the reclassified unknown usage cost to get estimated co2e.
    // If the new classification is still unknown, the coefficient is the average from the totals.
    if (
      classification === EstimateClassification.UNKNOWN ||
      !co2ePerCost[classification].cost
    )
      return (co2ePerCost.total.co2e / co2ePerCost.total.cost) * cost

    return (
      (co2ePerCost[classification].co2e / co2ePerCost[classification].cost) *
      cost
    )
  }
}
