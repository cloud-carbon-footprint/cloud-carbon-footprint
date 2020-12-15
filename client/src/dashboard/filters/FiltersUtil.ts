/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { pluck } from 'ramda'

import config from '../../ConfigLoader'
import { ALL_SERVICES_DROPDOWN_OPTION, SERVICE_OPTIONS } from '../services'
import { ALL_CLOUD_PROVIDERS_DROPDOWN_OPTION, CLOUD_PROVIDER_OPTIONS } from '../cloudProviders'
import { DropdownOption } from './DropdownFilter'
import { ACCOUNT_OPTIONS } from './AccountFilter'
import { ALL_ACCOUNTS_DROPDOWN_OPTION, ALL_ACCOUNTS_KEY } from './DropdownConstants'

const providerServices: { [key: string]: string[] } = {
  aws: pluck('key', config().AWS.CURRENT_SERVICES),
  gcp: pluck('key', config().GCP.CURRENT_SERVICES),
}

export enum FilterType {
  SERVICES = 'services',
  CLOUD_PROVIDERS = 'cloud providers',
  ACCOUNTS = 'accounts',
}

export abstract class FiltersUtil {
  getDesiredKeysFromCurrentFilteredKeys(
    currentSelections: DropdownOption[],
    oldSelections: { services: DropdownOption[]; accounts: DropdownOption[]; cloudProviders: DropdownOption[] },
    currentFilterType: FilterType,
    desiredFilterType: FilterType,
  ): DropdownOption[] {
    const desiredSelections: Set<DropdownOption> = new Set()

    if (currentFilterType == FilterType.SERVICES) {
      if (desiredFilterType == FilterType.CLOUD_PROVIDERS) {
        this.getCloudProvidersFromServices(currentSelections).forEach((cloudProviderOption) =>
          desiredSelections.add(cloudProviderOption),
        )
      }
      if (desiredFilterType == FilterType.ACCOUNTS) {
        const currentCloudProviders = Array.from(this.getCloudProvidersFromServices(currentSelections))
        currentCloudProviders.forEach((currentCloudProvider) => {
          //if currentCloudprovider has an option that oldCP has, keep the accounts from old that are under that CP
          if (this.isDropdownOptionInDropdownOptions(oldSelections.cloudProviders, currentCloudProvider)) {
            oldSelections.accounts.forEach((oldAccountOption) => {
              oldAccountOption.cloudProvider === currentCloudProvider.key
                ? desiredSelections.add(oldAccountOption)
                : null
            })
          } else {
            //if currentCloudprovider doesnt have an option that oldCP has, add all the accounts from that CP
            ACCOUNT_OPTIONS.forEach((accountOption) => {
              accountOption.cloudProvider === currentCloudProvider.key ? desiredSelections.add(accountOption) : null
            })
          }
        })
      }
    }
    if (currentFilterType == FilterType.CLOUD_PROVIDERS) {
      currentSelections.forEach((selection) => {
        if (selection.key !== 'all') {
          if (desiredFilterType == FilterType.SERVICES) {
            providerServices[selection.key].forEach((service) =>
              desiredSelections.add(<DropdownOption>SERVICE_OPTIONS.find((option) => option.key === service)),
            )
          }
          if (desiredFilterType == FilterType.ACCOUNTS) {
            ACCOUNT_OPTIONS.forEach((accountOption) => {
              accountOption.cloudProvider === selection.key ? desiredSelections.add(accountOption) : null
            })
          }
        }
      })
    }

    if (currentFilterType === FilterType.ACCOUNTS) {
      if (desiredFilterType === FilterType.CLOUD_PROVIDERS) {
        this.getCloudProvidersFromAccounts(currentSelections).forEach((cloudProviderOption) =>
          desiredSelections.add(cloudProviderOption),
        )
      }
      if (desiredFilterType === FilterType.SERVICES) {
        const currentCloudProviders = Array.from(this.getCloudProvidersFromAccounts(currentSelections))
        currentCloudProviders.forEach((currentCloudProvider) => {
          //if currentCloudprovider has an option that oldCP has, keep the services from old that are under that CP
          if (this.isDropdownOptionInDropdownOptions(oldSelections.cloudProviders, currentCloudProvider)) {
            oldSelections.services.forEach((oldServiceOption) => {
              providerServices[currentCloudProvider.key].includes(oldServiceOption.key)
                ? desiredSelections.add(oldServiceOption)
                : null
            })
          } else {
            //if currentCloudprovider doesnt have an option that oldCP has, add all the services from that CP
            providerServices[currentCloudProvider.key].forEach((service) =>
              desiredSelections.add(<DropdownOption>SERVICE_OPTIONS.find((option) => option.key === service)),
            )
          }
        })
      }
    }
    return this.addAllDropDownOption(desiredSelections, desiredFilterType)
  }

  isDropdownOptionInDropdownOptions(
    comparingDropdownOptions: DropdownOption[],
    dropdownOption: DropdownOption,
  ): boolean {
    let isWithinComparingDropdownOption = false
    comparingDropdownOptions.forEach((comparingDropdownOption) => {
      if (comparingDropdownOption.key === dropdownOption.key) {
        isWithinComparingDropdownOption = true
      }
    })
    return isWithinComparingDropdownOption
  }

  getCloudProvidersFromAccounts(accountSelections: DropdownOption[]): Set<DropdownOption> {
    const cloudProviderSelections: Set<DropdownOption> = new Set<DropdownOption>()
    accountSelections.forEach((selection) => {
      if (selection.key !== 'all') {
        cloudProviderSelections.add(
          <DropdownOption>CLOUD_PROVIDER_OPTIONS.find((option) => option.key === selection.cloudProvider),
        )
      }
    })
    return cloudProviderSelections
  }

  getCloudProvidersFromServices(serviceSelections: DropdownOption[]): Set<DropdownOption> {
    const keys = serviceSelections.map((selection) => selection.key)
    const cloudProviderSelections: Set<DropdownOption> = new Set<DropdownOption>()
    for (const [key, value] of Object.entries(providerServices)) {
      if (value.some((service) => keys.includes(service))) {
        cloudProviderSelections.add(<DropdownOption>CLOUD_PROVIDER_OPTIONS.find((option) => option.key === key))
      }
    }
    return cloudProviderSelections
  }

  serviceTypesInAccountSelection(accountSelections: DropdownOption[]): DropdownOption[] {
    const providerTypes: Set<string> = new Set()
    const serviceOptions: DropdownOption[] = []
    accountSelections.forEach((accountSelection) => {
      if (accountSelection.key === ALL_ACCOUNTS_KEY) {
        return SERVICE_OPTIONS
      } else {
        providerTypes.add(<string>accountSelection.cloudProvider)
      }
    })
    providerTypes.forEach((providerType) => {
      providerServices[providerType].forEach((service) =>
        serviceOptions.push(<DropdownOption>SERVICE_OPTIONS.find((option) => option.key === service)),
      )
    })
    return serviceOptions
  }

  addAllDropDownOption(currentSelections: Set<DropdownOption>, filterType: FilterType): DropdownOption[] {
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

  handleSelections(
    selections: DropdownOption[],
    oldSelections: { services: DropdownOption[]; accounts: DropdownOption[]; cloudProviders: DropdownOption[] },
    options: DropdownOption[],
    filterType: FilterType,
  ): { providerKeys: DropdownOption[]; accountKeys: DropdownOption[]; serviceKeys: DropdownOption[] } {
    let serviceOptions: DropdownOption[]
    let providerOptions: DropdownOption[]
    let accountOptions: DropdownOption[]

    const ALL_KEY = 'all'
    const selectionKeys: string[] = selections.map((selection) => selection.key)
    const oldSelectionKeys: string[] = this.getSelectionKeysOfFilterType(oldSelections, filterType).map(
      (oldSelection) => oldSelection.key,
    )

    if (selections.length === options.length - 1 && !oldSelectionKeys.includes(ALL_KEY)) {
      selections = options
      selectionKeys.push(ALL_KEY)
    }

    if (selectionKeys.includes(ALL_KEY) && !oldSelectionKeys.includes(ALL_KEY)) {
      switch (filterType) {
        case FilterType.CLOUD_PROVIDERS:
          selections = CLOUD_PROVIDER_OPTIONS
          break
        case FilterType.ACCOUNTS:
          selections = ACCOUNT_OPTIONS
          break
        case FilterType.SERVICES:
          selections = SERVICE_OPTIONS
          break
      }
    }
    if (!selectionKeys.includes(ALL_KEY) && oldSelectionKeys.includes(ALL_KEY)) {
      serviceOptions = []
      providerOptions = []
      accountOptions = []
    } else {
      if (selections.length === options.length - 1 && oldSelectionKeys.includes(ALL_KEY)) {
        selections = selections.filter((k) => k.key !== ALL_KEY)
      }

      providerOptions =
        filterType == FilterType.CLOUD_PROVIDERS
          ? selections
          : this.getDesiredKeysFromCurrentFilteredKeys(
              selections,
              oldSelections,
              filterType,
              FilterType.CLOUD_PROVIDERS,
            )
      accountOptions =
        filterType == FilterType.ACCOUNTS
          ? selections
          : this.getDesiredKeysFromCurrentFilteredKeys(selections, oldSelections, filterType, FilterType.ACCOUNTS)
      serviceOptions =
        filterType == FilterType.SERVICES
          ? selections
          : this.getDesiredKeysFromCurrentFilteredKeys(selections, oldSelections, filterType, FilterType.SERVICES)
    }
    return { providerKeys: providerOptions, serviceKeys: serviceOptions, accountKeys: accountOptions }
  }

  getSelectionKeysOfFilterType(
    selections: { services: DropdownOption[]; accounts: DropdownOption[]; cloudProviders: DropdownOption[] },
    filterType: FilterType,
  ): DropdownOption[] {
    const newSelections: DropdownOption[] = []
    if (filterType === FilterType.CLOUD_PROVIDERS) {
      newSelections.push(...selections.cloudProviders)
    }
    if (filterType === FilterType.ACCOUNTS) {
      newSelections.push(...selections.accounts)
    }
    if (filterType === FilterType.SERVICES) {
      newSelections.push(...selections.services)
    }
    return newSelections
  }

  numSelectedLabel(length: number, totalLength: number, type = 'Services'): string {
    const lengthWithoutAllOption = totalLength - 1
    if (length === totalLength) {
      return `${type}: ${lengthWithoutAllOption} of ${lengthWithoutAllOption}`
    } else {
      return `${type}: ${length} of ${lengthWithoutAllOption}`
    }
  }
}
