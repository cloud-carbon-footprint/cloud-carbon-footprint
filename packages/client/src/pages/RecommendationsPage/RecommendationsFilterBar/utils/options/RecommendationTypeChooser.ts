/*
 * © 2021 Thoughtworks, Inc.
 */

import { OptionChooser } from 'common/FilterBar/utils/OptionChooser'
import { DropdownFilterOptions, DropdownOption, FilterOptions } from 'Types'
import { DropdownSelections } from 'common/FilterBar/utils/FiltersUtil'

export class RecommendationTypeChooser extends OptionChooser {
  constructor(
    selections: DropdownOption[],
    oldSelections: DropdownSelections,
    filterOptions: FilterOptions,
  ) {
    super(
      DropdownFilterOptions.RECOMMENDATION_TYPES,
      filterOptions.recommendationTypes,
      selections,
      oldSelections,
      filterOptions,
    )

    this.choosers = {
      [DropdownFilterOptions.RECOMMENDATION_TYPES]: () =>
        this.chooseCurrentFilterOption(),
      [DropdownFilterOptions.CLOUD_PROVIDERS]: () => this.chooseProviders(),
      [DropdownFilterOptions.ACCOUNTS]: () =>
        this.chooseDropdownFilterOption(DropdownFilterOptions.ACCOUNTS),
      [DropdownFilterOptions.REGIONS]: () =>
        this.chooseDropdownFilterOption(DropdownFilterOptions.REGIONS),
    }
  }
}
