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
  gcp: ['computeEngine'],
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
    const { providerKeys, serviceKeys } = handleSelections(services, this.services, ALL_SERVICES, SERVICE_OPTIONS)
    return new Filters({
      ...this,
      services: serviceKeys,
      cloudProviders: providerKeys,
    })
  }

  withCloudProviders(cloudProviders: string[]): Filters {
    const { providerKeys, serviceKeys } = handleSelections(
      cloudProviders,
      this.cloudProviders,
      ALL_CLOUD_PROVIDERS,
      CLOUD_PROVIDER_OPTIONS,
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

  filter(rawResults: EstimationResult[]): EstimationResult[] {
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

function isServiceKeys(keys: string[], allValue: string) {
  const serviceKeys: string[] = []

  SERVICE_OPTIONS.forEach((obj) => {
    if (obj.key !== allValue) {
      serviceKeys.push(obj.key)
    }
  })

  return serviceKeys.some((r) => keys.includes(r))
}

function isProviderKeys(keys: string[], allValue: string) {
  const providerKeys: string[] = []

  CLOUD_PROVIDER_OPTIONS.forEach((obj) => {
    if (obj.key !== allValue) {
      providerKeys.push(obj.key)
    }
  })

  return providerKeys.some((r) => keys.includes(r))
}

function getSerivceKeysFromProviderKeys(keys: string[], allValue: string) {
  const serviceKeys: string[] = []

  keys.forEach((key) => {
    if (key !== allValue) {
      providerServices[key].forEach((service) => serviceKeys.push(service))
    }
  })

  if (keys.includes(allValue)) {
    serviceKeys.push('all')
  }

  return serviceKeys
}

function getProviderKeysFromServiceKeys(keys: string[], allValue: string) {
  const providerKeys: string[] = []

  for (const [key, value] of Object.entries(providerServices)) {
    if (value.some((r) => keys.includes(r))) {
      providerKeys.push(key)
    }
  }

  if (keys.includes(allValue)) {
    providerKeys.push(allValue)
  }

  return providerKeys
}

function handleSelections(keys: string[], oldKeys: string[], allValue: string, options: DropdownOption[]) {
  let serviceKeys: string[]
  let providerKeys: string[]

  if (keys.includes(allValue) && !oldKeys.includes(allValue)) {
    serviceKeys = SERVICE_OPTIONS.map((o) => o.key)
    providerKeys = CLOUD_PROVIDER_OPTIONS.map((o) => o.key)
  } else if (!keys.includes(allValue) && oldKeys.includes(allValue)) {
    serviceKeys = []
    providerKeys = []
  } else {
    if (keys.length === options.length - 1 && oldKeys.includes(allValue)) {
      keys = keys.filter((k) => k !== allValue)
    } else if (keys.length === options.length - 1 && !oldKeys.includes(allValue)) {
      keys = options.map((o) => o.key)
    }

    serviceKeys = isServiceKeys(keys, allValue) ? keys : getSerivceKeysFromProviderKeys(keys, allValue)
    providerKeys = isProviderKeys(keys, allValue) ? keys : getProviderKeysFromServiceKeys(keys, allValue)
  }
  return { providerKeys, serviceKeys }
}

function numSelectedLabel(length: number, totalLength: number, type = 'Services') {
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

  isComplete(): boolean {
    return this.startDate !== null && this.endDate !== null
  }
}
