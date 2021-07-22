/*
 * © 2021 Thoughtworks, Inc.
 */

import { calculateGigabyteHours, getPhysicalChips } from '../helpers'

describe('helpers', () => {
  it('getPhysicalChips', () => {
    // when
    const result = getPhysicalChips(300)

    // then
    expect(result).toEqual(4)
  })

  it('calculateGigabyteHours gigabyteHours is undefined', () => {
    // when
    const result = calculateGigabyteHours(1, 1, 2, 0, 0)
    // then
    expect(result).toBeUndefined()
  })

  it('calculateGigabyteHours gigabyteHours is not undefined', () => {
    // when
    const result = calculateGigabyteHours(1, 10, 5, 20, 20)
    // then
    expect(result).toEqual(200)
  })
})
