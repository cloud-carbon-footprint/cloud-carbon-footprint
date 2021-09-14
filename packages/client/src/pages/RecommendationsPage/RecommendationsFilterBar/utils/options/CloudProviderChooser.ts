/*
 * © 2021 Thoughtworks, Inc.
 */

import { DropdownFilterOptions, DropdownOption, FilterOptions } from 'Types'
import { DropdownSelections } from 'common/FilterBar/utils/FiltersUtil'
import {
  ALL_KEY,
  CLOUD_PROVIDER_OPTIONS,
} from 'common/FilterBar/utils/DropdownConstants'
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
      [DropdownFilterOptions.CLOUD_PROVIDERS]: () => this.chooseProviders(),
      [DropdownFilterOptions.ACCOUNTS]: () => this.chooseAccounts(),
    }
  }

  protected chooseProviders(): Set<DropdownOption> {
    return new Set(this.selections)
  }

  protected chooseAccounts(): Set<DropdownOption> {
    const desiredSelections: Set<DropdownOption> = new Set()
    this.selections.forEach((selection) => {
      if (selection.key !== ALL_KEY) {
        this.filterOptions.accounts.forEach((accountOption) => {
          accountOption.cloudProvider === selection.key &&
            desiredSelections.add(accountOption)
        })
      }
    })
    return desiredSelections
  }
}
