/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { pluck } from 'ramda'
import config from '../../../ConfigLoader'
import { DropdownOption } from '../DropdownFilter'

export const providerServices: { [key: string]: string[] } = {
  aws: pluck('key', config().AWS.CURRENT_SERVICES),
  gcp: pluck('key', config().GCP.CURRENT_SERVICES),
}

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
