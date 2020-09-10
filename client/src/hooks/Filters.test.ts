import { Filters } from './Filters'
import moment from 'moment'
import generateEstimations from '../data/generateEstimations'
import { EstimationResult } from '../types'
import { ALL_SERVICES } from '../services'

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

declare global {
  namespace jest {
    interface Matchers<R> {
      toOnlyHaveServices(expected: string[]): CustomMatcherResult
      toBeWithinTimeframe(expected: number): CustomMatcherResult
    }
  }
}

describe('Filters', () => {
  describe('filter', () => {
    it('should filter just ebs', () => {
      const estimationResults = generateEstimations(moment.utc(), 1)
      const filters = new Filters().withServices(['ebs'])

      const filteredData = filters.filter(estimationResults)

      expect(filteredData).toOnlyHaveServices(['ebs'])
    })

    it('should ignore services not present in the estimationResults', () => {
      const estimationResults = generateEstimations(moment.utc(), 1, ['s3'])
      const filters = new Filters().withServices(['ebs', 'ec2'])

      const filteredData = filters.filter(estimationResults)

      expect(filteredData).toOnlyHaveServices(['ebs'])
    })

    it('should filter by timeframe', () => {
      const estimationResults = generateEstimations(moment.utc(), 12)
      const filters = new Filters().withTimeFrame(3)

      const filteredData = filters.filter(estimationResults)

      expect(filteredData).toEqual(estimationResults.slice(0, 4))
    })

    it('should filter by timeframe and service', () => {
      const estimationResults = generateEstimations(moment.utc(), 12)
      const filters = new Filters().withTimeFrame(3).withServices(['ebs'])

      const filteredData = filters.filter(estimationResults)

      expect(filteredData).toOnlyHaveServices(['ebs'])
      expect(filteredData).toBeWithinTimeframe(3)
    })

    it('should filter by timeframe = 12 by default', () => {
      const estimationResults = generateEstimations(moment.utc(), 13)
      const filters = new Filters()

      const filteredData = filters.filter(estimationResults)

      expect(filteredData).toBeWithinTimeframe(12)
    })
  })

  describe('withServices', () => {
    it('should default to All Services', () => {
      const filters = new Filters()

      expect(filters.services).toEqual([ALL_SERVICES, 'ebs', 's3', 'ec2', 'elasticache', 'rds', 'lambda'])
    })

    it('should unselect All Services', () => {
      const filters = new Filters()

      const newFilters = filters.withServices([])

      expect(newFilters.services).toEqual([])
    })

    it('should unselect one service when all services is already selected', () => {
      const filters = new Filters()

      const newFilters = filters.withServices([ALL_SERVICES, 's3', 'ec2', 'elasticache', 'rds', 'lambda'])

      expect(newFilters.services).toEqual(['s3', 'ec2', 'elasticache', 'rds', 'lambda'])
    })

    it('should select an unselected service', () => {
      const filters = new Filters()

      const newFilters = filters.withServices([]).withServices(['ebs']).withServices(['ebs', 'rds'])

      expect(newFilters.services).toEqual(['ebs', 'rds'])
    })

    it('should unselect an selected service', () => {
      const filters = new Filters()

      const newFilters = filters
        .withServices([])
        .withServices(['ebs'])
        .withServices(['ebs', 'rds'])
        .withServices(['rds'])

      expect(newFilters.services).toEqual(['rds'])
    })

    it('should select all services when a service has already been selected', () => {
      const filters = new Filters()

      const newFilters = filters.withServices([]).withServices(['ebs']).withServices(['ebs', ALL_SERVICES])

      expect(newFilters.services).toEqual([ALL_SERVICES, 'ebs', 's3', 'ec2', 'elasticache', 'rds', 'lambda'])
    })

    it('should add ALL_SERVICES when all services are selected', () => {
      const filters = new Filters()

      const newFilters = filters.withServices([]).withServices(['ebs', 's3', 'ec2', 'elasticache', 'rds', 'lambda'])

      expect(newFilters.services).toEqual([ALL_SERVICES, 'ebs', 's3', 'ec2', 'elasticache', 'rds', 'lambda'])
    })
  })
})
