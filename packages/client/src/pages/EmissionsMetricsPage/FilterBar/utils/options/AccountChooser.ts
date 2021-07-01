/*
 * © 2021 ThoughtWorks, Inc.
 */

import { pluck } from 'ramda'
import { DropdownOption } from 'Types'
import { DropdownFilter, DropdownSelections } from '../FiltersUtil'
import { SERVICE_OPTIONS } from '../../Filters/ServiceFilter/ServiceFilter'
import { ALL_KEY, CLOUD_PROVIDER_OPTIONS } from '../DropdownConstants'
import { OptionChooser } from './OptionChooser'
import { isDropdownOptionInDropdownOptions } from './common'

export class AccountChooser extends OptionChooser {
  constructor(
    selections: DropdownOption[],
    oldSelections: DropdownSelections,
    accountOptions: DropdownOption[],
  ) {
    super(
      DropdownFilter.ACCOUNTS,
      accountOptions,
      selections,
      oldSelections,
      accountOptions,
    )
  }

  protected chooseProviders(): Set<DropdownOption> {
    const desiredSelections: Set<DropdownOption> = new Set()
    getCloudProvidersFromAccounts(this.selections).forEach(
      (cloudProviderOption) => desiredSelections.add(cloudProviderOption),
    )
    return desiredSelections
  }

  protected chooseAccounts(): Set<DropdownOption> {
    return new Set(this.selections)
  }

  protected chooseServices(): Set<DropdownOption> {
    const desiredSelections: Set<DropdownOption> = new Set()
    const currentCloudProviders = Array.from(
      getCloudProvidersFromAccounts(this.selections),
    )
    currentCloudProviders.forEach((currentCloudProvider) => {
      if (!currentCloudProvider) return
      const cloudProviderKeys = pluck(
        'key',
        SERVICE_OPTIONS.filter(
          (service) => service.cloudProvider === currentCloudProvider.key,
        ),
      )
      //if current Cloudprovider has an option that oldCP has, keep the services from old that are under that CP
      if (
        isDropdownOptionInDropdownOptions(
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
              SERVICE_OPTIONS.find((option) => option.key === service)
            ),
          ),
        )
      }
    })
    return desiredSelections
  }
}

function getCloudProvidersFromAccounts(
  accountSelections: DropdownOption[],
): Set<DropdownOption> {
  const cloudProviderSelections: Set<DropdownOption> = new Set<DropdownOption>()
  accountSelections.forEach((selection) => {
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
