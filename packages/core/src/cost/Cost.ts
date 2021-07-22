/*
 * © 2021 Thoughtworks, Inc.
 */

import { reduceBy } from 'ramda'

export default interface Cost {
  timestamp: Date
  amount: number
  currency: string
}
export const aggregateCostsByDay = (
  estimates: Cost[],
): { [date: string]: Cost } => {
  const getDayOfEstimate = (estimate: { timestamp: Date }) =>
    estimate.timestamp.toISOString().substr(0, 10)
  const accumulatingFn = (acc: Cost, value: Cost) => {
    acc.timestamp = acc.timestamp || new Date(getDayOfEstimate(value))
    acc.amount += value.amount
    acc.currency = acc.currency || value.currency
    return acc
  }

  return reduceBy(
    accumulatingFn,
    { amount: 0, currency: undefined, timestamp: undefined },
    getDayOfEstimate,
    estimates,
  )
}
