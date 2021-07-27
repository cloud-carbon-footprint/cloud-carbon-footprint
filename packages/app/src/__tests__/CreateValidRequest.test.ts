/*
 * © 2021 Thoughtworks, Inc.
 */
import moment from 'moment'
import { AWS_REGIONS } from '@cloud-carbon-footprint/aws'

import {
  CreateValidFootprintRequest,
  CreateValidRecommendationsRequest,
} from '../CreateValidRequest'
import { AWS_RECOMMENDATIONS_TARGETS } from '@cloud-carbon-footprint/common'

describe('CreateValidRequest', () => {
  it('parses the start and end dates in utc', () => {
    const input = {
      startDate: '2020-07-01',
      endDate: '2020-07-13',
      region: AWS_REGIONS.US_EAST_1,
    }

    const result = CreateValidFootprintRequest(input)

    expect(result).toEqual({
      startDate: moment.utc('2020-07-01').toDate(),
      endDate: moment.utc('2020-07-13').toDate(),
      region: AWS_REGIONS.US_EAST_1,
    })
  })

  it('ensures the start date is before the end date', () => {
    const input = {
      startDate: '2020-07-14',
      endDate: '2020-07-13',
      region: AWS_REGIONS.US_EAST_1,
    }

    expect(() => CreateValidFootprintRequest(input)).toThrow(
      'Start date is not before end date',
    )
  })

  it('ensures the start date is not the end date', () => {
    const input = {
      startDate: '2020-07-13',
      endDate: '2020-07-13',
      region: AWS_REGIONS.US_EAST_1,
    }

    expect(() => CreateValidFootprintRequest(input)).toThrow(
      'Start date is not before end date',
    )
  })

  it('ensures the start date is in the past', () => {
    const input = {
      startDate: '3000-07-14',
      endDate: '3000-07-15',
      region: AWS_REGIONS.US_EAST_1,
    }

    expect(() => CreateValidFootprintRequest(input)).toThrow(
      'Start date is in the future',
    )
  })

  it('ensures the end date is in the past', () => {
    const input = {
      startDate: '2020-01-13',
      endDate: '3000-07-15',
      region: AWS_REGIONS.US_EAST_1,
    }

    expect(() => CreateValidFootprintRequest(input)).toThrow(
      'End date is in the future',
    )
  })

  it('ensures the raw start date is a parseable date', () => {
    const input = {
      startDate: 'haha lol',
      endDate: '2020-07-10',
      region: AWS_REGIONS.US_EAST_1,
    }

    expect(() => CreateValidFootprintRequest(input)).toThrow(
      'Start date is not in a recognized RFC2822 or ISO format',
    )
  })

  it('ensures the raw end date is a parseable date', () => {
    const input = {
      startDate: '2020-01-10',
      endDate: 'haha lol',
      region: AWS_REGIONS.US_EAST_1,
    }

    expect(() => CreateValidFootprintRequest(input)).toThrow(
      'End date is not in a recognized RFC2822 or ISO format',
    )
  })

  describe('given: a date is null', () => {
    it('throws error for missing start date', () => {
      const input = {
        startDate: null as string,
        endDate: '2020-01-10',
        region: AWS_REGIONS.US_EAST_1,
      }

      expect(() => CreateValidFootprintRequest(input)).toThrow(
        'Start date must be provided',
      )
    })

    it('throws error for missing end date', () => {
      const input = {
        startDate: '2020-01-10',
        endDate: null as string,
        region: AWS_REGIONS.US_EAST_1,
      }

      expect(() => CreateValidFootprintRequest(input)).toThrow(
        'End date must be provided',
      )
    })
  })

  describe('given: a date is undefined', () => {
    it('throws error for missing start date', () => {
      const input = {
        startDate: undefined as string,
        endDate: '2020-01-10',
        region: AWS_REGIONS.US_EAST_1,
      }

      expect(() => CreateValidFootprintRequest(input)).toThrow(
        'Start date must be provided',
      )
    })

    it('throws error for missing end date', () => {
      const input = {
        startDate: '2020-01-10',
        endDate: undefined as string,
        region: AWS_REGIONS.US_EAST_1,
      }

      expect(() => CreateValidFootprintRequest(input)).toThrow(
        'End date must be provided',
      )
    })
  })

  describe('given: a date is an empty string', () => {
    it('throws error for empty start date', () => {
      const input = {
        startDate: '',
        endDate: '2020-01-10',
        region: AWS_REGIONS.US_EAST_1,
      }

      expect(() => CreateValidFootprintRequest(input)).toThrow(
        'Start date must be provided',
      )
    })

    it('throws error for empty end date', () => {
      const input = {
        startDate: '',
        endDate: null as string,
        region: AWS_REGIONS.US_EAST_1,
      }

      expect(() => CreateValidFootprintRequest(input)).toThrow(
        'End date must be provided',
      )
    })
  })

  it('reports multiple errors', () => {
    const input = {
      startDate: '3000-07-14',
      endDate: '3000-07-13',
      region: AWS_REGIONS.US_EAST_1,
    }

    expect(() => CreateValidFootprintRequest(input)).toThrow(
      'Start date is not before end date, Start date is in the future',
    )
  })

  it('ensures the region is valid', () => {
    const input = {
      startDate: '2000-07-10',
      endDate: '2020-07-10',
      region: 'us-east-800',
    }

    expect(() => CreateValidFootprintRequest(input)).toThrow(
      'Not a valid region',
    )
  })

  describe('recommendations request', () => {
    it('parses the AWS recommendation target for a Single Instance Family', () => {
      const input = {
        awsRecommendationTarget: 'SAME_INSTANCE_FAMILY',
      }

      const result = CreateValidRecommendationsRequest(input)

      expect(result).toEqual({
        awsRecommendationTarget:
          AWS_RECOMMENDATIONS_TARGETS.SAME_INSTANCE_FAMILY,
      })
    })

    it('parses the AWS recommendation target for a Cross Instance Family', () => {
      const input = {
        awsRecommendationTarget: 'CROSS_INSTANCE_FAMILY',
      }

      const result = CreateValidRecommendationsRequest(input)

      expect(result).toEqual({
        awsRecommendationTarget:
          AWS_RECOMMENDATIONS_TARGETS.CROSS_INSTANCE_FAMILY,
      })
    })

    it('returns default recommendation target if none provided', () => {
      const input = {}

      const result = CreateValidRecommendationsRequest(input)

      expect(result).toEqual({
        awsRecommendationTarget:
          AWS_RECOMMENDATIONS_TARGETS.SAME_INSTANCE_FAMILY,
      })
    })

    it('throws an error if provided an invalid recommendation target', () => {
      const input = {
        awsRecommendationTarget: 'NO_INSTANCE_FAMILY',
      }

      expect(() => CreateValidRecommendationsRequest(input)).toThrow(
        'AWS Recommendation Target is not valid',
      )
    })
  })
})
