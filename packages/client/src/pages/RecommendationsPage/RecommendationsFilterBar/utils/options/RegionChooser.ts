/*
 * © 2021 Thoughtworks, Inc.
 */

import { OptionChooser } from 'common/FilterBar/utils/OptionChooser'
import { DropdownFilterOptions, DropdownOption, FilterOptions } from 'Types'
import { DropdownSelections } from 'common/FilterBar/utils/FiltersUtil'
import {
  ALL_KEY,
  CLOUD_PROVIDER_OPTIONS,
} from '../../../../../common/FilterBar/utils/DropdownConstants'

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
      [DropdownFilterOptions.CLOUD_PROVIDERS]: () => this.chooseProviders(),
      [DropdownFilterOptions.ACCOUNTS]: () => this.chooseAccounts(),
      [DropdownFilterOptions.REGIONS]: () => this.chooseRegions(),
    }
  }

  protected chooseRegions(): Set<DropdownOption> {
    return new Set(this.selections)
  }

  protected chooseAccounts(): Set<DropdownOption> {
    const desiredSelections: Set<DropdownOption> = new Set()
    this.selections.forEach((selection) => {
      if (selection.key !== ALL_KEY) {
        this.filterOptions.accounts.forEach((accountOption) => {
          accountOption.cloudProvider === selection.cloudProvider &&
            desiredSelections.add(accountOption)
        })
      }
    })
    return desiredSelections
  }

  protected chooseProviders(): Set<DropdownOption> {
    const desiredSelections: Set<DropdownOption> = new Set()
    getCloudProvidersFromRegions(this.selections).forEach(
      (cloudProviderOption) => desiredSelections.add(cloudProviderOption),
    )
    return desiredSelections
  }
}

function getCloudProvidersFromRegions(
  regionSelections: DropdownOption[],
): Set<DropdownOption> {
  const cloudProviderSelections: Set<DropdownOption> = new Set<DropdownOption>()
  regionSelections.forEach((selection) => {
    if (selection.key !== ALL_KEY) {
      cloudProviderSelections.add(
        <DropdownOption>(
          CLOUD_PROVIDER_OPTIONS.find(
            (option) => option.key === selection.cloudProvider,
          )
        ),
      )
    }
  })
  return cloudProviderSelections
}
