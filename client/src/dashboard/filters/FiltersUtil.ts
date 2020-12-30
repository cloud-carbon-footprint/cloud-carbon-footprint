/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { DropdownOption } from './DropdownFilter'
import createOptionChooser from './OptionChooser'

export enum FilterType {
  SERVICES = 'services',
  CLOUD_PROVIDERS = 'cloudProviders',
  ACCOUNTS = 'accounts',
}

export type Selections = {
  [key in FilterType]: DropdownOption[]
}

export function handleSelections(
  selections: DropdownOption[],
  oldSelections: Selections,
  filterType: FilterType,
): { providerKeys: DropdownOption[]; accountKeys: DropdownOption[]; serviceKeys: DropdownOption[] } {
  return createOptionChooser(filterType, selections, oldSelections).choose()
}

export function numSelectedLabel(length: number, totalLength: number, type = 'Services'): string {
  const lengthWithoutAllOption = totalLength - 1
  if (length === totalLength) {
    return `${type}: ${lengthWithoutAllOption} of ${lengthWithoutAllOption}`
  } else {
    return `${type}: ${length} of ${lengthWithoutAllOption}`
  }
}
