/*
 * © 2021 Thoughtworks, Inc.
 */

import CloudConstants, {
  CloudConstantsEmissionsFactors,
} from '../CloudConstantsTypes'
import FootprintEstimate, {
  KilowattHoursPerCost,
  EstimateClassification,
  estimateCo2,
} from '../FootprintEstimate'
import IFootprintEstimator from '../IFootprintEstimator'
import UnknownUsage from './UnknownUsage'

export default class UnknownEstimator implements IFootprintEstimator {
  estimate(
    data: UnknownUsage[],
    region: string,
    emissionsFactors: CloudConstantsEmissionsFactors,
    constants: CloudConstants,
  ): FootprintEstimate[] {
    return data.map((data: UnknownUsage) => {
      const usesAverageCPUConstant =
        data.reclassificationType === EstimateClassification.COMPUTE

      const estimatedKilowattHours = this.estimateKilowattHours(
        data.cost,
        constants.kilowattHoursPerCost,
        data.reclassificationType,
      )

      const estimatedCo2eEmissions = estimateCo2(
        estimatedKilowattHours,
        region,
        emissionsFactors,
      )
      return {
        timestamp: data.timestamp,
        kilowattHours: estimatedKilowattHours,
        co2e: estimatedCo2eEmissions,
        usesAverageCPUConstant,
      }
    })
  }

  private estimateKilowattHours(
    cost: number,
    kilowattHoursPerCost: KilowattHoursPerCost,
    classification: string,
  ): number {
    // This creates a coefficient based on the kilowatt-hour per cost ratio of a given usage classification,
    // then multiplies the coefficient by the reclassified unknown usage cost to get estimated kilowatt-hours.
    // If the new classification is still unknown, the coefficient is the average from the totals.
    if (
      classification === EstimateClassification.UNKNOWN ||
      !kilowattHoursPerCost[classification].cost
    )
      return (
        (kilowattHoursPerCost.total.kilowattHours /
          kilowattHoursPerCost.total.cost) *
        cost
      )

    return (
      (kilowattHoursPerCost[classification].kilowattHours /
        kilowattHoursPerCost[classification].cost) *
      cost
    )
  }
}
