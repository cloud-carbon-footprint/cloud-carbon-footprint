/*
 * © 2021 ThoughtWorks, Inc.
 */

import { DropdownOption } from '../../Filters/DropdownFilter'

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
