import { reduceBy } from 'ramda'

export default interface FootprintEstimate {
  timestamp: Date
  wattHours: number
  co2e: number
  usesAverageCPUConstant?: boolean
}

export const aggregateEstimatesByDay = (estimates: FootprintEstimate[]): { [date: string]: FootprintEstimate } => {
  const getDayOfEstimate = (estimate: { timestamp: Date }) => estimate.timestamp.toISOString().substr(0, 10)

  const accumulatingFn = (acc: FootprintEstimate, value: FootprintEstimate) => {
    acc.timestamp = acc.timestamp || new Date(getDayOfEstimate(value))
    acc.wattHours += value.wattHours
    acc.co2e += value.co2e
    if (value.usesAverageCPUConstant) {
      acc.usesAverageCPUConstant = acc.usesAverageCPUConstant || value.usesAverageCPUConstant
    }
    return acc
  }

  return reduceBy(
    accumulatingFn,
    { wattHours: 0, co2e: 0, timestamp: undefined, usesAverageCPUConstant: false },
    getDayOfEstimate,
    estimates,
  )
}
