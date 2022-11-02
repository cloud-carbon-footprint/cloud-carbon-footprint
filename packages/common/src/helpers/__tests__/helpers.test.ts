/*
 * © 2021 Thoughtworks, Inc.
 */

import each from 'jest-each'
import { GroupBy } from '../../Config'
import {
  containsAny,
  endsWithAny,
  getHoursInMonth,
  wait,
  getPeriodEndDate,
} from '../helpers'

jest.useFakeTimers()

describe('Helpers', () => {
  it('contains any', () => {
    const substrings = ['test']
    const falseSubstrings = ['falseTest']
    const stringToSearch = 'test string'

    const resultOne = containsAny(substrings, stringToSearch)
    const resultTwo = containsAny(falseSubstrings, stringToSearch)

    expect(resultOne).toBe(true)
    expect(resultTwo).toBe(false)
  })
  it('ends with any', () => {
    const suffixes = ['Suffix']
    const falseSuffixes = ['false']
    const string = 'testSuffix'

    const resultOne = endsWithAny(suffixes, string)
    const resultTwo = endsWithAny(falseSuffixes, string)

    expect(resultOne).toBe(true)
    expect(resultTwo).toBe(false)
  })

  it('waits one second', async () => {
    jest.spyOn(global, 'setTimeout')
    const waitTime = 1000

    const promise = wait(waitTime)
    jest.runAllTimers()
    await promise

    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), waitTime)
    jest.clearAllTimers()
  })

  it('converts days in a month to hours in a month', () => {
    // Mock date for fixed test case
    Date.now = jest.fn(() =>
      new Date('2020-05-13T12:33:37.000Z').getMilliseconds(),
    )
    const expected = 744

    expect(getHoursInMonth()).toEqual(expected)
    jest.clearAllMocks()
  })

  describe('gets period end date for various grouping options', () => {
    each([
      [GroupBy.day, new Date('2020-04-01T23:59:59.000Z')],
      [GroupBy.week, new Date('2020-04-07T23:59:59.000Z')],
      [GroupBy.month, new Date('2020-04-30T23:59:59.000Z')],
      [GroupBy.quarter, new Date('2020-07-01T00:59:59.000Z')],
      [GroupBy.year, new Date('2021-03-31T23:59:59.000Z')],
    ]).it('should get period end date for %s', (grouping, expectedResult) => {
      const result = getPeriodEndDate(
        new Date('2020-04-01T00:00:00.000Z'),
        grouping,
      )

      expect(result).toEqual(expectedResult)
    })
  })
})
