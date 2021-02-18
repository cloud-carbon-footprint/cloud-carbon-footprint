/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

export interface Total {
  wattHours: number
  co2e: number
  cost: number
}

export type Totals = { [key: string]: Total }

export function initialTotals(serviceNames: string[]): Totals {
  const initialTotals: Totals = {}

  serviceNames.forEach((service) => {
    initialTotals[service] = { wattHours: 0, co2e: 0, cost: 0 }
  })

  initialTotals['total'] = { wattHours: 0, co2e: 0, cost: 0 }
  return initialTotals
}

export const displayServiceName = (key: string): string => {
  if (key === 'total') return 'Total'
  return key
}

export const displayWattHours = (wattHours: number) => wattHours.toFixed(2).toString()
export const displayCo2e = (co2e: number) => co2e.toFixed(6).toString()
export const displayCost = (cost: number) => `$${cost.toFixed(2).toString()}`
