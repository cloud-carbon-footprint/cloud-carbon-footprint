/* eslint-disable @typescript-eslint/ban-ts-comment */
/*
 * © 2021 Thoughtworks, Inc.
 */

import CloudConstants, {
  CloudConstantsEmissionsFactors,
} from '../CloudConstantsTypes'
import FootprintEstimate, {
  estimateCo2,
  KilowattHoursByServiceAndUsageUnit,
} from '../FootprintEstimate'
import IFootprintEstimator from '../IFootprintEstimator'
import UnknownUsage from './UnknownUsage'

export enum EstimateUnknownUsageBy {
  COST = 'cost',
  USAGE_AMOUNT = 'usageAmount',
}
const kwHdefault = {
  service: {
    usageUnit: {
      cost: 50,
      kilowattHours: 20,
    },
  },
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
      const estimatedKilowattHours = this.estimateKilowattHours(
        data,
        constants.kilowattHoursByServiceAndUsageUnit || kwHdefault,
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
        usesAverageCPUConstant: false,
      } as FootprintEstimate
    })
  }

  private estimateKilowattHours(
    unknownUsage: UnknownUsage,
    kilowattHoursByServiceAndUsageUnit: KilowattHoursByServiceAndUsageUnit,
  ): number {
    const serviceAndUsageUnit =
      kilowattHoursByServiceAndUsageUnit[unknownUsage.service || 'service'] &&
      kilowattHoursByServiceAndUsageUnit[unknownUsage.service || 'service'][
        unknownUsage.usageUnit
      ]

    if (serviceAndUsageUnit)
      return (
        (serviceAndUsageUnit.kilowattHours /
          // @ts-ignore: Object is possibly 'undefined'.
          serviceAndUsageUnit![this.estimateKilowattHoursBy]) *
        // @ts-ignore: Object is possibly 'undefined'.
        unknownUsage![this.estimateKilowattHoursBy]
      )

    const totalForUsageUnit =
      kilowattHoursByServiceAndUsageUnit.total[unknownUsage.usageUnit]

    if (totalForUsageUnit)
      return (
        (totalForUsageUnit.kilowattHours /
          // @ts-ignore: Object is possibly 'undefined'.
          totalForUsageUnit![this.estimateKilowattHoursBy]) *
        // @ts-ignore: Object is possibly 'undefined'.
        unknownUsage[this.estimateKilowattHoursBy]
      )
    return 0
  }
}
