/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { OptionChooser } from './OptionChooser'
import { DropdownFilter, DropdownSelections } from '../FiltersUtil'
import { DropdownOption } from '../DropdownFilter'
import { CloudProviderChooser } from './CloudProviderChooser'
import { AccountChooser } from './AccountChooser'
import { ServiceChooser } from './ServiceChooser'

export default function createOptionChooser(
  filterType: DropdownFilter,
  selections: DropdownOption[],
  oldSelections: DropdownSelections,
): OptionChooser {
  switch (filterType) {
    case DropdownFilter.CLOUD_PROVIDERS:
      return new CloudProviderChooser(selections, oldSelections)
    case DropdownFilter.ACCOUNTS:
      return new AccountChooser(selections, oldSelections)
    case DropdownFilter.SERVICES:
      return new ServiceChooser(selections, oldSelections)
  }
}
