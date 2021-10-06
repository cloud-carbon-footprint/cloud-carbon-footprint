/*
 * © 2021 Thoughtworks, Inc.
 */

import { pluck } from 'ramda'
import { DropdownFilterOptions, DropdownOption, FilterOptions } from 'Types'
import { DropdownSelections } from 'common/FilterBar/utils/FiltersUtil'

import { OptionChooser } from 'common/FilterBar/utils/OptionChooser'
import { optionIsInDropdownOptions } from 'common/FilterBar/utils/FiltersUtil'

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
      [DropdownFilterOptions.CLOUD_PROVIDERS]: () => this.chooseProviders(),
      [DropdownFilterOptions.ACCOUNTS]: () => this.chooseCurrentFilterOption(),
      [DropdownFilterOptions.SERVICES]: () => this.chooseServices(),
    }
  }

  protected chooseServices(): Set<DropdownOption> {
    const desiredSelections: Set<DropdownOption> = new Set()
    const currentCloudProviders = Array.from(
      this.getCloudProvidersFromSelections(this.selections),
    )
    currentCloudProviders.forEach((currentCloudProvider) => {
      if (!currentCloudProvider) return
      const cloudProviderKeys = pluck(
        'key',
        this.filterOptions.services.filter(
          (service) => service.cloudProvider === currentCloudProvider.key,
        ),
      )
      //if current Cloudprovider has an option that oldCP has, keep the services from old that are under that CP
      if (
        optionIsInDropdownOptions(
          this.oldSelections.cloudProviders,
          currentCloudProvider,
        )
      ) {
        this.oldSelections.services.forEach((oldServiceOption) => {
          const hasKey = cloudProviderKeys.includes(oldServiceOption.key)
          hasKey && desiredSelections.add(oldServiceOption)
        })
      } else {
        //if current Cloudprovider doesnt have an option that oldCP has, add all the services from that CP
        cloudProviderKeys.forEach((service) =>
          desiredSelections.add(
            <DropdownOption>(
              this.filterOptions.services.find(
                (option) => option.key === service,
              )
            ),
          ),
        )
      }
    })
    return desiredSelections
  }
}
