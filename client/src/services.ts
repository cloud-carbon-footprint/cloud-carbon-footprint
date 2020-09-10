import Config from './Config.json'

export interface ServiceOption {
  key: string
  name: string
}
export const ALL_SERVICES = 'all'
export const SERVICE_OPTIONS: ServiceOption[] = [
  { key: ALL_SERVICES, name: 'All Services' },
  ...Config.CURRENT_SERVICES,
]

export const SERVICE_LABELS: { [key: string]: string } = SERVICE_OPTIONS.reduce(
  (serviceOptions, service) => ({ ...serviceOptions, [service.key]: service.name }),
  {},
)
