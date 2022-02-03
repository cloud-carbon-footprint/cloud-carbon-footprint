/*
 * © 2021 Thoughtworks, Inc.
 */

import { sum } from 'ramda'

import CloudConstants, {
  CloudConstantsEmissionsFactors,
} from '../CloudConstantsTypes'
import FootprintEstimate, {
  KilowattHoursPerCostLegacy,
  EstimateClassification,
  estimateCo2,
  KilowattHoursByServiceAndUsageUnit,
  KilowattHourTotals,
} from '../FootprintEstimate'
import IFootprintEstimator from '../IFootprintEstimator'
import UnknownUsage from './UnknownUsage'

export enum EstimateUnknownUsageBy {
  COST = 'cost',
  USAGE_AMOUNT = 'usageAmount',
}

export default class UnknownEstimator implements IFootprintEstimator {
  constructor(private estimateKilowattHoursBy: EstimateUnknownUsageBy) {}

  estimate(
    data: UnknownUsage[],
    region: string,
    emissionsFactors: CloudConstantsEmissionsFactors,
    constants: CloudConstants,
  ): FootprintEstimate[] {
    return data.map((data: UnknownUsage) => {
      const usesAverageCPUConstant =
        data.reclassificationType === EstimateClassification.COMPUTE
      let estimatedKilowattHours
      if (constants.kilowattHoursPerCostLegacy) {
        estimatedKilowattHours = this.estimateKilowattHoursLegacy(
          data.cost,
          constants.kilowattHoursPerCostLegacy,
          data.reclassificationType,
        )
      } else {
        estimatedKilowattHours = this.estimateKilowattHours(
          data,
          constants.kilowattHoursByServiceAndUsageUnit,
        )
      }

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
    unknownUsage: UnknownUsage,
    kilowattHoursByServiceAndUsageUnit: KilowattHoursByServiceAndUsageUnit,
  ): number {
    const serviceAndUsageUnit =
      kilowattHoursByServiceAndUsageUnit[unknownUsage.service] &&
      kilowattHoursByServiceAndUsageUnit[unknownUsage.service][
        unknownUsage.usageUnit
      ]

    if (serviceAndUsageUnit)
      return (
        (serviceAndUsageUnit.kilowattHours /
          serviceAndUsageUnit[this.estimateKilowattHoursBy]) *
        unknownUsage[this.estimateKilowattHoursBy]
      )

    const totalForUsageUnit =
      kilowattHoursByServiceAndUsageUnit.total[unknownUsage.usageUnit]

    if (totalForUsageUnit)
      return (
        (totalForUsageUnit.kilowattHours /
          totalForUsageUnit[this.estimateKilowattHoursBy]) *
        unknownUsage[this.estimateKilowattHoursBy]
      )
    const totalKiloWattHours = this.getTotalFor(
      'kilowattHours',
      kilowattHoursByServiceAndUsageUnit,
    )
    const totalCost = this.getTotalFor(
      this.estimateKilowattHoursBy,
      kilowattHoursByServiceAndUsageUnit,
    )

    return (
      (totalKiloWattHours / totalCost) *
      unknownUsage[this.estimateKilowattHoursBy]
    )
  }

  private estimateKilowattHoursLegacy(
    cost: number,
    kilowattHoursPerCost: KilowattHoursPerCostLegacy,
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

  private getTotalFor(
    type: keyof KilowattHourTotals,
    kilowattHoursPerCost: KilowattHoursByServiceAndUsageUnit,
  ) {
    return sum(
      Object.values(kilowattHoursPerCost.total).map(
        (costAndKilowattHourTotals) => costAndKilowattHourTotals[type],
      ),
    )
  }
}
