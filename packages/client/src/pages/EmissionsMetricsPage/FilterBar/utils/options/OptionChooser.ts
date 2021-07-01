/*
 * © 2021 ThoughtWorks, Inc.
 */

import { DropdownFilter, DropdownSelections } from '../FiltersUtil'
import { DropdownOption } from 'Types'
import {
  ALL_ACCOUNTS_DROPDOWN_OPTION,
  ALL_CLOUD_PROVIDERS_DROPDOWN_OPTION,
  ALL_KEY,
  ALL_SERVICES_DROPDOWN_OPTION,
  CLOUD_PROVIDER_OPTIONS,
} from '../DropdownConstants'
import { SERVICE_OPTIONS } from '../../Filters/ServiceFilter'

export abstract class OptionChooser {
  protected readonly filterType: DropdownFilter
  protected readonly allOptions: DropdownOption[]
  protected selections: DropdownOption[]
  protected readonly oldSelections: DropdownSelections

  protected constructor(
    filterType: DropdownFilter,
    allOptions: DropdownOption[],
    selections: DropdownOption[],
    oldSelections: DropdownSelections,
  ) {
    this.allOptions = allOptions
    this.filterType = filterType
    this.selections = selections
    this.oldSelections = oldSelections
  }

  protected abstract chooseProviders(): Set<DropdownOption>

  protected abstract chooseAccounts(): Set<DropdownOption>

  protected abstract chooseServices(): Set<DropdownOption>

  choose(accountOptions: DropdownOption[]): DropdownSelections {
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
        [DropdownFilter.CLOUD_PROVIDERS]: [],
        [DropdownFilter.SERVICES]: [],
        [DropdownFilter.ACCOUNTS]: [],
      }
    } else {
      if (
        this.selections.length === this.allOptions.length - 1 &&
        allOptionsWereSelected
      ) {
        this.selections = this.selections.filter((k) => k.key !== ALL_KEY)
      }

      return {
        [DropdownFilter.CLOUD_PROVIDERS]: addAllDropDownOptions(
          this.chooseProviders(),
          DropdownFilter.CLOUD_PROVIDERS,
          accountOptions,
        ),
        [DropdownFilter.SERVICES]: addAllDropDownOptions(
          this.chooseServices(),
          DropdownFilter.SERVICES,
          accountOptions,
        ),
        [DropdownFilter.ACCOUNTS]: addAllDropDownOptions(
          this.chooseAccounts(),
          DropdownFilter.ACCOUNTS,
          accountOptions,
        ),
      }
    }
  }
}

function addAllDropDownOptions(
  currentSelections: Set<DropdownOption>,
  filterType: DropdownFilter,
  accountOptions: DropdownOption[],
): DropdownOption[] {
  const revisedSelections: DropdownOption[] = Array.from(currentSelections)
  if (
    filterType === DropdownFilter.CLOUD_PROVIDERS &&
    currentSelections.size === CLOUD_PROVIDER_OPTIONS.length - 1
  ) {
    revisedSelections.unshift(ALL_CLOUD_PROVIDERS_DROPDOWN_OPTION)
  }
  if (
    filterType === DropdownFilter.ACCOUNTS &&
    currentSelections.size === accountOptions.length - 1
  ) {
    revisedSelections.unshift(ALL_ACCOUNTS_DROPDOWN_OPTION)
  }
  if (
    filterType === DropdownFilter.SERVICES &&
    currentSelections.size === SERVICE_OPTIONS.length - 1
  ) {
    revisedSelections.unshift(ALL_SERVICES_DROPDOWN_OPTION)
  }
  return revisedSelections
}
