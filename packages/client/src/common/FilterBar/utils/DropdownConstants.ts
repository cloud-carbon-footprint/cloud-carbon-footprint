/*
 * © 2021 Thoughtworks, Inc.
 */

import config from 'ConfigLoader'
import { AllFilterOptionMap, DropdownOption } from 'Types'

function sortByCloudProvider(
  { cloudProvider: cloudProvider1 = '' }: DropdownOption,
  { cloudProvider: cloudProvider2 = '' }: DropdownOption,
) {
  return cloudProvider1.localeCompare(cloudProvider2)
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

export const ALL_CLOUD_PROVIDERS_VALUE = 'All Providers'
export const ALL_CLOUD_PROVIDERS_DROPDOWN_OPTION: DropdownOption = {
  key: ALL_KEY,
  name: ALL_CLOUD_PROVIDERS_VALUE,
}
export const CLOUD_PROVIDER_OPTIONS: DropdownOption[] = [
  ALL_CLOUD_PROVIDERS_DROPDOWN_OPTION,
  ...alphabetizeDropdownOptions(config().CURRENT_PROVIDERS),
]

export const ALL_RECOMMENDATION_TYPES_VALUE = 'All Recommendation Types'
export const ALL_RECOMMENDATION_TYPES_DROPDOWN_OPTION: DropdownOption = {
  key: ALL_KEY,
  name: ALL_RECOMMENDATION_TYPES_VALUE,
  cloudProvider: '',
}

export const ALL_REGIONS_VALUE = 'All Regions'
export const ALL_REGIONS_DROPDOWN_OPTION: DropdownOption = {
  key: ALL_KEY,
  name: ALL_REGIONS_VALUE,
  cloudProvider: '',
}

export const ALL_DROPDOWN_FILTER_OPTIONS: AllFilterOptionMap = {
  accounts: ALL_ACCOUNTS_DROPDOWN_OPTION,
  services: ALL_SERVICES_DROPDOWN_OPTION,
  cloudProviders: ALL_CLOUD_PROVIDERS_DROPDOWN_OPTION,
  recommendationTypes: ALL_RECOMMENDATION_TYPES_DROPDOWN_OPTION,
  regions: ALL_REGIONS_DROPDOWN_OPTION,
}

export const buildAndOrderDropdownOptions = (
  dropdownOptions: DropdownOption[] | undefined,
  emptyResponse: DropdownOption[],
): DropdownOption[] => {
  const options = dropdownOptions ?? emptyResponse

  return alphabetizeDropdownOptions(options).sort(sortByCloudProvider)
}
