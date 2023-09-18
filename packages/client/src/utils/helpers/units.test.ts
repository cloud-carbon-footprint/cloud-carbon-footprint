import { Co2eUnit } from 'src/Types'
import each from 'jest-each'
import {
  co2eUnitAbbreviation,
  co2eUnitLabel,
  co2eUnitMultiplier,
} from './units'

describe('co2eUnitMultiplier', () => {
  const units = Object.values(Co2eUnit)
  each(units).it('contains a multiplier for unit %p', (unit: Co2eUnit) => {
    const multiplier = co2eUnitMultiplier[unit]
    expect(multiplier).toBeDefined()
  })
})

describe('co2eUnitLabel', () => {
  const units = Object.values(Co2eUnit)
  each(units).it('contains a label for unit %p', (unit: Co2eUnit) => {
    const label = co2eUnitLabel[unit]
    expect(label).toBeDefined()
  })
})

describe('co2eUnitAbbreviation', () => {
  const units = Object.values(Co2eUnit)
  each(units).it('contains an abbreviation for unit %p', (unit: Co2eUnit) => {
    const abbreviation = co2eUnitAbbreviation[unit]
    expect(abbreviation).toBeDefined()
  })
})
