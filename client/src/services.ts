import Config from './Config.json'
import { DropdownOption } from './DropdownFilter'

export const ALL_SERVICES = 'all'
export const SERVICE_OPTIONS: DropdownOption[] = [
  { key: ALL_SERVICES, name: 'All Services' },
  ...Config.CURRENT_SERVICES,
]

export const SERVICE_LABELS: { [key: string]: string } = SERVICE_OPTIONS.reduce(
  (serviceOptions, service) => ({ ...serviceOptions, [service.key]: service.name }),
  {},
)
