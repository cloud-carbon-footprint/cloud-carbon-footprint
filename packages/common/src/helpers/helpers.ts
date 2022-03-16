/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import { GroupBy } from '../Config'

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

//01/01- 00 --01/01 -23-59-59

export const getPeriodEndDate = (startDate: Date, grouping: GroupBy): Date => {
  const periodGrouping: { [key: string]: Date } = {
    day: moment(startDate).add(1, 'd').subtract(1, 's').toDate(),
    week: moment(startDate).add(1, 'w').subtract(1, 's').toDate(),
    month: moment(startDate).add(1, 'M').subtract(1, 's').toDate(),
    quarter: moment(startDate)
      .add(1, 'Q')
      .add(1, 'h')
      .subtract(1, 's')
      .toDate(),
    year: moment(startDate).add(1, 'y').subtract(1, 's').toDate(),
  }

  return periodGrouping[grouping]
}
