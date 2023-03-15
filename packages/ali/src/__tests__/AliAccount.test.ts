/*
 * © 2023 Thoughtworks, Inc.
 */

import { GroupBy } from '@cloud-carbon-footprint/common'

import AliAccount from '../application/AliAccount'

describe('Ali Account', () => {
  const startDate: Date = new Date('2021-01-01')
  const endDate: Date = new Date('2021-01-01')
  const grouping: GroupBy = GroupBy.day

  it('gets results from getDataForRegions function', async () => {
    const aliAccount = new AliAccount()
    const results = await aliAccount.getDataForRegions(
      startDate,
      endDate,
      grouping,
    )

    expect(results).toEqual(null)
  })

  // it('gets results from getDataFromCostAndUsageReports function', async () => {
  //   const aliAccount = new AliAccount()
  //   const results = await aliAccount.getDataFromCostAndUsageReports(
  //     startDate,
  //     endDate,
  //     grouping,
  //   )
  //
  //   expect(results).toEqual([
  //     {
  //       groupBy: 'day',
  //       serviceEstimates: [],
  //       timestamp: '2021-01-01T00:00:00.000Z',
  //     },
  //   ])
  // })
})
