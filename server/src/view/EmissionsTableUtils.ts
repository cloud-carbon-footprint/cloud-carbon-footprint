import config from '@application/Config'
import { find, propEq, propOr, prop } from 'ramda'

export interface Total {
  wattHours: number
  co2e: number
  cost: number
}

export type Totals = { [key: string]: Total }

export function initialTotals(): Totals {
  const initialTotals: Totals = {}

  config.AWS.CURRENT_SERVICES.forEach((service) => {
    const key: string = prop('key', service)
    const total: Total = { wattHours: 0, co2e: 0, cost: 0 }
    initialTotals[key] = total
  })

  initialTotals['total'] = { wattHours: 0, co2e: 0, cost: 0 }
  return initialTotals
}

export const displayServiceName = (key: string): string => {
  const service = find(propEq('key', key), config.AWS.CURRENT_SERVICES)

  if (key === 'total') return 'Total'

  if (!prop('key', service) || !prop('name', service)) {
    throw new Error('You entered an Invalid AWS Service Name.')
  }

  return propOr('', 'name', service)
}

export const displayWattHours = (wattHours: number) => wattHours.toFixed(2).toString()
export const displayCo2e = (co2e: number) => co2e.toFixed(6).toString()
export const displayCost = (cost: number) => `$${cost.toFixed(2).toString()}`
