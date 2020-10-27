import Config from '../Config.json'
import { DropdownOption } from './filters/DropdownFilter'

export const ALL_CLOUD_PROVIDERS = 'all'
export const CLOUD_PROVIDER_OPTIONS: DropdownOption[] = [
  { key: ALL_CLOUD_PROVIDERS, name: 'All Providers' },
  ...Config.CURRENT_PROVIDERS,
]

export const CLOUD_PROVIDER_LABELS: { [key: string]: string } = CLOUD_PROVIDER_OPTIONS.reduce(
  (cloudProviderOptions, cloudProvider) => ({ ...cloudProviderOptions, [cloudProvider.key]: cloudProvider.name }),
  {},
)
