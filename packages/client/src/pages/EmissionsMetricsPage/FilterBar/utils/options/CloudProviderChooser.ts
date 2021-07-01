/*
 * © 2021 ThoughtWorks, Inc.
 */

import { DropdownOption } from 'Types'
import { DropdownFilter, DropdownSelections } from '../FiltersUtil'
import { ALL_KEY, CLOUD_PROVIDER_OPTIONS } from '../DropdownConstants'
import { ACCOUNT_OPTIONS } from '../../Filters/AccountFilter/AccountFilter'
import { SERVICE_OPTIONS } from '../../Filters/ServiceFilter/ServiceFilter'
import { OptionChooser } from './OptionChooser'

export class CloudProviderChooser extends OptionChooser {
  constructor(selections: DropdownOption[], oldSelections: DropdownSelections) {
    super(
      DropdownFilter.CLOUD_PROVIDERS,
      CLOUD_PROVIDER_OPTIONS,
      selections,
      oldSelections,
    )
  }

  protected chooseProviders(): Set<DropdownOption> {
    return new Set(this.selections)
  }

  protected chooseAccounts(): Set<DropdownOption> {
    const desiredSelections: Set<DropdownOption> = new Set()
    this.selections.forEach((selection) => {
      if (selection.key !== ALL_KEY) {
        ACCOUNT_OPTIONS.forEach((accountOption) => {
          accountOption.cloudProvider === selection.key &&
            desiredSelections.add(accountOption)
        })
      }
    })
    return desiredSelections
  }

  protected chooseServices(): Set<DropdownOption> {
    const desiredSelections: Set<DropdownOption> = new Set()
    this.selections.forEach((selection) => {
      if (selection.key !== ALL_KEY) {
        SERVICE_OPTIONS.forEach((serviceOption) => {
          serviceOption.cloudProvider === selection.key &&
            desiredSelections.add(serviceOption)
        })
      }
    })
    return desiredSelections
  }
}
