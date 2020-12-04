/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { SERVICE_OPTIONS } from '../services'
import { CLOUD_PROVIDER_OPTIONS } from '../cloudProviders'
import { DropdownOption } from './DropdownFilter'
const providerServices: { [key: string]: string[] } = {
  aws: ['ebs', 's3', 'ec2', 'elasticache', 'rds', 'lambda'],
  gcp: ['computeEngine'],
}

export enum FilterType {
  SERVICES = 'services',
  CLOUD_PROVIDERS = 'cloud providers',
}

export abstract class FiltersUtil {
  getDesiredKeysFromCurrentFilteredKeys(
    selections: DropdownOption[],
    allValue: string,
    currentFilterType: FilterType,
    desiredFilterType: FilterType,
  ): DropdownOption[] {
    const currentSelections: DropdownOption[] = []
    const keys = selections.map((selection) => selection.key)

    if (currentFilterType == FilterType.SERVICES && desiredFilterType == FilterType.CLOUD_PROVIDERS) {
      for (const [key, value] of Object.entries(providerServices)) {
        if (value.some((r) => keys.includes(r))) {
          currentSelections.push(<DropdownOption>CLOUD_PROVIDER_OPTIONS.find((option) => option.key === key))
        }
      }
      if (keys.includes(allValue)) {
        currentSelections.push({ key: allValue, name: 'All Providers' })
      }
    }
    if (currentFilterType == FilterType.CLOUD_PROVIDERS && desiredFilterType == FilterType.SERVICES) {
      selections.forEach((selection) => {
        if (selection.key !== allValue) {
          providerServices[selection.key].forEach((service) =>
            currentSelections.push(<DropdownOption>SERVICE_OPTIONS.find((option) => option.key === service)),
          )
        }
      })
      if (keys.includes(allValue)) {
        currentSelections.push({ key: allValue, name: 'All Services' })
      }
    }

    return currentSelections
  }

  handleSelections(
    selections: DropdownOption[],
    oldSelections: DropdownOption[],
    allValue: string,
    options: DropdownOption[],
    filterType: FilterType,
  ): { providerKeys: DropdownOption[]; serviceKeys: DropdownOption[] } {
    let serviceOptions: DropdownOption[]
    let providerOptions: DropdownOption[]
    const selectionKeys: string[] = selections.map((selection) => selection.key)
    const oldSelectionKeys: string[] = oldSelections.map((oldSelection) => oldSelection.key)

    if (selectionKeys.includes(allValue) && !oldSelectionKeys.includes(allValue)) {
      serviceOptions = SERVICE_OPTIONS
      providerOptions = CLOUD_PROVIDER_OPTIONS
    } else if (!selectionKeys.includes(allValue) && oldSelectionKeys.includes(allValue)) {
      serviceOptions = []
      providerOptions = []
    } else {
      if (selections.length === options.length - 1 && oldSelectionKeys.includes(allValue)) {
        selections = selections.filter((k) => k.key !== allValue)
      } else if (selections.length === options.length - 1 && !oldSelectionKeys.includes(allValue)) {
        selections = options
      }

      serviceOptions =
        filterType == FilterType.SERVICES
          ? selections
          : this.getDesiredKeysFromCurrentFilteredKeys(
              selections,
              allValue,
              FilterType.CLOUD_PROVIDERS,
              FilterType.SERVICES,
            )
      providerOptions =
        filterType == FilterType.CLOUD_PROVIDERS
          ? selections
          : this.getDesiredKeysFromCurrentFilteredKeys(
              selections,
              allValue,
              FilterType.SERVICES,
              FilterType.CLOUD_PROVIDERS,
            )
    }
    return { providerKeys: providerOptions, serviceKeys: serviceOptions }
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
