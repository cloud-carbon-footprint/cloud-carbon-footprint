/*
 * © 2021 Thoughtworks, Inc.
 */

import { KilowattHoursByServiceAndUsageUnit } from '../../FootprintEstimate'
import BillingDataRow from '../../BillingDataRow'

const serviceOne = 'serviceOne'
const serviceTwo = 'serviceTwo'
const usageUnitOne = 'unitOne'
const usageUnitTwo = 'unitTwo'
const kilowattHours = 20
const cost = 10

export const accumulateKilowattHoursPerCostData: [
  KilowattHoursByServiceAndUsageUnit, // co-efficients before accumulating
  BillingDataRow, // billing data to accumulate
  number, // kilowattHours to accumulate
  KilowattHoursByServiceAndUsageUnit, // expected co-efficients after accumulating
][] = [
  // new service and usage unit
  [
    {
      total: {},
    },
    {
      serviceName: serviceOne,
      usageUnit: usageUnitOne,
      cost: cost,
    } as BillingDataRow,
    kilowattHours,
    {
      [serviceOne]: {
        [usageUnitOne]: {
          cost: cost,
          kilowattHours: kilowattHours,
        },
      },
      total: {
        [usageUnitOne]: {
          cost: cost,
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
          cost: cost,
          kilowattHours: kilowattHours,
        },
      },
      total: {
        [usageUnitOne]: {
          cost: cost,
          kilowattHours: kilowattHours,
        },
      },
    },
    {
      serviceName: serviceOne,
      usageUnit: usageUnitOne,
      cost: cost,
    } as BillingDataRow,
    kilowattHours,
    {
      [serviceOne]: {
        [usageUnitOne]: {
          cost: cost * 2,
          kilowattHours: kilowattHours * 2,
        },
      },
      total: {
        [usageUnitOne]: {
          cost: cost * 2,
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
          cost: cost,
          kilowattHours: kilowattHours,
        },
      },
      total: {
        [usageUnitOne]: {
          cost: cost,
          kilowattHours: kilowattHours,
        },
      },
    },
    {
      serviceName: serviceTwo,
      usageUnit: usageUnitTwo,
      cost: cost,
    } as BillingDataRow,
    kilowattHours,
    {
      [serviceOne]: {
        [usageUnitOne]: {
          cost: cost,
          kilowattHours: kilowattHours,
        },
      },
      [serviceTwo]: {
        [usageUnitTwo]: {
          cost: cost,
          kilowattHours: kilowattHours,
        },
      },
      total: {
        [usageUnitOne]: {
          cost: cost,
          kilowattHours: kilowattHours,
        },
        [usageUnitTwo]: {
          cost: cost,
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
          cost: cost,
          kilowattHours: kilowattHours,
        },
      },
      total: {
        [usageUnitOne]: {
          cost: cost,
          kilowattHours: kilowattHours,
        },
      },
    },
    {
      serviceName: serviceTwo,
      usageUnit: usageUnitOne,
      cost: cost,
    } as BillingDataRow,
    kilowattHours,
    {
      [serviceOne]: {
        [usageUnitOne]: {
          cost: cost,
          kilowattHours: kilowattHours,
        },
      },
      [serviceTwo]: {
        [usageUnitOne]: {
          cost: cost,
          kilowattHours: kilowattHours,
        },
      },
      total: {
        [usageUnitOne]: {
          cost: cost * 2,
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
          cost: cost,
          kilowattHours: kilowattHours,
        },
      },
      total: {
        [usageUnitOne]: {
          cost: cost,
          kilowattHours: kilowattHours,
        },
      },
    },
    {
      serviceName: serviceOne,
      usageUnit: usageUnitTwo,
      cost: cost,
    } as BillingDataRow,
    kilowattHours,
    {
      [serviceOne]: {
        [usageUnitOne]: {
          cost: cost,
          kilowattHours: kilowattHours,
        },
        [usageUnitTwo]: {
          cost: cost,
          kilowattHours: kilowattHours,
        },
      },
      total: {
        [usageUnitOne]: {
          cost: cost,
          kilowattHours: kilowattHours,
        },
        [usageUnitTwo]: {
          cost: cost,
          kilowattHours: kilowattHours,
        },
      },
    },
  ],
]
