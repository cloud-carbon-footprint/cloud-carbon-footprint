/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { DropdownOption } from './DropdownFilter'
import config from '../../ConfigLoader'

export const ALL_ACCOUNTS_KEY = 'all'
export const ALL_ACCOUNTS_VALUE = 'All Accounts'
export const ALL_ACCOUNTS_DROPDOWN_OPTION: DropdownOption = {
  key: ALL_ACCOUNTS_KEY,
  name: ALL_ACCOUNTS_VALUE,
  cloudProvider: '',
}

export const ALL_SERVICES_KEY = 'all'
export const ALL_SERVICES_VALUE = 'All Services'
export const ALL_SERVICES_DROPDOWN_OPTION: DropdownOption = { key: ALL_SERVICES_KEY, name: ALL_SERVICES_VALUE }
export const SERVICE_OPTIONS: DropdownOption[] = [
  ALL_SERVICES_DROPDOWN_OPTION,
  ...addCloudProvider(config().AWS.CURRENT_SERVICES, 'aws'),
  ...addCloudProvider(config().GCP.CURRENT_SERVICES, 'gcp'),
]

function addCloudProvider(dropdownOptions: DropdownOption[], cloudProvider: string): DropdownOption[] {
  const returnedDropdownOptions: DropdownOption[] = []
  dropdownOptions.forEach((dropdownOption) => {
    Object.assign(dropdownOption, { cloudProvider: cloudProvider })
    returnedDropdownOptions.push(dropdownOption)
  })
  return returnedDropdownOptions
}

export const ALL_CLOUD_PROVIDERS_KEY = 'all'
export const ALL_CLOUD_PROVIDERS_VALUE = 'All Providers'
export const ALL_CLOUD_PROVIDERS_DROPDOWN_OPTION: DropdownOption = {
  key: ALL_CLOUD_PROVIDERS_KEY,
  name: ALL_CLOUD_PROVIDERS_VALUE,
}
export const CLOUD_PROVIDER_OPTIONS: DropdownOption[] = [
  ALL_CLOUD_PROVIDERS_DROPDOWN_OPTION,
  ...config().CURRENT_PROVIDERS,
]
