/*
 * © 2021 Thoughtworks, Inc.
 */

import { DropdownFilterOptions, DropdownOption, FilterOptions } from 'Types'
import { DropdownSelections } from 'common/FilterBar/utils/FiltersUtil'
import { CLOUD_PROVIDER_OPTIONS } from 'common/FilterBar/utils/DropdownConstants'
import { OptionChooser } from 'common/FilterBar/utils/OptionChooser'

export class CloudProviderChooser extends OptionChooser {
  constructor(
    selections: DropdownOption[],
    oldSelections: DropdownSelections,
    filterOptions: FilterOptions,
  ) {
    super(
      DropdownFilterOptions.CLOUD_PROVIDERS,
      CLOUD_PROVIDER_OPTIONS,
      selections,
      oldSelections,
      filterOptions,
    )

    this.choosers = {
      [DropdownFilterOptions.CLOUD_PROVIDERS]: () =>
        this.chooseCurrentFilterOption(),
      [DropdownFilterOptions.ACCOUNTS]: () =>
        this.chooseDropdownFilterOption(DropdownFilterOptions.ACCOUNTS),
      [DropdownFilterOptions.REGIONS]: () =>
        this.chooseDropdownFilterOption(DropdownFilterOptions.REGIONS),
      [DropdownFilterOptions.RECOMMENDATION_TYPES]: () =>
        this.chooseDropdownFilterOption(
          DropdownFilterOptions.RECOMMENDATION_TYPES,
        ),
    }
  }
}
