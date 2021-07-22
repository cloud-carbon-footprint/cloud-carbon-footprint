/*
 * © 2021 Thoughtworks, Inc.
 */

import { containsAny, endsWithAny, getHoursInMonth, wait } from '../helpers'

jest.useFakeTimers()
jest.mock('moment', () => {
  return () => jest.requireActual('moment')('2020-04-01T00:00:00.000Z')
})

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
    const waitTime = 1000

    const promise = wait(waitTime)
    jest.runAllTimers()
    await promise

    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), waitTime)
  })

  it('converts days in a month to hours in a month', () => {
    const expected = 720

    expect(getHoursInMonth()).toEqual(expected)
  })
})
