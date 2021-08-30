/*
 * © 2021 Thoughtworks, Inc.
 */

import { Filters } from 'common/FilterBar/utils/Filters'
import { DropdownFilterOptions, FiltersConfig } from 'Types'
import {
  ALL_ACCOUNTS_DROPDOWN_OPTION,
  ALL_SERVICES_DROPDOWN_OPTION,
  CLOUD_PROVIDER_OPTIONS,
} from 'common/FilterBar/utils/DropdownConstants'

const defaultConfig: FiltersConfig = {
  timeframe: 36,
  dateRange: null,
  options: {
    [DropdownFilterOptions.SERVICES]: [ALL_SERVICES_DROPDOWN_OPTION],
    [DropdownFilterOptions.CLOUD_PROVIDERS]: CLOUD_PROVIDER_OPTIONS,
    [DropdownFilterOptions.ACCOUNTS]: [ALL_ACCOUNTS_DROPDOWN_OPTION],
  },
}

export class EmissionsFilters extends Filters {
  constructor(config = defaultConfig) {
    super(config)
  }
}
