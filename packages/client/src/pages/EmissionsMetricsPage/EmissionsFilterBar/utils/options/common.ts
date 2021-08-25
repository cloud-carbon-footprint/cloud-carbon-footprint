/*
 * © 2021 Thoughtworks, Inc.
 */

import { DropdownOption } from 'Types'

export function isDropdownOptionInDropdownOptions(
  comparingDropdownOptions: DropdownOption[],
  dropdownOption: DropdownOption,
): boolean {
  let isWithinComparingDropdownOption = false
  comparingDropdownOptions.forEach((comparingDropdownOption) => {
    if (comparingDropdownOption.key === dropdownOption.key) {
      isWithinComparingDropdownOption = true
    }
  })
  return isWithinComparingDropdownOption
}
