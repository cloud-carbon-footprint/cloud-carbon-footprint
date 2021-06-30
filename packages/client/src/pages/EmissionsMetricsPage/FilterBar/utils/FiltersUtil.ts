/*
 * © 2021 ThoughtWorks, Inc.
 */

import { DropdownOption } from 'Types'
import createOptionChooser from './options'

export enum DropdownFilter {
  SERVICES = 'services',
  CLOUD_PROVIDERS = 'cloudProviders',
  ACCOUNTS = 'accounts',
}

export type DropdownSelections = {
  [key in DropdownFilter]: DropdownOption[]
}

export function handleDropdownSelections(
  filterType: DropdownFilter,
  selections: DropdownOption[],
  oldSelections: DropdownSelections,
): DropdownSelections {
  return createOptionChooser(filterType, selections, oldSelections).choose()
}

export function numSelectedLabel(
  length: number,
  totalLength: number,
  type = 'Services',
): string {
  const lengthWithoutAllOption = totalLength - 1
  if (length === totalLength) {
    return `${type}: ${lengthWithoutAllOption} of ${lengthWithoutAllOption}`
  } else {
    return `${type}: ${length} of ${lengthWithoutAllOption}`
  }
}
