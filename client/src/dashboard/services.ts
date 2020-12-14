/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import config from '../ConfigLoader'
import { DropdownOption } from './filters/DropdownFilter'

export const ALL_SERVICES_KEY = 'all'
export const ALL_SERVICES_VALUE = 'All Services'
export const ALL_SERVICES_DROPDOWN_OPTION: DropdownOption = { key: ALL_SERVICES_KEY, name: ALL_SERVICES_VALUE }
export const SERVICE_OPTIONS: DropdownOption[] = [
  ALL_SERVICES_DROPDOWN_OPTION,
  ...config().AWS.CURRENT_SERVICES,
  ...config().GCP.CURRENT_SERVICES,
]
