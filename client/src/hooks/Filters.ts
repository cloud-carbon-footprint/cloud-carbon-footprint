import { EstimationResult } from '../types'
import moment from 'moment'
import { ALL_SERVICES, SERVICE_OPTIONS, ServiceOption } from '../services'

interface FiltersConfig {
  timeframe: number
  services: string[]
}

const defaultFiltersConfig = {
  timeframe: 12,
  services: SERVICE_OPTIONS.map((o) => o.key),
}

function numSelectedLabel(length: number, totalLength: number) {
  const lengthWithoutAllOption = totalLength - 1
  if (length === totalLength) {
    return `Services: ${lengthWithoutAllOption} of ${lengthWithoutAllOption}`
  } else {
    return `Services: ${length} of ${lengthWithoutAllOption}`
  }
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
    return new Filters({
      ...this,
      services: handleSelection(services, this.services, ALL_SERVICES, SERVICE_OPTIONS),
    })
  }

  serviceLabel(): string {
    return numSelectedLabel(this.services.length, SERVICE_OPTIONS.length)
  }

  filter(rawResults: EstimationResult[]) {
    const today: moment.Moment = moment.utc()
    const todayMinusXMonths: moment.Moment = today.clone().subtract(this.timeframe, 'M')

    const resultsFilteredByTimestamp = rawResults.filter((estimationResult: EstimationResult) =>
      moment.utc(estimationResult.timestamp).isBetween(todayMinusXMonths, today, 'day', '[]'),
    )

    const resultsFilteredByTimestampAndService = resultsFilteredByTimestamp.map((estimationResult) => {
      const filteredServiceEstimates = estimationResult.serviceEstimates.filter((serviceEstimate) => {
        return this.services.includes(serviceEstimate.serviceName) || this.services.includes(ALL_SERVICES)
      })
      return { timestamp: estimationResult.timestamp, serviceEstimates: filteredServiceEstimates }
    })

    return resultsFilteredByTimestampAndService
  }
}

function handleSelection(keys: string[], oldKeys: string[], allValue: string, options: ServiceOption[]) {
  let newKeys: string[]
  if (keys.includes(allValue)) {
    // deselecting one of the services
    if (oldKeys.includes(allValue)) {
      newKeys = keys.filter((service) => service !== allValue)
    } else {
      // turning on all services
      newKeys = options.map((o) => o.key)
    }
  }
  // turning off all services
  else if (oldKeys.includes(allValue)) {
    newKeys = []
  }
  // selecting / deselecting a single service
  else {
    if (keys.length === options.length - 1) {
      newKeys = options.map((o) => o.key)
    } else {
      newKeys = keys
    }
  }
  return newKeys
}
