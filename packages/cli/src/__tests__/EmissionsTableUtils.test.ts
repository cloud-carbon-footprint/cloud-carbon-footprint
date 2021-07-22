/*
 * © 2021 Thoughtworks, Inc.
 */

import { initialTotals } from '../EmissionsTableUtils'

describe('emissions table utils', () => {
  it('generate initial totals from list of service objects', () => {
    const expectedInitials = {
      ebs: {
        kilowattHours: 0,
        co2e: 0,
        cost: 0,
      },
      s3: {
        kilowattHours: 0,
        co2e: 0,
        cost: 0,
      },
      ec2: {
        kilowattHours: 0,
        co2e: 0,
        cost: 0,
      },
      elasticache: {
        kilowattHours: 0,
        co2e: 0,
        cost: 0,
      },
      rds: {
        kilowattHours: 0,
        co2e: 0,
        cost: 0,
      },
      lambda: {
        kilowattHours: 0,
        co2e: 0,
        cost: 0,
      },
      computeEngine: {
        kilowattHours: 0,
        co2e: 0,
        cost: 0,
      },
      total: {
        kilowattHours: 0,
        co2e: 0,
        cost: 0,
      },
    }

    const serviceNames = Object.keys(expectedInitials).filter(
      (total) => total !== 'total',
    )
    expect(initialTotals(serviceNames)).toEqual(expectedInitials)
  })
})
