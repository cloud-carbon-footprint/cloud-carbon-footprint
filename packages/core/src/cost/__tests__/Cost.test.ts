/*
 * © 2021 Thoughtworks, Inc.
 */

import Cost, { aggregateCostsByDay } from '../Cost'

describe('Cost', () => {
  const dayOne = new Date('2021-01-01')
  const dayTwo = new Date('2021-01-02')

  it('aggregateCostsByDay', () => {
    // given
    const testCosts: Cost[] = [
      {
        timestamp: dayOne,
        amount: 10,
        currency: 'USD',
      },
      {
        timestamp: dayOne,
        amount: 40,
        currency: 'USD',
      },
      {
        timestamp: dayTwo,
        amount: 100,
        currency: 'USD',
      },
      {
        timestamp: dayTwo,
        amount: 200,
        currency: 'USD',
      },
    ]

    // when
    const result = aggregateCostsByDay(testCosts)

    // then
    const expectedResult = {
      '2021-01-01': {
        amount: 50,
        currency: 'USD',
        timestamp: dayOne,
      },
      '2021-01-02': {
        amount: 300,
        currency: 'USD',
        timestamp: dayTwo,
      },
    }
    expect(result).toEqual(expectedResult)
  })
})
