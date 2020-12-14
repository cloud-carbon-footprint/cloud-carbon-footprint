/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { pluck } from 'ramda'

import config from '../../ConfigLoader'
import { ALL_SERVICES_DROPDOWN_OPTION, ALL_SERVICES_VALUE, SERVICE_OPTIONS } from '../services'
import {
  ALL_CLOUD_PROVIDERS_DROPDOWN_OPTION,
  ALL_CLOUD_PROVIDERS_KEY,
  ALL_CLOUD_PROVIDERS_VALUE,
  CLOUD_PROVIDER_OPTIONS,
} from '../cloudProviders'
import { DropdownOption } from './DropdownFilter'
import { ACCOUNT_OPTIONS } from './AccountFilter'
import { ALL_ACCOUNTS_DROPDOWN_OPTION } from './DropdownConstants'

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
    selections: DropdownOption[],
    allValue: string,
    currentFilterType: FilterType,
    desiredFilterType: FilterType,
  ): DropdownOption[] {
    const currentSelections: Set<DropdownOption> = new Set()
    const keys = selections.map((selection) => selection.key)

    if (currentFilterType == FilterType.SERVICES) {
      for (const [key, value] of Object.entries(providerServices)) {
        if (value.some((service) => keys.includes(service))) {
          if (desiredFilterType == FilterType.CLOUD_PROVIDERS) {
            currentSelections.add(<DropdownOption>CLOUD_PROVIDER_OPTIONS.find((option) => option.key === key))
          }
          if (desiredFilterType == FilterType.ACCOUNTS) {
            ACCOUNT_OPTIONS.forEach((accountOption) => {
              accountOption.cloudProvider === key ? currentSelections.add(accountOption) : null
            })
          }
        }
      }
    }
    if (currentFilterType == FilterType.CLOUD_PROVIDERS) {
      selections.forEach((selection) => {
        if (desiredFilterType == FilterType.SERVICES) {
          providerServices[selection.key].forEach((service) =>
            currentSelections.add(<DropdownOption>SERVICE_OPTIONS.find((option) => option.key === service)),
          )
        }
        if (desiredFilterType == FilterType.ACCOUNTS) {
          ACCOUNT_OPTIONS.forEach((accountOption) => {
            accountOption.cloudProvider === selection.key ? currentSelections.add(accountOption) : null
          })
        }
      })
    }

    if (currentFilterType === FilterType.ACCOUNTS) {
      selections.forEach((selection) => {
        if (desiredFilterType === FilterType.CLOUD_PROVIDERS && 'all' !== selection.key) {
          currentSelections.add(
            <DropdownOption>CLOUD_PROVIDER_OPTIONS.find((option) => option.key === selection.cloudProvider),
          )
        }
        if (desiredFilterType === FilterType.SERVICES) {
          this.serviceTypesInAccountSelection(selections).forEach((serviceOption) => {
            currentSelections.add(serviceOption)
          })
        }
      })
    }
    return this.addAllDropDownOption(currentSelections, desiredFilterType)
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

  serviceTypesInAccountSelection(selections: DropdownOption[]): DropdownOption[] {
    const providerTypes: Set<string> = new Set()
    const serviceOptions: DropdownOption[] = []
    selections.forEach((selection) => {
      if (selection.key === ALL_CLOUD_PROVIDERS_KEY) {
        return SERVICE_OPTIONS
      } else {
        providerTypes.add(<string>selection.cloudProvider)
      }
    })
    providerTypes.forEach((providerType) => {
      providerServices[providerType].forEach((service) =>
        serviceOptions.push(<DropdownOption>SERVICE_OPTIONS.find((option) => option.key === service)),
      )
    })
    return serviceOptions
  }

  handleSelections(
    selections: DropdownOption[],
    oldSelections: DropdownOption[],
    allValue: string,
    options: DropdownOption[],
    filterType: FilterType,
  ): { providerKeys: DropdownOption[]; accountKeys: DropdownOption[]; serviceKeys: DropdownOption[] } {
    let serviceOptions: DropdownOption[]
    let providerOptions: DropdownOption[]
    let accountOptions: DropdownOption[]

    const selectionKeys: string[] = selections.map((selection) => selection.key)
    const oldSelectionKeys: string[] = oldSelections.map((oldSelection) => oldSelection.key)

    if (selections.length === options.length - 1 && !oldSelectionKeys.includes(allValue)) {
      selections = options
      selectionKeys.push(allValue)
    }

    if (selectionKeys.includes(allValue) && !oldSelectionKeys.includes(allValue)) {
      serviceOptions = SERVICE_OPTIONS
      providerOptions = CLOUD_PROVIDER_OPTIONS
      accountOptions = ACCOUNT_OPTIONS
    } else if (!selectionKeys.includes(allValue) && oldSelectionKeys.includes(allValue)) {
      serviceOptions = []
      providerOptions = []
      accountOptions = []
    } else {
      if (selections.length === options.length - 1 && oldSelectionKeys.includes(allValue)) {
        selections = selections.filter((k) => k.key !== allValue)
      }

      serviceOptions =
        filterType == FilterType.SERVICES
          ? selections
          : this.getDesiredKeysFromCurrentFilteredKeys(selections, ALL_SERVICES_VALUE, filterType, FilterType.SERVICES)
      providerOptions =
        filterType == FilterType.CLOUD_PROVIDERS
          ? selections
          : this.getDesiredKeysFromCurrentFilteredKeys(
              selections,
              ALL_CLOUD_PROVIDERS_VALUE,
              filterType,
              FilterType.CLOUD_PROVIDERS,
            )
      accountOptions =
        filterType == FilterType.ACCOUNTS
          ? selections
          : this.getDesiredKeysFromCurrentFilteredKeys(
              selections,
              ALL_CLOUD_PROVIDERS_VALUE,
              filterType,
              FilterType.ACCOUNTS,
            )
    }
    return { providerKeys: providerOptions, serviceKeys: serviceOptions, accountKeys: accountOptions }
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
