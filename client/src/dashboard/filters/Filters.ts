/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { EstimationResult } from '../../types'
import moment from 'moment'
import { ALL_SERVICES, SERVICE_OPTIONS } from '../services'
import { ALL_CLOUD_PROVIDERS, CLOUD_PROVIDER_OPTIONS } from '../cloudProviders'
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
  cloudProviders: string[]
  dateRange: MaybeDateRange
}

const defaultFiltersConfig = {
  timeframe: 12,
  services: SERVICE_OPTIONS.map((o) => o.key),
  cloudProviders: CLOUD_PROVIDER_OPTIONS.map((o) => o.key),
  dateRange: null,
}

const providerServices: { [key: string]: string[] } = {
  aws: ['ebs', 's3', 'ec2', 'elasticache', 'rds', 'lambda'],
  gcp: [],
}

export class Filters {
  readonly timeframe: number
  readonly services: string[]
  readonly cloudProviders: string[]
  readonly dateRange: MaybeDateRange

  constructor(config: FiltersConfig = defaultFiltersConfig) {
    this.timeframe = config.timeframe
    this.services = config.services
    this.cloudProviders = config.cloudProviders
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

  withCloudProviders(cloudProviders: string[]): Filters {
    console.log('Providers: ', cloudProviders)
    const { providerKeys, serviceKeys } = handleProviderSelection(
      cloudProviders,
      this.cloudProviders,
      ALL_CLOUD_PROVIDERS,
      CLOUD_PROVIDER_OPTIONS,
      this.services,
    )
    return new Filters({
      ...this,
      cloudProviders: providerKeys,
      services: serviceKeys,
    })
  }

  withDateRange(dateRange: DateRange): Filters {
    if (dateRange.isComplete()) {
      return new Filters({
        ...this,
        timeframe: -1,
        dateRange,
      })
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

  cloudProviderLabel(): string {
    return numSelectedLabel(this.cloudProviders.length, CLOUD_PROVIDER_OPTIONS.length, 'Cloud Providers')
  }

  filter(rawResults: EstimationResult[]) {
    const today = moment.utc()
    let start: moment.Moment
    let end: moment.Moment
    if (this.timeframe < 0 && this.dateRange?.startDate) {
      start = this.dateRange.startDate
      end = this.dateRange.endDate || today
    } else {
      end = today
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

function handleProviderSelection(
  keys: string[],
  oldKeys: string[],
  allValue: string,
  options: DropdownOption[],
  currentServices: string[],
) {
  let providerKeys: string[]
  let serviceKeys: string[] = []
  console.log('keys:', keys)
  // If the "all" key is selected or a single provider is deselected
  if (keys.includes(allValue)) {
    // If the "all" keys was previously toggled on
    if (oldKeys.includes(allValue)) {
      // toggle off the deselected provider and its corresponding services
      providerKeys = keys.filter((provider) => provider !== allValue)
      selectProviderServices(providerKeys, serviceKeys)
    } else {
      // select all providers and all services
      providerKeys = options.map((o) => o.key)
      serviceKeys = handleSelection(['all'], currentServices, ALL_SERVICES, SERVICE_OPTIONS)
    }
  } else if (oldKeys.includes(allValue)) {
    // deselect all providers and services
    providerKeys = []
    serviceKeys = []
  } else {
    // Select / deselect single provider and its corresponding services
    providerKeys = keys
    selectProviderServices(providerKeys, serviceKeys)
  }

  return { providerKeys, serviceKeys }
}

function selectProviderServices(providerKeys: string[], serviceKeys: string[]) {
  providerKeys.forEach((key) => {
    providerServices[key].forEach((service) => serviceKeys.push(service))
  })
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

function numSelectedLabel(length: number, totalLength: number, type: string = 'Services') {
  const lengthWithoutAllOption = totalLength - 1
  if (length === totalLength) {
    return `${type}: ${lengthWithoutAllOption} of ${lengthWithoutAllOption}`
  } else {
    return `${type}: ${length} of ${lengthWithoutAllOption}`
  }
}

export class DateRange {
  readonly startDate: MaybeMoment
  readonly endDate: MaybeMoment

  constructor(startDate: MaybeMoment, endDate: MaybeMoment) {
    this.startDate = startDate
    this.endDate = endDate
  }

  isComplete() {
    return this.startDate !== null && this.endDate !== null
  }
}
