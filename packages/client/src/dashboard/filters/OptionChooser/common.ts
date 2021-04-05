/*
 * © 2021 Thoughtworks, Inc. All rights reserved.
 */

import { DropdownOption } from '../DropdownFilter'

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
