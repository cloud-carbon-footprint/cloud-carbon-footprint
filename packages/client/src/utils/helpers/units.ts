import { Co2eUnit } from '../../Types'

export const co2eUnitMultiplier: Record<Co2eUnit, number> = {
  [Co2eUnit.Kilograms]: 1000,
  [Co2eUnit.MetricTonnes]: 1,
}

export const co2eUnitLabel: Record<Co2eUnit, string> = {
  [Co2eUnit.Kilograms]: 'Kilograms',
  [Co2eUnit.MetricTonnes]: 'Metric Tons',
}

export const co2eUnitAbbreviation: Record<Co2eUnit, string> = {
  [Co2eUnit.Kilograms]: 'kg',
  [Co2eUnit.MetricTonnes]: 't',
}
