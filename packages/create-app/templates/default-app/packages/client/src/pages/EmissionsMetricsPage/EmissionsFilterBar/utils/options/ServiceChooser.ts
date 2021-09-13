/*
 * © 2021 Thoughtworks, Inc.
 */

import { DropdownFilterOptions, DropdownOption, FilterOptions } from 'Types'
import { DropdownSelections } from 'common/FilterBar/utils/FiltersUtil'
import { CLOUD_PROVIDER_OPTIONS } from 'common/FilterBar/utils/DropdownConstants'
import { OptionChooser } from 'common/FilterBar/utils/OptionChooser'
import { optionIsInDropdownOptions } from 'common/FilterBar/utils/FiltersUtil'

export class ServiceChooser extends OptionChooser {
  constructor(
    selections: DropdownOption[],
    oldSelections: DropdownSelections,
    filterOptions: FilterOptions,
  ) {
    super(
      DropdownFilterOptions.SERVICES,
      filterOptions.services,
      selections,
      oldSelections,
      filterOptions,
    )

    this.choosers = {
      [DropdownFilterOptions.CLOUD_PROVIDERS]: () => this.chooseProviders(),
      [DropdownFilterOptions.ACCOUNTS]: () => this.chooseAccounts(),
      [DropdownFilterOptions.SERVICES]: () => this.chooseServices(),
    }
  }

  protected chooseProviders(): Set<DropdownOption> {
    const desiredSelections: Set<DropdownOption> = new Set()
    this.getCloudProvidersFromServices(this.selections).forEach(
      (cloudProviderOption) => desiredSelections.add(cloudProviderOption),
    )
    return desiredSelections
  }

  protected chooseAccounts(): Set<DropdownOption> {
    const desiredSelections: Set<DropdownOption> = new Set()
    const currentCloudProviders = Array.from(
      this.getCloudProvidersFromServices(this.selections),
    )
    currentCloudProviders.forEach((currentCloudProvider) => {
      //if current Cloud provider has an option that oldCP has, keep the accounts from old that are under that CP
      if (
        optionIsInDropdownOptions(
          this.oldSelections.cloudProviders,
          currentCloudProvider,
        )
      ) {
        this.oldSelections.accounts.forEach((oldAccountOption) => {
          oldAccountOption.cloudProvider === currentCloudProvider.key &&
            desiredSelections.add(oldAccountOption)
        })
      } else {
        //if current Cloud provider doesnt have an option that oldCP has, add all the accounts from that CP
        this.filterOptions.accounts.forEach((accountOption) => {
          accountOption.cloudProvider === currentCloudProvider.key &&
            desiredSelections.add(accountOption)
        })
      }
    })
    return desiredSelections
  }

  protected getCloudProvidersFromServices(
    serviceSelections: DropdownOption[],
  ): Set<DropdownOption> {
    const keys = serviceSelections.map((selection) => selection.key)
    const cloudProviderSelections: Set<DropdownOption> =
      new Set<DropdownOption>()

    for (const service of this.filterOptions.services.filter(
      (service) => service.key !== 'all',
    )) {
      if (keys.includes(service.key)) {
        cloudProviderSelections.add(
          <DropdownOption>(
            CLOUD_PROVIDER_OPTIONS.find(
              (option) => option.key === service.cloudProvider,
            )
          ),
        )
      }
    }
    return cloudProviderSelections
  }

  protected chooseServices(): Set<DropdownOption> {
    return new Set(this.selections)
  }
}
