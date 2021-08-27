/*
 * © 2021 Thoughtworks, Inc.
 */

import { DropdownFilterOptions, DropdownOption, FilterOptions } from 'Types'
import { DropdownSelections } from '../FiltersUtil'
import {
  ALL_ACCOUNTS_DROPDOWN_OPTION,
  ALL_CLOUD_PROVIDERS_DROPDOWN_OPTION,
  ALL_KEY,
  ALL_SERVICES_DROPDOWN_OPTION,
  CLOUD_PROVIDER_OPTIONS,
} from '../DropdownConstants'

export abstract class OptionChooser {
  protected readonly filterType: DropdownFilterOptions
  protected readonly allOptions: DropdownOption[]
  protected selections: DropdownOption[]
  protected readonly oldSelections: DropdownSelections
  protected readonly filterOptions: FilterOptions

  protected constructor(
    filterType: DropdownFilterOptions,
    allOptions: DropdownOption[],
    selections: DropdownOption[],
    oldSelections: DropdownSelections,
    filterOptions: FilterOptions,
  ) {
    this.allOptions = allOptions
    this.filterType = filterType
    this.selections = selections
    this.oldSelections = oldSelections
    this.filterOptions = filterOptions
  }

  protected abstract chooseProviders(): Set<DropdownOption>

  protected abstract chooseAccounts(): Set<DropdownOption>

  protected abstract chooseServices(): Set<DropdownOption>

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

    if (!selectionKeys.includes(ALL_KEY) && allOptionsWereSelected) {
      return {
        [DropdownFilterOptions.CLOUD_PROVIDERS]: [],
        [DropdownFilterOptions.SERVICES]: [],
        [DropdownFilterOptions.ACCOUNTS]: [],
      }
    } else {
      if (
        this.selections.length === this.allOptions.length - 1 &&
        allOptionsWereSelected
      ) {
        this.selections = this.selections.filter((k) => k.key !== ALL_KEY)
      }

      return {
        [DropdownFilterOptions.CLOUD_PROVIDERS]: this.addAllDropDownOptions(
          this.chooseProviders(),
          DropdownFilterOptions.CLOUD_PROVIDERS,
        ),
        [DropdownFilterOptions.SERVICES]: this.addAllDropDownOptions(
          this.chooseServices(),
          DropdownFilterOptions.SERVICES,
        ),
        [DropdownFilterOptions.ACCOUNTS]: this.addAllDropDownOptions(
          this.chooseAccounts(),
          DropdownFilterOptions.ACCOUNTS,
        ),
      }
    }
  }

  private addAllDropDownOptions(
    currentSelections: Set<DropdownOption>,
    filterType: DropdownFilterOptions,
  ): DropdownOption[] {
    const revisedSelections: DropdownOption[] = Array.from(currentSelections)
    const { accounts, services } = this.filterOptions
    if (
      filterType === DropdownFilterOptions.CLOUD_PROVIDERS &&
      currentSelections.size === CLOUD_PROVIDER_OPTIONS.length - 1
    ) {
      revisedSelections.unshift(ALL_CLOUD_PROVIDERS_DROPDOWN_OPTION)
    }
    if (
      filterType === DropdownFilterOptions.ACCOUNTS &&
      currentSelections.size === accounts.length - 1
    ) {
      revisedSelections.unshift(ALL_ACCOUNTS_DROPDOWN_OPTION)
    }
    if (
      filterType === DropdownFilterOptions.SERVICES &&
      currentSelections.size === services.length - 1
    ) {
      revisedSelections.unshift(ALL_SERVICES_DROPDOWN_OPTION)
    }
    return revisedSelections
  }
}
