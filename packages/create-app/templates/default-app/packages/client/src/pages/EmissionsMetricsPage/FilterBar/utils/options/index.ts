/*
 * © 2021 ThoughtWorks, Inc.
 */

import { DropdownOption, FilterOptions } from 'Types'
import { OptionChooser } from './OptionChooser'
import { DropdownFilter, DropdownSelections } from '../FiltersUtil'
import { CloudProviderChooser } from './CloudProviderChooser'
import { AccountChooser } from './AccountChooser'
import { ServiceChooser } from './ServiceChooser'

export default function createOptionChooser(
  filterType: DropdownFilter,
  selections: DropdownOption[],
  oldSelections: DropdownSelections,
  filterOptions: FilterOptions,
): OptionChooser {
  switch (filterType) {
    case DropdownFilter.CLOUD_PROVIDERS:
      return new CloudProviderChooser(selections, oldSelections, filterOptions)
    case DropdownFilter.ACCOUNTS:
      return new AccountChooser(selections, oldSelections, filterOptions)
    case DropdownFilter.SERVICES:
      return new ServiceChooser(selections, oldSelections, filterOptions)
  }
}
