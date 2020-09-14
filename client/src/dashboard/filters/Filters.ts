import { EstimationResult } from '../../types'
import moment from 'moment'
import { ALL_SERVICES, SERVICE_OPTIONS } from '../services'
import { DropdownOption } from './DropdownFilter'
import { Dispatch, SetStateAction } from 'react'

export type FilterProps = {
  filters: Filters
  setFilters: Dispatch<SetStateAction<Filters>>
}

type MaybeDateRange = DateRange | null
type MaybeMoment = moment.Moment | null

interface FiltersConfig {
  timeframe: number
  services: string[]
  dateRange: MaybeDateRange
}

const defaultFiltersConfig = {
  timeframe: 12,
  services: SERVICE_OPTIONS.map((o) => o.key),
  dateRange: null,
}

export class Filters {
  readonly timeframe: number
  readonly services: string[]
  readonly dateRange: MaybeDateRange

  constructor(config: FiltersConfig = defaultFiltersConfig) {
    this.timeframe = config.timeframe
    this.services = config.services
    this.dateRange = config.dateRange
  }

  withTimeFrame(timeframe: number): Filters {
    return this.timeframe === timeframe ? this : new Filters({ ...this, dateRange: null, timeframe })
  }

  withServices(services: string[]): Filters {
    return new Filters({
      ...this,
      services: handleSelection(services, this.services, ALL_SERVICES, SERVICE_OPTIONS),
    })
  }

  withDateRange(dateRange: DateRange): Filters {
    if (dateRange.isComplete()) {
      return new Filters({
        ...this,
        timeframe: -1,
        dateRange,
      })
    } else if (this.dateRange?.isComplete()) {
      return this
    } else {
      return new Filters({
        ...this,
        dateRange,
      })
    }
  }

  serviceLabel(): string {
    return numSelectedLabel(this.services.length, SERVICE_OPTIONS.length)
  }

  filter(rawResults: EstimationResult[]) {
    let start: moment.Moment
    let end: moment.Moment
    if (this.timeframe < 0 && this.dateRange) {
      start = this.dateRange.getStartDate()
      end = this.dateRange.getEndDate()
    } else {
      end = moment.utc()
      start = end.clone().subtract(this.timeframe, 'M')
    }

    const resultsFilteredByTime = rawResults.filter((estimationResult: EstimationResult) =>
      moment.utc(estimationResult.timestamp).isBetween(start, end, 'day', '[]'),
    )

    const allServicesSelected = this.services.includes(ALL_SERVICES)
    return resultsFilteredByTime.map((estimationResult) => {
      const filteredServiceEstimates = estimationResult.serviceEstimates.filter((serviceEstimate) => {
        return this.services.includes(serviceEstimate.serviceName) || allServicesSelected
      })
      return { timestamp: estimationResult.timestamp, serviceEstimates: filteredServiceEstimates }
    })
  }
}

function handleSelection(keys: string[], oldKeys: string[], allValue: string, options: DropdownOption[]) {
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

function numSelectedLabel(length: number, totalLength: number) {
  const lengthWithoutAllOption = totalLength - 1
  if (length === totalLength) {
    return `Services: ${lengthWithoutAllOption} of ${lengthWithoutAllOption}`
  } else {
    return `Services: ${length} of ${lengthWithoutAllOption}`
  }
}

export class DateRange {
  readonly startDate: MaybeMoment
  readonly endDate: MaybeMoment

  constructor(startDate: MaybeMoment = null, endDate: MaybeMoment = null) {
    this.startDate = startDate
    this.endDate = endDate
  }

  isComplete() {
    return this.startDate !== null && this.endDate !== null
  }

  getStartDate(): moment.Moment {
    if (this.startDate !== null) {
      return this.startDate
    } else {
      throw new Error('Start date is not set')
    }
  }

  getEndDate(): moment.Moment {
    if (this.endDate !== null) {
      return this.endDate
    } else {
      throw new Error('End date is not set')
    }
  }
}
