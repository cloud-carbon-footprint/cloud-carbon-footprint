import { DropdownOption } from '../DropdownFilter'
import { FilterType, Selections } from '../FiltersUtil'
import { CLOUD_PROVIDER_OPTIONS, SERVICE_OPTIONS } from '../DropdownConstants'
import { ACCOUNT_OPTIONS } from '../AccountFilter'
import { OptionChooser } from './OptionChooser'
import { providerServices } from './common'

export class CloudProviderChooser extends OptionChooser {
  constructor(selections: DropdownOption[], oldSelections: Selections) {
    super(FilterType.CLOUD_PROVIDERS, CLOUD_PROVIDER_OPTIONS, selections, oldSelections)
  }

  protected chooseProviders(): Set<DropdownOption> {
    return new Set(this.selections)
  }

  protected chooseAccounts(): Set<DropdownOption> {
    const desiredSelections: Set<DropdownOption> = new Set()
    this.selections.forEach((selection) => {
      if (selection.key !== 'all') {
        ACCOUNT_OPTIONS.forEach((accountOption) => {
          accountOption.cloudProvider === selection.key ? desiredSelections.add(accountOption) : null
        })
      }
    })
    return desiredSelections
  }

  protected chooseServices(): Set<DropdownOption> {
    const desiredSelections: Set<DropdownOption> = new Set()
    this.selections.forEach((selection) => {
      if (selection.key !== 'all') {
        providerServices[selection.key].forEach((service) =>
          desiredSelections.add(<DropdownOption>SERVICE_OPTIONS.find((option) => option.key === service)),
        )
      }
    })
    return desiredSelections
  }
}
