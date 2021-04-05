/*
 * © 2021 Thoughtworks, Inc. All rights reserved.
 */

import { DropdownOption } from './DropdownFilter'
import config from '../../ConfigLoader'

export const ALL_KEY = 'all'
export const ALL_ACCOUNTS_VALUE = 'All Accounts'
export const ALL_ACCOUNTS_DROPDOWN_OPTION: DropdownOption = {
  key: ALL_KEY,
  name: ALL_ACCOUNTS_VALUE,
  cloudProvider: '',
}

export const ALL_SERVICES_VALUE = 'All Services'
export const ALL_SERVICES_DROPDOWN_OPTION: DropdownOption = {
  key: ALL_KEY,
  name: ALL_SERVICES_VALUE,
}

export function alphabetizeDropdownOptions(
  dropdownOptions: DropdownOption[],
): DropdownOption[] {
  dropdownOptions.sort((a, b) => {
    const normalizedA = a.name.trim().toLowerCase()
    const normalizedB = b.name.trim().toLowerCase()
    return normalizedA.localeCompare(normalizedB)
  })
  return dropdownOptions
}

function sortByCloudProvider(
  { cloudProvider: cloudProvider1 = '' }: DropdownOption,
  { cloudProvider: cloudProvider2 = '' }: DropdownOption,
) {
  return cloudProvider1.localeCompare(cloudProvider2)
}

export const ALL_CLOUD_PROVIDERS_VALUE = 'All Providers'
export const ALL_CLOUD_PROVIDERS_DROPDOWN_OPTION: DropdownOption = {
  key: ALL_KEY,
  name: ALL_CLOUD_PROVIDERS_VALUE,
}
export const CLOUD_PROVIDER_OPTIONS: DropdownOption[] = [
  ALL_CLOUD_PROVIDERS_DROPDOWN_OPTION,
  ...alphabetizeDropdownOptions(config().CURRENT_PROVIDERS),
]

export const buildAndOrderDropdownOptions = (
  dropdownOptions: DropdownOption[] | undefined,
  emptyResponse: DropdownOption[],
): DropdownOption[] => {
  const options = dropdownOptions ?? emptyResponse

  return alphabetizeDropdownOptions(options).sort(sortByCloudProvider)
}
