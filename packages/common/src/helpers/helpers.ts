/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'

export const containsAny = (
  substrings: string[],
  stringToSearch: string,
): boolean => {
  return substrings.some((substring) =>
    new RegExp(`\\b${substring}\\b`).test(stringToSearch),
  )
}

export const endsWithAny = (suffixes: string[], string: string): boolean => {
  return suffixes.some((suffix) => string.endsWith(suffix))
}

export const wait = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export const getHoursInMonth = (): number => {
  return moment().utc().daysInMonth() * 24
}
