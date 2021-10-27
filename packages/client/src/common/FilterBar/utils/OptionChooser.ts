/*
 * © 2021 Thoughtworks, Inc.
 */

import { DropdownFilterOptions, DropdownOption, FilterOptions } from 'Types'
import { DropdownSelections, optionIsInDropdownOptions } from './FiltersUtil'
import {
  ALL_DROPDOWN_FILTER_OPTIONS,
  ALL_KEY,
  CLOUD_PROVIDER_OPTIONS,
} from './DropdownConstants'
import { pluck } from 'ramda'

export abstract class OptionChooser {
  protected choosers: {
    [option in DropdownFilterOptions]?: () => Set<DropdownOption>
  }

  protected constructor(
    protected readonly filterType: DropdownFilterOptions,
    protected readonly allOptions: DropdownOption[],
    protected selections: DropdownOption[],
    protected readonly oldSelections: DropdownSelections,
    protected readonly filterOptions: FilterOptions,
  ) {}

  choose(): DropdownSelections {
    const selectionKeys: string[] = this.selections.map(
      (selection) => selection.key,
    )
    const oldSelectionKeys: string[] = this.oldSelections[this.filterType].map(
      (oldSelection) => oldSelection.key,
    )

    const allOptionsAreSelected =
      selectionKeys.includes(ALL_KEY) ||
      selectionKeys.length === this.allOptions.length - 1
    const allOptionsWereSelected = oldSelectionKeys.includes(ALL_KEY)
    if (allOptionsAreSelected && !allOptionsWereSelected) {
      this.selections = this.allOptions
    }

    const selectionOptions: string[] = Object.keys(this.oldSelections)

    if (!selectionKeys.includes(ALL_KEY) && allOptionsWereSelected) {
      return Object.fromEntries(selectionOptions.map((option) => [option, []]))
    } else {
      if (
        this.selections.length === this.allOptions.length - 1 &&
        allOptionsWereSelected
      ) {
        this.selections = this.selections.filter((k) => k.key !== ALL_KEY)
      }

      return Object.fromEntries(
        selectionOptions.map((option) => [
          option,
          this.addAllDropDownOptions(
            this.choosers[option](),
            option as DropdownFilterOptions,
          ),
        ]),
      )
    }
  }

  chooseCurrentFilterOption(): Set<DropdownOption> {
    return new Set(this.selections)
  }

  chooseDropdownFilterOption(filterOption: string): Set<DropdownOption> {
    const desiredSelections: Set<DropdownOption> = new Set()

    console.log(this.selections)
    const currentCloudProviders = Array.from(
      this.getCloudProvidersFromSelections(this.selections),
    )
    console.log(currentCloudProviders)

    currentCloudProviders.forEach((currentCloudProvider) => {
      if (!currentCloudProvider) return
      const cloudProviderKeys = pluck(
        'key',
        this.filterOptions[filterOption].filter(
          (option) => option.cloudProvider === currentCloudProvider.key,
        ),
      )

      console.log(this.filterOptions)
      console.log(filterOption, this.filterOptions[filterOption])
      console.log(cloudProviderKeys)

      if (
        optionIsInDropdownOptions(
          this.oldSelections.cloudProviders,
          currentCloudProvider,
        )
      ) {
        this.oldSelections[filterOption].forEach((oldSelectionOption) => {
          const hasKey = cloudProviderKeys.includes(oldSelectionOption.key)
          hasKey && desiredSelections.add(oldSelectionOption)
        })
      } else {
        cloudProviderKeys.forEach((option) =>
          desiredSelections.add(
            <DropdownOption>(
              this.filterOptions[option].find(
                (option) => option.key === filterOption,
              )
            ),
          ),
        )
      }
    })

    // this.selections.forEach((selection) => {
    //   if (selection.key !== ALL_KEY) {
    //     this.filterOptions[filterOption].forEach((option) => {
    //       option.cloudProvider === (selection.cloudProvider || selection.key) &&
    //         desiredSelections.add(option)
    //     })
    //   }
    // })
    // if (filterOption === DropdownFilterOptions.ACCOUNTS)
    // console.log(desiredSelections)
    return desiredSelections
  }

  chooseProviders(): Set<DropdownOption> {
    const desiredSelections: Set<DropdownOption> = new Set()
    this.getCloudProvidersFromSelections(this.selections).forEach(
      (cloudProviderOption) => desiredSelections.add(cloudProviderOption),
    )
    return desiredSelections
  }

  getCloudProvidersFromSelections(
    selections: DropdownOption[],
  ): Set<DropdownOption> {
    const cloudProviderSelections: Set<DropdownOption> =
      new Set<DropdownOption>()
    selections.forEach((selection) => {
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

  private addAllDropDownOptions(
    currentSelections: Set<DropdownOption>,
    filterType: DropdownFilterOptions,
  ): DropdownOption[] {
    const revisedSelections: DropdownOption[] = Array.from(currentSelections)
    if (currentSelections.size === this.filterOptions[filterType].length - 1) {
      revisedSelections.unshift(ALL_DROPDOWN_FILTER_OPTIONS[filterType])
    }

    return revisedSelections
  }
}
