/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import { generateEstimations } from './generateEstimations'

describe('generateEstimations', () => {
  test('should generate data up to one month prior', () => {
    const today = moment.utc().hours(0).minutes(0).seconds(0).millisecond(0)
    const result = generateEstimations(today, 1)

    expect(result.length).toEqual(2)
    expect(result[0].timestamp).toStrictEqual(today.toDate())
    expect(result[1].timestamp).toStrictEqual(
      today.clone().subtract(1, 'M').toDate(),
    )
  })

  test('should generate 1 month of data', () => {
    const today = moment.utc().hours(0).minutes(0).seconds(0).millisecond(0)
    const result = generateEstimations(today, 30)

    expect(result.length).toEqual(31)
    expect(result[0].timestamp).toStrictEqual(today.toDate())
    expect(result[1].timestamp).toStrictEqual(
      today.clone().subtract(1, 'M').toDate(),
    )
    expect(result[2].timestamp).toStrictEqual(
      today.clone().subtract(2, 'M').toDate(),
    )
    expect(result[3].timestamp).toStrictEqual(
      today.clone().subtract(3, 'M').toDate(),
    )
  })

  test('should work with JS Date', () => {
    const today = moment.utc().hours(0).minutes(0).seconds(0).millisecond(0)
    const result = generateEstimations(new Date(), 3)

    expect(result.length).toEqual(4)
    expect(result[0].timestamp).toStrictEqual(today.toDate())
    expect(result[1].timestamp).toStrictEqual(
      today.clone().subtract(1, 'M').toDate(),
    )
    expect(result[2].timestamp).toStrictEqual(
      today.clone().subtract(2, 'M').toDate(),
    )
    expect(result[3].timestamp).toStrictEqual(
      today.clone().subtract(3, 'M').toDate(),
    )
  })
})
