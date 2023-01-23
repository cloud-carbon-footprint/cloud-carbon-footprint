/*
 * © 2021 Thoughtworks, Inc.
 */
import moment from 'moment'
import { AWS_REGIONS } from '@cloud-carbon-footprint/aws'

import {
  createValidFootprintRequest,
  createValidRecommendationsRequest,
} from '../CreateValidRequest'
import { AWS_RECOMMENDATIONS_TARGETS } from '@cloud-carbon-footprint/common'

describe('CreateValidRequest', () => {
  it('parses the start and end dates in utc', () => {
    const input = {
      startDate: '2020-07-01',
      endDate: '2020-07-13',
      region: AWS_REGIONS.US_EAST_1,
    }

    const result = createValidFootprintRequest(input)

    expect(result).toEqual({
      startDate: moment.utc('2020-07-01').toDate(),
      endDate: moment.utc('2020-07-13').toDate(),
      region: AWS_REGIONS.US_EAST_1,
      ignoreCache: false,
    })
  })

  it('ensures the start date is before the end date', () => {
    const input = {
      startDate: '2020-07-14',
      endDate: '2020-07-13',
      region: AWS_REGIONS.US_EAST_1,
    }

    expect(() => createValidFootprintRequest(input)).toThrow(
      'Start date is after end date',
    )
  })

  it('ensures the start date is in the past', () => {
    const input = {
      startDate: '3000-07-14',
      endDate: '3000-07-15',
      region: AWS_REGIONS.US_EAST_1,
    }

    expect(() => createValidFootprintRequest(input)).toThrow(
      'Start date is in the future',
    )
  })

  it('ensures the end date is in the past', () => {
    const input = {
      startDate: '2020-01-13',
      endDate: '3000-07-15',
      region: AWS_REGIONS.US_EAST_1,
    }

    expect(() => createValidFootprintRequest(input)).toThrow(
      'End date is in the future',
    )
  })

  it('ensures the raw start date is a parseable date', () => {
    const input = {
      startDate: 'haha lol',
      endDate: '2020-07-10',
      region: AWS_REGIONS.US_EAST_1,
    }

    expect(() => createValidFootprintRequest(input)).toThrow(
      'Start date is not in a recognized RFC2822 or ISO format',
    )
  })

  it('ensures the raw end date is a parseable date', () => {
    const input = {
      startDate: '2020-01-10',
      endDate: 'haha lol',
      region: AWS_REGIONS.US_EAST_1,
    }

    expect(() => createValidFootprintRequest(input)).toThrow(
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

      expect(() => createValidFootprintRequest(input)).toThrow(
        'Start date must be provided',
      )
    })

    it('throws error for missing end date', () => {
      const input = {
        startDate: '2020-01-10',
        endDate: null as string,
        region: AWS_REGIONS.US_EAST_1,
      }

      expect(() => createValidFootprintRequest(input)).toThrow(
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

      expect(() => createValidFootprintRequest(input)).toThrow(
        'Start date must be provided',
      )
    })

    it('throws error for missing end date', () => {
      const input = {
        startDate: '2020-01-10',
        endDate: undefined as string,
        region: AWS_REGIONS.US_EAST_1,
      }

      expect(() => createValidFootprintRequest(input)).toThrow(
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

      expect(() => createValidFootprintRequest(input)).toThrow(
        'Start date must be provided',
      )
    })

    it('throws error for empty end date', () => {
      const input = {
        startDate: '',
        endDate: null as string,
        region: AWS_REGIONS.US_EAST_1,
      }

      expect(() => createValidFootprintRequest(input)).toThrow(
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

    expect(() => createValidFootprintRequest(input)).toThrow(
      'Start date is after end date, Start date is in the future',
    )
  })

  it('ensures the region is valid', () => {
    const input = {
      startDate: '2000-07-10',
      endDate: '2020-07-10',
      region: 'us-east-800',
    }

    expect(() => createValidFootprintRequest(input)).toThrow(
      'Not a valid region',
    )
  })

  it('ensures the seeded cloud provider is valid', () => {
    const input = {
      startDate: '2000-07-10',
      endDate: '2020-07-10',
      cloudProviderToSeed: 'TEST',
    }

    expect(() => createValidFootprintRequest(input)).toThrow(
      'Not a valid cloud provider',
    )
  })

  it.each([
    ['1', 'test', 'Not a valid skip number'],
    ['test', '1', 'Not a valid limit number'],
    ['-1', '1', 'Not a valid limit number'],
    ['1', '-1', 'Not a valid skip number'],
  ])(
    'ensures limit and skip values are numbers',
    (limit: number | string, skip: number | string, errorMsg: string) => {
      const input = {
        startDate: '2000-07-10',
        endDate: '2020-07-10',
        region: 'us-east-1',
        limit,
        skip,
      }
      expect(() => createValidFootprintRequest(input)).toThrow(errorMsg)
    },
  )

  it.each([
    [
      'cloudProviders',
      { aws: true },
      'Filter for cloud providers must be an array with appropriate values',
    ],
    [
      'cloudProviders',
      ['9', 'gcp', 'aws'],
      'Filter for cloud providers must be an array with appropriate values',
    ],
    [
      'accounts',
      ['$upercoolProject'],
      'Filter for accounts must be an array with appropriate values',
    ],
    [
      'services',
      ['//services', 'n+tSql'],
      'Filter for services must be an array with appropriate values',
    ],
    [
      'regions',
      ['1', 'southE@st'],
      'Filter for regions must be an array with appropriate values',
    ],
    [
      'tags',
      [{ 'aws:user': 'user' }, { env: 'prod' }],
      'Tags must be formatted correctly into key/value pairs',
    ],
    [
      'tags',
      { 'aws-user': 9 },
      'Tags must be formatted correctly into key/value pairs',
    ],
  ])('ensures %s filter is a valid array list', (filter, value, errorMsg) => {
    const input = {
      startDate: '2000-07-10',
      endDate: '2020-07-10',
      region: 'us-east-1',
      limit: '1',
      skip: '0',
      [filter]: value,
    }

    expect(() => createValidFootprintRequest(input)).toThrow(errorMsg)
  })

  it.each([
    ['cloudProviders', ['aws', 'gcp'], ['AWS', 'GCP']],
    ['cloudProviders', 'aws', ['AWS']],
    ['accounts', ['account1', 'account2'], ['account1', 'account2']],
    ['services', ['serviceOne', 'serviceTwo'], ['serviceOne', 'serviceTwo']],
    [
      'regions',
      ['region-north-1', 'region-north-2'],
      ['region-north-1', 'region-north-2'],
    ],
    [
      'tags',
      { 'aws:user': 'user1', 'aws:createdBy': 'someone' },
      { 'aws:user': 'user1', 'aws:createdBy': 'someone' },
    ],
  ])(
    'creates estimation request with %s filters',
    (filter, value, filterResult) => {
      const input = {
        startDate: '2000-07-10',
        endDate: '2020-07-10',
        region: 'us-east-1',
        limit: '1',
        skip: '0',
        [filter]: value,
      }

      const result = {
        startDate: new Date('2000-07-10'),
        endDate: new Date('2020-07-10'),
        region: 'us-east-1',
        limit: 1,
        skip: 0,
        ignoreCache: false,
        [filter]: filterResult,
      }

      const request = createValidFootprintRequest(input)

      expect(request).toEqual(result)
    },
  )

  describe('given: groupBy param', () => {
    //use tests parametrization for the rest of the test cases
    it('should return group by specified', () => {
      const input = {
        startDate: '2020-07-01',
        endDate: '2020-07-13',
        region: AWS_REGIONS.US_EAST_1,
        groupBy: 'month',
      }

      const result = createValidFootprintRequest(input)

      expect(result).toEqual({
        startDate: moment.utc('2020-07-01').toDate(),
        endDate: moment.utc('2020-07-13').toDate(),
        region: AWS_REGIONS.US_EAST_1,
        ignoreCache: false,
        groupBy: 'month',
      })
    })
  })

  describe('recommendations request', () => {
    it('parses the AWS recommendation target for a Single Instance Family', () => {
      const input = {
        awsRecommendationTarget: 'SAME_INSTANCE_FAMILY',
      }

      const result = createValidRecommendationsRequest(input)

      expect(result).toEqual({
        awsRecommendationTarget:
          AWS_RECOMMENDATIONS_TARGETS.SAME_INSTANCE_FAMILY,
      })
    })

    it('parses the AWS recommendation target for a Cross Instance Family', () => {
      const input = {
        awsRecommendationTarget: 'CROSS_INSTANCE_FAMILY',
      }

      const result = createValidRecommendationsRequest(input)

      expect(result).toEqual({
        awsRecommendationTarget:
          AWS_RECOMMENDATIONS_TARGETS.CROSS_INSTANCE_FAMILY,
      })
    })

    it('returns default recommendation target if none provided', () => {
      const input = {}

      const result = createValidRecommendationsRequest(input)

      expect(result).toEqual({
        awsRecommendationTarget:
          AWS_RECOMMENDATIONS_TARGETS.SAME_INSTANCE_FAMILY,
      })
    })

    it('throws an error if provided an invalid recommendation target', () => {
      const input = {
        awsRecommendationTarget: 'NO_INSTANCE_FAMILY',
      }

      expect(() => createValidRecommendationsRequest(input)).toThrow(
        'AWS Recommendation Target is not valid',
      )
    })
  })
})
