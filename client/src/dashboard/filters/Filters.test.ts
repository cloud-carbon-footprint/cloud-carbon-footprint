/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { DateRange, Filters, filtersConfigGenerator } from './Filters'
import moment from 'moment'
import generateEstimations from '../../data/generateEstimations'
import { EstimationResult, FilterResultResponse } from '../../models/types'

jest.mock('./AccountFilter', () => ({
  ACCOUNT_OPTIONS: [
    { key: 'all', name: 'All Accounts', cloudProvider: '' },
    { key: '321321321', name: 'testaccount0', cloudProvider: 'aws' },
    { key: '123123123', name: 'testaccount1', cloudProvider: 'gcp' },
  ],
}))

jest.mock('./ServiceFilter', () => ({
  SERVICE_OPTIONS: [
    { key: 'all', name: 'All Services' },
    { key: 'ebs', name: 'EBS', cloudProvider: 'aws' },
    { key: 'ec2', name: 'EC2', cloudProvider: 'aws' },
    { key: 'elasticache', name: 'ElastiCache', cloudProvider: 'aws' },
    { key: 'lambda', name: 'Lambda', cloudProvider: 'aws' },
    { key: 'rds', name: 'RDS', cloudProvider: 'aws' },
    { key: 's3', name: 'S3', cloudProvider: 'aws' },
    { key: 'computeEngine', name: 'Compute Engine', cloudProvider: 'gcp' },
  ],
}))

expect.extend({
  toOnlyHaveServices(actual: EstimationResult[], expected: string[]) {
    let error: { pass: boolean; message: () => string } | null = null
    actual.forEach((estimationResult, index) => {
      estimationResult.serviceEstimates.forEach((serviceEstimate) => {
        if (!error && !expected.includes(serviceEstimate.serviceName)) {
          error = {
            pass: false,
            message: () => `EstimationResult[${index}] contains unexpected service '${serviceEstimate.serviceName}'`,
          }
        }
      })
    })
    return error || { pass: true, message: () => 'u rock' }
  },

  toBeWithinTimeframe(actual: EstimationResult[], expected: number) {
    let error: { pass: boolean; message: () => string } | null = null
    actual.forEach((estimationResult, index) => {
      const today: moment.Moment = moment.utc()
      const endOfTimeframe: moment.Moment = today.clone().subtract(expected, 'M')
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

jest.mock('../../ConfigLoader', () => {
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
  const ebsServiceOption = { key: 'ebs', name: 'EBS', cloudProvider: 'aws' }
  const S3ServiceOption = { key: 's3', name: 'S3', cloudProvider: 'aws' }
  const ec2ServiceOption = { key: 'ec2', name: 'EC2', cloudProvider: 'aws' }
  const elastiCacheServiceOption = { key: 'elasticache', name: 'ElastiCache', cloudProvider: 'aws' }
  const rdsServiceOption = { key: 'rds', name: 'RDS', cloudProvider: 'aws' }
  const lambdaServiceOption = { key: 'lambda', name: 'Lambda', cloudProvider: 'aws' }
  const computeEngineServiceOption = { key: 'computeEngine', name: 'Compute Engine', cloudProvider: 'gcp' }
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

  describe('filter', () => {
    it('should filter just ebs', () => {
      const estimationResults = generateEstimations(moment.utc(), 1)
      const filters = new Filters().withServices([ebsServiceOption])

      const filteredData = filters.filter(estimationResults)

      expect(filteredData).toOnlyHaveServices([ebsServiceOption.key])
    })

    it('should ignore services not present in the estimationResults', () => {
      const estimationResults = generateEstimations(moment.utc(), 1, ['s3'])
      const filters = new Filters().withServices([ebsServiceOption, ec2ServiceOption])

      const filteredData = filters.filter(estimationResults)

      expect(filteredData).toOnlyHaveServices([ebsServiceOption.key])
    })

    it('should filter by timeframe', () => {
      const estimationResults = generateEstimations(moment.utc(), 12)
      const filters = new Filters().withTimeFrame(3)

      const filteredData = filters.filter(estimationResults)

      expect(filteredData).toEqual(estimationResults.slice(0, 4))
    })

    it('should filter by timeframe and service', () => {
      const estimationResults = generateEstimations(moment.utc(), 12)
      const filters = new Filters().withTimeFrame(3).withServices([ebsServiceOption])

      const filteredData = filters.filter(estimationResults)

      expect(filteredData).toOnlyHaveServices([ebsServiceOption.key])
      expect(filteredData).toBeWithinTimeframe(3)
    })

    it('should filter by timeframe = 12 by default', () => {
      const estimationResults = generateEstimations(moment.utc(), 13)
      const filters = new Filters()

      const filteredData = filters.filter(estimationResults)

      expect(filteredData).toBeWithinTimeframe(12)
    })

    it('should filter by dateRange', () => {
      const estimationResults = generateEstimations(moment.utc(), 13)

      const startDate = moment.utc().subtract(4, 'M')
      const endDate = moment.utc().subtract(2, 'M')
      const filters = new Filters().withDateRange(new DateRange(startDate, endDate))

      const filteredData = filters.filter(estimationResults)
      expect(filteredData).toEqual(estimationResults.slice(2, 5))
    })

    it('should filter between start date and today when selecting a new start date after the current end date', () => {
      const estimationResults = generateEstimations(moment.utc(), 13)

      const startDate = moment.utc().subtract(6, 'M')
      const endDate = moment.utc().subtract(4, 'M')
      const newStartDate = moment.utc().subtract(3, 'M')
      const filters = new Filters()
        .withDateRange(new DateRange(startDate, endDate))
        .withDateRange(new DateRange(newStartDate, null))

      const filteredData = filters.filter(estimationResults)
      expect(filteredData).toEqual(estimationResults.slice(0, 4))
    })
  })

  describe('withServices', () => {
    it('should default to All Services', () => {
      const filters = new Filters(filtersConfigGenerator(options))

      expect(filters.services).toEqual([allServiceOption, ...services])
    })

    it('should unselect All Services', () => {
      const filters = new Filters()

      const newFilters = filters.withServices([])

      expect(newFilters.services).toEqual([])
    })

    it('should unselect one service when all services is already selected', () => {
      const filters = new Filters()

      const newFilters = filters.withServices([
        allServiceOption,
        S3ServiceOption,
        ec2ServiceOption,
        elastiCacheServiceOption,
        rdsServiceOption,
        lambdaServiceOption,
        computeEngineServiceOption,
      ])

      expect(newFilters.services).toEqual([
        S3ServiceOption,
        ec2ServiceOption,
        elastiCacheServiceOption,
        rdsServiceOption,
        lambdaServiceOption,
        computeEngineServiceOption,
      ])
    })

    it('should select an unselected service', () => {
      const filters = new Filters()

      const newFilters = filters
        .withServices([])
        .withServices([ebsServiceOption])
        .withServices([ebsServiceOption, rdsServiceOption])

      expect(newFilters.services).toEqual([ebsServiceOption, rdsServiceOption])
    })

    it('should unselect an selected service', () => {
      const filters = new Filters()

      const newFilters = filters
        .withServices([])
        .withServices([ebsServiceOption])
        .withServices([ebsServiceOption, rdsServiceOption])
        .withServices([rdsServiceOption])

      expect(newFilters.services).toEqual([rdsServiceOption])
    })

    it('should select all services when a service has already been selected', () => {
      const filters = new Filters()

      const newFilters = filters
        .withServices([])
        .withServices([ebsServiceOption])
        .withServices([ebsServiceOption, allServiceOption])

      expect(newFilters.services).toEqual([
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
      const filters = new Filters()

      const newFilters = filters
        .withServices([])
        .withServices([
          ebsServiceOption,
          S3ServiceOption,
          ec2ServiceOption,
          elastiCacheServiceOption,
          rdsServiceOption,
          lambdaServiceOption,
          computeEngineServiceOption,
        ])

      expect(newFilters.services).toEqual([
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
      const filters = new Filters()

      expect(filters.timeframe).toEqual(12)
      expect(filters.dateRange).toBeNull()
    })

    it('keeps timeframe filter when the dateRange filter is incomplete', () => {
      const startDate = moment.utc()
      const filters = new Filters().withDateRange(new DateRange(startDate, null))

      expect(filters.timeframe).toEqual(12)
      expect(filters.dateRange?.isComplete()).toEqual(false)
      expect(filters.dateRange?.startDate).toEqual(startDate)
      expect(filters.dateRange?.endDate).toEqual(null)
    })

    it('unselects the timeframe filter when the dateRange filter is complete', () => {
      const startDate = moment.utc()
      const filters = new Filters().withDateRange(new DateRange(startDate, startDate))

      expect(filters.timeframe).toEqual(-1)
      expect(filters.dateRange?.isComplete()).toEqual(true)
      expect(filters.dateRange?.startDate).toEqual(startDate)
      expect(filters.dateRange?.endDate).toEqual(startDate)
    })

    it('unselects the dateRange filter when the timeframe filter is set', () => {
      const startDate = moment.utc()
      const filters = new Filters().withDateRange(new DateRange(startDate, null)).withTimeFrame(3)

      expect(filters.timeframe).toEqual(3)
      expect(filters.dateRange).toBeNull()
    })

    it('unsets end date without selecting timeframe filter when selecting a new start date after the current end date', () => {
      const startDate = moment.utc()
      const filters = new Filters()
        .withDateRange(new DateRange(startDate, startDate))
        .withDateRange(new DateRange(startDate, null))

      expect(filters.timeframe).toEqual(-1)
      expect(filters.dateRange?.startDate).toEqual(startDate)
      expect(filters.dateRange?.endDate).toEqual(null)
    })
  })

  describe('withAccounts', () => {
    const mockAccount1 = { cloudProvider: 'aws', key: '123123123', name: 'testAccount1' }
    it('should unselect a selected account', () => {
      const filters = new Filters({
        timeframe: 12,
        services: [],
        cloudProviders: [],
        dateRange: null,
        accounts: [mockAccount1],
      })
      expect(filters.accounts).toEqual([mockAccount1])

      const newFilters = filters.withAccounts([])
      expect(newFilters.accounts).toEqual([])
    })
  })
})
