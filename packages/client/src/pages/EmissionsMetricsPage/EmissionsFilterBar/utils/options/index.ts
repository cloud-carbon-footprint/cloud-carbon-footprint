/*
 * © 2021 Thoughtworks, Inc.
 */

import { DropdownOption, FilterOptions, DropdownFilterOptions } from 'Types'
import { OptionChooser } from './OptionChooser'
import { DropdownSelections } from '../FiltersUtil'
import { CloudProviderChooser } from './CloudProviderChooser'
import { AccountChooser } from './AccountChooser'
import { ServiceChooser } from './ServiceChooser'

export default function createOptionChooser(
  filterType: DropdownFilterOptions,
  selections: DropdownOption[],
  oldSelections: DropdownSelections,
  filterOptions: FilterOptions,
): OptionChooser {
  switch (filterType) {
    case DropdownFilterOptions.CLOUD_PROVIDERS:
      return new CloudProviderChooser(selections, oldSelections, filterOptions)
    case DropdownFilterOptions.ACCOUNTS:
      return new AccountChooser(selections, oldSelections, filterOptions)
    case DropdownFilterOptions.SERVICES:
      return new ServiceChooser(selections, oldSelections, filterOptions)
  }
}
