/*
 * © 2021 Thoughtworks, Inc.
 */

import { DropdownFilterOptions, DropdownOption } from '../../../Types'
import { OptionChooser } from './OptionChooser'

export type DropdownSelections = {
  [key in DropdownFilterOptions]?: DropdownOption[]
}

export function handleDropdownSelections(
  chooser: OptionChooser,
): DropdownSelections {
  return chooser.choose()
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

export function optionIsInDropdownOptions(
  comparingDropdownOptions: DropdownOption[],
  dropdownOption: DropdownOption,
): boolean {
  return comparingDropdownOptions.some(
    (comparingDropdownOption) =>
      comparingDropdownOption.key === dropdownOption.key,
  )
}
