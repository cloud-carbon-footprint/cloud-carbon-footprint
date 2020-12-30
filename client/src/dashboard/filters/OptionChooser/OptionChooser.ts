import { FilterType, Selections } from '../FiltersUtil'
import { DropdownOption } from '../DropdownFilter'
import {
  ALL_ACCOUNTS_DROPDOWN_OPTION,
  ALL_CLOUD_PROVIDERS_DROPDOWN_OPTION,
  ALL_SERVICES_DROPDOWN_OPTION,
  CLOUD_PROVIDER_OPTIONS,
  SERVICE_OPTIONS,
} from '../DropdownConstants'
import { ACCOUNT_OPTIONS } from '../AccountFilter'

export abstract class OptionChooser {
  protected readonly filterType: FilterType
  protected readonly allOptions: DropdownOption[]
  protected selections: DropdownOption[]
  protected readonly oldSelections: Selections

  protected constructor(
    filterType: FilterType,
    allOptions: DropdownOption[],
    selections: DropdownOption[],
    oldSelections: Selections,
  ) {
    this.allOptions = allOptions
    this.filterType = filterType
    this.selections = selections
    this.oldSelections = oldSelections
  }

  protected abstract chooseProviders(): Set<DropdownOption>

  protected abstract chooseAccounts(): Set<DropdownOption>

  protected abstract chooseServices(): Set<DropdownOption>

  choose(): { providerKeys: DropdownOption[]; accountKeys: DropdownOption[]; serviceKeys: DropdownOption[] } {
    const ALL_KEY = 'all'
    const selectionKeys: string[] = this.selections.map((selection) => selection.key)
    const oldSelectionKeys: string[] = this.oldSelections[this.filterType].map((oldSelection) => oldSelection.key)

    const allOptionsAreSelected = selectionKeys.includes(ALL_KEY) || selectionKeys.length === this.allOptions.length - 1
    const allOptionsWereSelected = oldSelectionKeys.includes(ALL_KEY)
    if (allOptionsAreSelected && !allOptionsWereSelected) {
      this.selections = this.allOptions
    }

    if (!selectionKeys.includes(ALL_KEY) && allOptionsWereSelected) {
      return { providerKeys: [], serviceKeys: [], accountKeys: [] }
    } else {
      if (this.selections.length === this.allOptions.length - 1 && allOptionsWereSelected) {
        this.selections = this.selections.filter((k) => k.key !== ALL_KEY)
      }

      return {
        providerKeys: addAllDropDownOption(this.chooseProviders(), FilterType.CLOUD_PROVIDERS),
        serviceKeys: addAllDropDownOption(this.chooseServices(), FilterType.SERVICES),
        accountKeys: addAllDropDownOption(this.chooseAccounts(), FilterType.ACCOUNTS),
      }
    }
  }
}

function addAllDropDownOption(currentSelections: Set<DropdownOption>, filterType: FilterType): DropdownOption[] {
  const revisedSelections: DropdownOption[] = Array.from(currentSelections)
  if (filterType === FilterType.CLOUD_PROVIDERS && currentSelections.size === CLOUD_PROVIDER_OPTIONS.length - 1) {
    revisedSelections.unshift(ALL_CLOUD_PROVIDERS_DROPDOWN_OPTION)
  }
  if (filterType === FilterType.ACCOUNTS && currentSelections.size === ACCOUNT_OPTIONS.length - 1) {
    revisedSelections.unshift(ALL_ACCOUNTS_DROPDOWN_OPTION)
  }
  if (filterType === FilterType.SERVICES && currentSelections.size === SERVICE_OPTIONS.length - 1) {
    revisedSelections.unshift(ALL_SERVICES_DROPDOWN_OPTION)
  }
  return revisedSelections
}
