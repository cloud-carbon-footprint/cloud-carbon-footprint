/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  AccumulateKilowattHoursBy,
  KilowattHoursByServiceAndUsageUnit,
} from '../../FootprintEstimate'
import BillingDataRow from '../../BillingDataRow'

const serviceOne = 'serviceOne'
const serviceTwo = 'serviceTwo'
const usageUnitOne = 'unitOne'
const usageUnitTwo = 'unitTwo'
const kilowattHours = 20
const costOrUsageAmount = 10

const getAccumulateData = (
  accumulateBy: AccumulateKilowattHoursBy,
): [
  KilowattHoursByServiceAndUsageUnit, // co-efficients before accumulating
  Partial<BillingDataRow>, // billing data to accumulate
  number, // kilowattHours to accumulate
  KilowattHoursByServiceAndUsageUnit, // expected co-efficients after accumulating
][] => {
  return [
    // new service and usage unit
    [
      {
        total: {},
      },
      {
        serviceName: serviceOne,
        usageUnit: usageUnitOne,
        [accumulateBy]: costOrUsageAmount,
      },
      kilowattHours,
      {
        [serviceOne]: {
          [usageUnitOne]: {
            [accumulateBy]: costOrUsageAmount,
            kilowattHours: kilowattHours,
          },
        },
        total: {
          [usageUnitOne]: {
            [accumulateBy]: costOrUsageAmount,
            kilowattHours: kilowattHours,
          },
        },
      },
    ],
    // Same service and usage unit twice
    [
      {
        [serviceOne]: {
          [usageUnitOne]: {
            [accumulateBy]: costOrUsageAmount,
            kilowattHours: kilowattHours,
          },
        },
        total: {
          [usageUnitOne]: {
            [accumulateBy]: costOrUsageAmount,
            kilowattHours: kilowattHours,
          },
        },
      },
      {
        serviceName: serviceOne,
        usageUnit: usageUnitOne,
        [accumulateBy]: costOrUsageAmount,
      },
      kilowattHours,
      {
        [serviceOne]: {
          [usageUnitOne]: {
            [accumulateBy]: costOrUsageAmount * 2,
            kilowattHours: kilowattHours * 2,
          },
        },
        total: {
          [usageUnitOne]: {
            [accumulateBy]: costOrUsageAmount * 2,
            kilowattHours: kilowattHours * 2,
          },
        },
      },
    ],
    // New service and new usage unit
    [
      {
        [serviceOne]: {
          [usageUnitOne]: {
            [accumulateBy]: costOrUsageAmount,
            kilowattHours: kilowattHours,
          },
        },
        total: {
          [usageUnitOne]: {
            [accumulateBy]: costOrUsageAmount,
            kilowattHours: kilowattHours,
          },
        },
      },
      {
        serviceName: serviceTwo,
        usageUnit: usageUnitTwo,
        [accumulateBy]: costOrUsageAmount,
      },
      kilowattHours,
      {
        [serviceOne]: {
          [usageUnitOne]: {
            [accumulateBy]: costOrUsageAmount,
            kilowattHours: kilowattHours,
          },
        },
        [serviceTwo]: {
          [usageUnitTwo]: {
            [accumulateBy]: costOrUsageAmount,
            kilowattHours: kilowattHours,
          },
        },
        total: {
          [usageUnitOne]: {
            [accumulateBy]: costOrUsageAmount,
            kilowattHours: kilowattHours,
          },
          [usageUnitTwo]: {
            [accumulateBy]: costOrUsageAmount,
            kilowattHours: kilowattHours,
          },
        },
      },
    ],
    // New service but existing usage unit
    [
      {
        [serviceOne]: {
          [usageUnitOne]: {
            [accumulateBy]: costOrUsageAmount,
            kilowattHours: kilowattHours,
          },
        },
        total: {
          [usageUnitOne]: {
            [accumulateBy]: costOrUsageAmount,
            kilowattHours: kilowattHours,
          },
        },
      },
      {
        serviceName: serviceTwo,
        usageUnit: usageUnitOne,
        [accumulateBy]: costOrUsageAmount,
      },
      kilowattHours,
      {
        [serviceOne]: {
          [usageUnitOne]: {
            [accumulateBy]: costOrUsageAmount,
            kilowattHours: kilowattHours,
          },
        },
        [serviceTwo]: {
          [usageUnitOne]: {
            [accumulateBy]: costOrUsageAmount,
            kilowattHours: kilowattHours,
          },
        },
        total: {
          [usageUnitOne]: {
            [accumulateBy]: costOrUsageAmount * 2,
            kilowattHours: kilowattHours * 2,
          },
        },
      },
    ],
    // Existing service but new usage unit
    [
      {
        [serviceOne]: {
          [usageUnitOne]: {
            [accumulateBy]: costOrUsageAmount,
            kilowattHours: kilowattHours,
          },
        },
        total: {
          [usageUnitOne]: {
            [accumulateBy]: costOrUsageAmount,
            kilowattHours: kilowattHours,
          },
        },
      },
      {
        serviceName: serviceOne,
        usageUnit: usageUnitTwo,
        [accumulateBy]: costOrUsageAmount,
      },
      kilowattHours,
      {
        [serviceOne]: {
          [usageUnitOne]: {
            [accumulateBy]: costOrUsageAmount,
            kilowattHours: kilowattHours,
          },
          [usageUnitTwo]: {
            [accumulateBy]: costOrUsageAmount,
            kilowattHours: kilowattHours,
          },
        },
        total: {
          [usageUnitOne]: {
            [accumulateBy]: costOrUsageAmount,
            kilowattHours: kilowattHours,
          },
          [usageUnitTwo]: {
            [accumulateBy]: costOrUsageAmount,
            kilowattHours: kilowattHours,
          },
        },
      },
    ],
  ]
}

export const accumulateKilowattHoursPerCostData = getAccumulateData(
  AccumulateKilowattHoursBy.COST,
)
export const accumulateKilowattHoursPerUsageAmount = getAccumulateData(
  AccumulateKilowattHoursBy.USAGE_AMOUNT,
)
