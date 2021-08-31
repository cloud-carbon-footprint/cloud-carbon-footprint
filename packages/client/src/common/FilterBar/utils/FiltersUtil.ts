/*
 * © 2021 Thoughtworks, Inc.
 */

import { DropdownFilterOptions, DropdownOption, FilterOptions } from 'Types'
import createOptionChooser from './options'

export type DropdownSelections = {
  [key in DropdownFilterOptions]?: DropdownOption[]
}

export function handleDropdownSelections(
  filterType: DropdownFilterOptions,
  selections: DropdownOption[],
  oldSelections: DropdownSelections,
  filterOptions: FilterOptions,
): DropdownSelections {
  return createOptionChooser(
    filterType,
    selections,
    oldSelections,
    filterOptions,
  ).choose()
}

export function numSelectedLabel(
  length: number,
  totalLength: number,
  type: string,
): string {
  const lengthWithoutAllOption = totalLength - 1
  if (length === totalLength) {
    return `${type}: ${lengthWithoutAllOption} of ${lengthWithoutAllOption}`
  } else {
    return `${type}: ${length} of ${lengthWithoutAllOption}`
  }
}
