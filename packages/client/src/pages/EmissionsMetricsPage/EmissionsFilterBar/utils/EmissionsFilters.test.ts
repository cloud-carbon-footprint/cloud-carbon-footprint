/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import { generateEstimations } from 'utils/data'
import {
  DropdownFilterOptions,
  FilterOptions,
  FilterResultResponse,
} from 'Types'
import { FiltersDateRange, Filters } from 'common/FilterBar/utils/Filters'
import { EmissionsFilters } from './EmissionsFilters'
import {
  alphabetizeDropdownOptions,
  CLOUD_PROVIDER_OPTIONS,
} from 'common/FilterBar/utils/DropdownConstants'
import config from 'ConfigLoader'

expect.extend({
  toOnlyHaveServices(actual: EstimationResult[], expected: string[]) {
    if (!actual.length)
      return {
        pass: false,
        message: () => `EstimationResult is empty`,
      }

    let error: { pass: boolean; message: () => string } | null = null

    actual.forEach((estimationResult, index) => {
      estimationResult.serviceEstimates.forEach((serviceEstimate) => {
        if (!error && !expected.includes(serviceEstimate.serviceName)) {
          error = {
            pass: false,
            message: () =>
              `EstimationResult[${index}] contains unexpected service '${serviceEstimate.serviceName}'`,
          }
        }
      })
    })
    return error || { pass: true, message: () => 'u rock' }
  },

  toBeWithinTimeframe(actual: EstimationResult[], expected: number) {
    if (!actual.length)
      return {
        pass: false,
        message: () => `EstimationResult is empty`,
      }

    let error: { pass: boolean; message: () => string } | null = null
    actual.forEach((estimationResult, index) => {
      const today: moment.Moment = moment.utc()
      const endOfTimeframe: moment.Moment = today
        .clone()
        .subtract(expected, 'M')
      const current = moment.utc(estimationResult.timestamp)

      if (!error && !current.isBetween(endOfTimeframe, today, 'day', '[]')) {
        error = {
          pass: false,
          message: () =>
            `EstimationResult[${index}] with date ${current.toISOString()} is not within ${endOfTimeframe.toISOString()} - ${today.toISOString()}`,
        }
      }
    })
    return error || { pass: true, message: () => 'u rock' }
  },
})

/* eslint-disable */
declare global {
  namespace jest {
    interface Matchers<R> {
      toOnlyHaveServices(expected: string[]): CustomMatcherResult
      toBeWithinTimeframe(expected: number): CustomMatcherResult
    }
  }
}

jest.mock('ConfigLoader', () => {
  return jest.fn().mockImplementation(() => {
    return {
      CURRENT_PROVIDERS: [
        { key: 'aws', name: 'AWS' },
        { key: 'gcp', name: 'GCP' },
      ],
    }
  })
})

describe('Filters', () => {
  const allServiceOption = { key: 'all', name: 'All Services' }
  const ebsServiceOption = { key: 'ebs', name: 'ebs', cloudProvider: 'aws' }
  const S3ServiceOption = { key: 's3', name: 's3', cloudProvider: 'aws' }
  const ec2ServiceOption = { key: 'ec2', name: 'ec2', cloudProvider: 'aws' }
  const elastiCacheServiceOption = {
    key: 'elasticache',
    name: 'elastiCache',
    cloudProvider: 'aws',
  }
  const rdsServiceOption = { key: 'rds', name: 'rds', cloudProvider: 'aws' }
  const lambdaServiceOption = {
    key: 'lambda',
    name: 'lambda',
    cloudProvider: 'aws',
  }
  const computeEngineServiceOption = {
    key: 'computeEngine',
    name: 'computeEngine',
    cloudProvider: 'gcp',
  }
  const services = [
    ebsServiceOption,
    S3ServiceOption,
    ec2ServiceOption,
    elastiCacheServiceOption,
    rdsServiceOption,
    lambdaServiceOption,
    computeEngineServiceOption,
  ]
  const options: FilterResultResponse = { accounts: [], services }
  const servicesToTest = [
    { key: 'ebs', name: 'ebs', cloudProvider: 'aws' },
    { key: 'ec2', name: 'ec2', cloudProvider: 'aws' },
    { key: 'elasticache', name: 'elastiCache', cloudProvider: 'aws' },
    { key: 'lambda', name: 'lambda', cloudProvider: 'aws' },
    { key: 'rds', name: 'rds', cloudProvider: 'aws' },
    { key: 's3', name: 's3', cloudProvider: 'aws' },
    { key: 'computeEngine', name: 'computeEngine', cloudProvider: 'gcp' },
  ]
  const filterOptions: FilterOptions = {
    accounts: [
      { key: 'all', name: 'All Accounts', cloudProvider: '' },
      { key: '321321321', name: 'testaccount0', cloudProvider: 'aws' },
      { key: '123123123', name: 'testaccount1', cloudProvider: 'gcp' },
    ],
    services: [{ key: 'all', name: 'All Services' }, ...servicesToTest],
    cloudProviders: CLOUD_PROVIDER_OPTIONS,
  }

  const defaultConfig = {
    options: {
      services: servicesToTest,
      accounts: [
        { key: 'aws account 0', name: 'aws account 0', cloudProvider: 'aws' },
        { key: 'aws account 1', name: 'aws account 1', cloudProvider: 'aws' },
        { key: 'aws account 2', name: 'aws account 2', cloudProvider: 'aws' },
        { key: 'aws account 3', name: 'aws account 3', cloudProvider: 'aws' },
        { key: 'aws account 4', name: 'aws account 4', cloudProvider: 'aws' },
        { key: 'aws account 5', name: 'aws account 5', cloudProvider: 'aws' },
      ],
      cloudProviders: [
        ...alphabetizeDropdownOptions(config().CURRENT_PROVIDERS),
      ],
    },
  }

  describe('filter', () => {
    it('should filter just ebs', () => {
      const estimationResults = generateEstimations(moment.utc(), 1)

      const filters = new EmissionsFilters(defaultConfig).withDropdownOption(
        [ebsServiceOption],
        filterOptions,
        DropdownFilterOptions.SERVICES,
      )

      const filteredData = filters.filter(estimationResults)

      expect(filteredData).toOnlyHaveServices([ebsServiceOption.key])
    })

    it('should ignore services not present in the estimationResults', () => {
      const estimationResults = generateEstimations(moment.utc(), 1, [
        's3',
        'ebs',
      ])
      const filters = new EmissionsFilters(defaultConfig).withDropdownOption(
        [ebsServiceOption, ec2ServiceOption],
        filterOptions,
        DropdownFilterOptions.SERVICES,
      )

      const filteredData = filters.filter(estimationResults)

      expect(filteredData).toOnlyHaveServices([ebsServiceOption.key])
    })

    it('should filter by timeframe', () => {
      const estimationResults = generateEstimations(moment.utc(), 12)
      const filters = new EmissionsFilters().withTimeFrame(3)

      const filteredData = filters.filter(estimationResults)

      expect(filteredData).toEqual(estimationResults.slice(0, 4))
    })

    it('should filter by timeframe and service', () => {
      const estimationResults = generateEstimations(moment.utc(), 12)
      const filters = new EmissionsFilters(defaultConfig)
        .withTimeFrame(3)
        .withDropdownOption(
          [ebsServiceOption],
          filterOptions,
          DropdownFilterOptions.SERVICES,
        )

      const filteredData = filters.filter(estimationResults)

      expect(filteredData).toOnlyHaveServices([ebsServiceOption.key])
      expect(filteredData).toBeWithinTimeframe(3)
    })

    it('should filter by timeframe = 36 by default', () => {
      const estimationResults = generateEstimations(moment.utc(), 13)
      const filters = new EmissionsFilters()

      const filteredData = filters.filter(estimationResults)

      expect(filteredData).toBeWithinTimeframe(36)
    })

    it('should filter by dateRange', () => {
      const estimationResults = generateEstimations(moment.utc(), 13)

      const startDate = moment.utc().subtract(4, 'M')
      const endDate = moment.utc().subtract(2, 'M')
      const filters = new EmissionsFilters().withDateRange(
        new FiltersDateRange(startDate, endDate),
      )

      const filteredData = filters.filter(estimationResults)
      expect(filteredData).toEqual(estimationResults.slice(2, 5))
    })

    it('should filter between start date and today when selecting a new start date after the current end date', () => {
      const estimationResults = generateEstimations(moment.utc(), 13)

      const startDate = moment.utc().subtract(6, 'M')
      const endDate = moment.utc().subtract(4, 'M')
      const newStartDate = moment.utc().subtract(3, 'M')
      const filters = new EmissionsFilters()
        .withDateRange(new FiltersDateRange(startDate, endDate))
        .withDateRange(new FiltersDateRange(newStartDate, null))

      const filteredData = filters.filter(estimationResults)
      expect(filteredData).toEqual(estimationResults.slice(0, 4))
    })

    it('should return an empty array for data when all service estimates are empty', () => {
      const estimationResults = generateEstimations(moment.utc(), 1)
      const filters = new EmissionsFilters()
      estimationResults.forEach((estimate) => {
        estimate.serviceEstimates = []
      })
      const filteredData = filters.filter(estimationResults)

      expect(filteredData).toEqual([])
    })
  })

  describe('withServices', () => {
    it('should default to All Services', () => {
      const filterConfig = EmissionsFilters.generateConfig(options)
      const filters = new Filters(filterConfig)

      expect(filters.options.services).toEqual([allServiceOption, ...services])
    })

    it('should unselect All Services', () => {
      const filters = new EmissionsFilters()

      const newFilters = filters.withDropdownOption(
        [],
        filterOptions,
        DropdownFilterOptions.SERVICES,
      )

      expect(newFilters.options.services).toEqual([])
    })

    it('should select an unselected service', () => {
      const filters = new EmissionsFilters()

      const newFilters = filters
        .withDropdownOption([], filterOptions, DropdownFilterOptions.SERVICES)
        .withDropdownOption(
          [ebsServiceOption],
          filterOptions,
          DropdownFilterOptions.SERVICES,
        )
        .withDropdownOption(
          [ebsServiceOption, rdsServiceOption],
          filterOptions,
          DropdownFilterOptions.SERVICES,
        )

      expect(newFilters.options.services).toEqual([
        ebsServiceOption,
        rdsServiceOption,
      ])
    })

    it('should unselect an selected service', () => {
      const filters = new EmissionsFilters()

      const newFilters = filters
        .withDropdownOption([], filterOptions, DropdownFilterOptions.SERVICES)
        .withDropdownOption(
          [ebsServiceOption],
          filterOptions,
          DropdownFilterOptions.SERVICES,
        )
        .withDropdownOption(
          [ebsServiceOption, rdsServiceOption],
          filterOptions,
          DropdownFilterOptions.SERVICES,
        )
        .withDropdownOption(
          [rdsServiceOption],
          filterOptions,
          DropdownFilterOptions.SERVICES,
        )

      expect(newFilters.options.services).toEqual([rdsServiceOption])
    })

    it('should select all services when a service has already been selected', () => {
      const filters = new EmissionsFilters()

      const newFilters = filters
        .withDropdownOption([], filterOptions, DropdownFilterOptions.SERVICES)
        .withDropdownOption(
          [ebsServiceOption],
          filterOptions,
          DropdownFilterOptions.SERVICES,
        )
        .withDropdownOption(
          [ebsServiceOption, allServiceOption],
          filterOptions,
          DropdownFilterOptions.SERVICES,
        )

      expect(newFilters.options.services).toEqual([
        allServiceOption,
        ebsServiceOption,
        ec2ServiceOption,
        elastiCacheServiceOption,
        lambdaServiceOption,
        rdsServiceOption,
        S3ServiceOption,
        computeEngineServiceOption,
      ])
    })

    it('should add ALL_SERVICES when all services are selected', () => {
      const filters = new EmissionsFilters()

      const newFilters = filters
        .withDropdownOption([], filterOptions, DropdownFilterOptions.SERVICES)
        .withDropdownOption(
          [
            ebsServiceOption,
            S3ServiceOption,
            ec2ServiceOption,
            elastiCacheServiceOption,
            rdsServiceOption,
            lambdaServiceOption,
            computeEngineServiceOption,
          ],
          filterOptions,
          DropdownFilterOptions.SERVICES,
        )

      expect(newFilters.options.services).toEqual([
        allServiceOption,
        ebsServiceOption,
        ec2ServiceOption,
        elastiCacheServiceOption,
        lambdaServiceOption,
        rdsServiceOption,
        S3ServiceOption,
        computeEngineServiceOption,
      ])
    })
  })

  describe('timeframe vs dateRange', () => {
    it('selects the timeframe filter by default', () => {
      const filters = new EmissionsFilters()

      expect(filters.timeframe).toEqual(36)
      expect(filters.dateRange).toBeNull()
    })

    it('keeps timeframe filter when the dateRange filter is incomplete', () => {
      const startDate = moment.utc()
      const filters = new EmissionsFilters().withDateRange(
        new FiltersDateRange(startDate, null),
      )

      expect(filters.timeframe).toEqual(36)
      expect(filters.dateRange?.isComplete()).toEqual(false)
      expect(filters.dateRange?.startDate).toEqual(startDate)
      expect(filters.dateRange?.endDate).toEqual(null)
    })

    it('unselects the timeframe filter when the dateRange filter is complete', () => {
      const startDate = moment.utc()
      const filters = new EmissionsFilters().withDateRange(
        new FiltersDateRange(startDate, startDate),
      )

      expect(filters.timeframe).toEqual(-1)
      expect(filters.dateRange?.isComplete()).toEqual(true)
      expect(filters.dateRange?.startDate).toEqual(startDate)
      expect(filters.dateRange?.endDate).toEqual(startDate)
    })

    it('unselects the dateRange filter when the timeframe filter is set', () => {
      const startDate = moment.utc()
      const filters = new EmissionsFilters()
        .withDateRange(new FiltersDateRange(startDate, null))
        .withTimeFrame(3)

      expect(filters.timeframe).toEqual(3)
      expect(filters.dateRange).toBeNull()
    })

    it('unsets end date without selecting timeframe filter when selecting a new start date after the current end date', () => {
      const startDate = moment.utc()
      const filters = new EmissionsFilters()
        .withDateRange(new FiltersDateRange(startDate, startDate))
        .withDateRange(new FiltersDateRange(startDate, null))

      expect(filters.timeframe).toEqual(-1)
      expect(filters.dateRange?.startDate).toEqual(startDate)
      expect(filters.dateRange?.endDate).toEqual(null)
    })
  })

  describe('withAccounts', () => {
    const mockAccount1 = {
      cloudProvider: 'aws',
      key: '123123123',
      name: 'testAccount1',
    }
    it('should unselect a selected account', () => {
      const filters = new EmissionsFilters({
        timeframe: 12,
        options: {
          services: [],
          cloudProviders: [],
          accounts: [mockAccount1],
        },
        dateRange: null,
      })
      expect(filters.options.accounts).toEqual([mockAccount1])

      const newFilters = filters.withDropdownOption(
        [],
        filterOptions,
        DropdownFilterOptions.ACCOUNTS,
      )
      expect(newFilters.options.accounts).toEqual([])
    })
  })
})
