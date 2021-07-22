/*
 * © 2021 Thoughtworks, Inc.
 */

import * as _ from 'lodash'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import { DateRange } from 'Types'

const formatDateToTime = (timestamp: string | Date) =>
  timestamp instanceof Date
    ? timestamp.getTime()
    : new Date(timestamp).getTime()

const sortByDate = (data: EstimationResult[]): EstimationResult[] => {
  return data.sort((a: EstimationResult, b: EstimationResult) => {
    return formatDateToTime(a.timestamp) - formatDateToTime(b.timestamp)
  })
}

const filterBy = (
  data: EstimationResult[],
  range: DateRange,
  defaultRange: DateRange,
): EstimationResult[] => {
  if (!range.min || !range.max) return data
  if (_.isEqual(range, defaultRange)) return data

  const min = formatDateToTime(range.min)
  const max = formatDateToTime(range.max)
  return data.filter((a: EstimationResult) => {
    const result = formatDateToTime(a.timestamp)
    return result >= min && result <= max
  })
}

export { sortByDate, filterBy }
