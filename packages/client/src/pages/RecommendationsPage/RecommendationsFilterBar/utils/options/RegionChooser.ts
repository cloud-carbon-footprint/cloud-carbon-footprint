/*
 * © 2021 Thoughtworks, Inc.
 */

import { OptionChooser } from 'common/FilterBar/utils/OptionChooser'
import { DropdownFilterOptions, DropdownOption, FilterOptions } from 'Types'
import { DropdownSelections } from 'common/FilterBar/utils/FiltersUtil'

export class RegionChooser extends OptionChooser {
  constructor(
    selections: DropdownOption[],
    oldSelections: DropdownSelections,
    filterOptions: FilterOptions,
  ) {
    super(
      DropdownFilterOptions.REGIONS,
      filterOptions.regions,
      selections,
      oldSelections,
      filterOptions,
    )

    this.choosers = {
      [DropdownFilterOptions.REGIONS]: () => this.chooseCurrentFilterOption(),
      [DropdownFilterOptions.CLOUD_PROVIDERS]: () => this.chooseProviders(),
      [DropdownFilterOptions.ACCOUNTS]: () =>
        this.chooseDropdownFilterOption(DropdownFilterOptions.ACCOUNTS),
      [DropdownFilterOptions.RECOMMENDATION_TYPES]: () =>
        this.chooseDropdownFilterOption(
          DropdownFilterOptions.RECOMMENDATION_TYPES,
        ),
    }
  }
}
