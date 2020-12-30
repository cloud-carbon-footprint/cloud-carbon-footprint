/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { DropdownOption } from '../DropdownFilter'
import { DropdownFilter, DropdownSelections } from '../FiltersUtil'
import { ALL_KEY, CLOUD_PROVIDER_OPTIONS, SERVICE_OPTIONS } from '../DropdownConstants'
import { ACCOUNT_OPTIONS } from '../AccountFilter'
import { OptionChooser } from './OptionChooser'
import { providerServices } from './common'

export class CloudProviderChooser extends OptionChooser {
  constructor(selections: DropdownOption[], oldSelections: DropdownSelections) {
    super(DropdownFilter.CLOUD_PROVIDERS, CLOUD_PROVIDER_OPTIONS, selections, oldSelections)
  }

  protected chooseProviders(): Set<DropdownOption> {
    return new Set(this.selections)
  }

  protected chooseAccounts(): Set<DropdownOption> {
    const desiredSelections: Set<DropdownOption> = new Set()
    this.selections.forEach((selection) => {
      if (selection.key !== ALL_KEY) {
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
      if (selection.key !== ALL_KEY) {
        providerServices[selection.key].forEach((service) =>
          desiredSelections.add(<DropdownOption>SERVICE_OPTIONS.find((option) => option.key === service)),
        )
      }
    })
    return desiredSelections
  }
}
