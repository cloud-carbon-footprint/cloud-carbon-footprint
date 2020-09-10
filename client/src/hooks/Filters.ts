import { EstimationResult } from '../types'
import moment from 'moment'
import { ALL_SERVICES, SERVICE_OPTIONS } from '../services'

interface FiltersConfig {
  timeframe: number
  services: string[]
}

const defaultFiltersConfig = {
  timeframe: 12,
  services: [ALL_SERVICES],
}
export class Filters {
  readonly timeframe: number
  readonly services: string[]

  constructor(config: FiltersConfig = defaultFiltersConfig) {
    this.timeframe = config.timeframe
    this.services = config.services
  }

  withTimeFrame(timeframe: number): Filters {
    return this.timeframe === timeframe ? this : new Filters({ ...this, timeframe })
  }

  withServices(services: string[]): Filters {
    const oldServices = this.services
    let newServices
    if (services.includes(ALL_SERVICES)) {
      // deselecting one of the services
      if (oldServices.includes(ALL_SERVICES)) {
        newServices = SERVICE_OPTIONS.map((option) => option.key).filter((service) => !services.includes(service))
      } else {
        // turning on all services
        newServices = services.filter((service) => service === ALL_SERVICES)
      }
    }
    // turning off all services
    else if (oldServices.includes(ALL_SERVICES)) {
      newServices = services.filter((service) => service !== ALL_SERVICES)
    }
    // selecting / deselecting a single service
    else {
      newServices = services
    }

    return new Filters({ ...this, services: newServices })
  }

  allServicesSelected(): boolean {
    return this.services.includes(ALL_SERVICES)
  }

  noServicesSelected(): boolean {
    return this.services.length === 0
  }

  filter(results: EstimationResult[]) {
    const today: moment.Moment = moment.utc()
    const todayMinusXMonths: moment.Moment = today.clone().subtract(this.timeframe, 'M')

    return results.filter((estimationResult: EstimationResult) =>
      moment.utc(estimationResult.timestamp).isBetween(todayMinusXMonths, today, 'day', '[]'),
    )
  }
}
