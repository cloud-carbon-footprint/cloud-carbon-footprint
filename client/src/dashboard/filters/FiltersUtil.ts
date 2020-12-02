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
    keys: string[],
    allValue: string,
    currentFilterType: FilterType,
    desiredFilterType: FilterType,
  ): string[] {
    const currentKeys: string[] = []

    if (currentFilterType == FilterType.SERVICES && desiredFilterType == FilterType.CLOUD_PROVIDERS) {
      for (const [key, value] of Object.entries(providerServices)) {
        if (value.some((r) => keys.includes(r))) {
          currentKeys.push(key)
        }
      }
    }
    if (currentFilterType == FilterType.CLOUD_PROVIDERS && desiredFilterType == FilterType.SERVICES) {
      keys.forEach((key) => {
        if (key !== allValue) {
          providerServices[key].forEach((service) => currentKeys.push(service))
        }
      })
    }

    if (keys.includes(allValue)) {
      currentKeys.push(allValue)
    }

    return currentKeys
  }

  handleSelections(
    keys: string[],
    oldKeys: string[],
    allValue: string,
    options: DropdownOption[],
    filterType: FilterType,
  ): { providerKeys: string[]; serviceKeys: string[] } {
    let serviceKeys: string[]
    let providerKeys: string[]

    if (keys.includes(allValue) && !oldKeys.includes(allValue)) {
      serviceKeys = SERVICE_OPTIONS.map((o) => o.key)
      providerKeys = CLOUD_PROVIDER_OPTIONS.map((o) => o.key)
    } else if (!keys.includes(allValue) && oldKeys.includes(allValue)) {
      serviceKeys = []
      providerKeys = []
    } else {
      if (keys.length === options.length - 1 && oldKeys.includes(allValue)) {
        keys = keys.filter((k) => k !== allValue)
      } else if (keys.length === options.length - 1 && !oldKeys.includes(allValue)) {
        keys = options.map((o) => o.key)
      }

      serviceKeys =
        filterType == FilterType.SERVICES
          ? keys
          : this.getDesiredKeysFromCurrentFilteredKeys(keys, allValue, FilterType.CLOUD_PROVIDERS, FilterType.SERVICES)
      providerKeys =
        filterType == FilterType.CLOUD_PROVIDERS
          ? keys
          : this.getDesiredKeysFromCurrentFilteredKeys(keys, allValue, FilterType.SERVICES, FilterType.CLOUD_PROVIDERS)
    }
    return { providerKeys, serviceKeys }
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
