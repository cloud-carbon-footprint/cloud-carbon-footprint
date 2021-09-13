/*
 * © 2021 Thoughtworks, Inc.
 */

import { OptionChooser } from 'common/FilterBar/utils/OptionChooser'
import { DropdownFilterOptions, DropdownOption, FilterOptions } from 'Types'
import { DropdownSelections } from 'common/FilterBar/utils/FiltersUtil'

export class AccountChooser extends OptionChooser {
  constructor(
    selections: DropdownOption[],
    oldSelections: DropdownSelections,
    filterOptions: FilterOptions,
  ) {
    super(
      DropdownFilterOptions.ACCOUNTS,
      filterOptions.accounts,
      selections,
      oldSelections,
      filterOptions,
    )

    this.choosers = {
      // [DropdownFilterOptions.CLOUD_PROVIDERS]: () => this.chooseProviders(),
      [DropdownFilterOptions.ACCOUNTS]: () => this.chooseAccounts(),
    }
  }

  protected chooseAccounts(): Set<DropdownOption> {
    return new Set(this.selections)
  }
}
