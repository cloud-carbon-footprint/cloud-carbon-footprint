/*
 * © 2021 ThoughtWorks, Inc.
 */

import { containsAny, endsWithAny } from '../helpers'

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
})
