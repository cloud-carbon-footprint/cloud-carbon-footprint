import CreateValidRequest from '@application/CreateValidRequest'
import { AWS_REGIONS } from '@services/AWSRegions'
import moment = require('moment')

describe('CreateValidRequest', () => {
  it('parses the start and end dates in utc', () => {
    const input = {
      startDate: '2020-07-01',
      endDate: '2020-07-13',
      region: AWS_REGIONS.US_EAST_1,
    }

    const result = CreateValidRequest(input)

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

    expect(() => CreateValidRequest(input)).toThrow('Start date is not before end date')
  })

  it('ensures the start date is not the end date', () => {
    const input = {
      startDate: '2020-07-13',
      endDate: '2020-07-13',
      region: AWS_REGIONS.US_EAST_1,
    }

    expect(() => CreateValidRequest(input)).toThrow('Start date is not before end date')
  })

  it('ensures the start date is in the past', () => {
    const input = {
      startDate: '3000-07-14',
      endDate: '3000-07-15',
      region: AWS_REGIONS.US_EAST_1,
    }

    expect(() => CreateValidRequest(input)).toThrow('Start date is in the future')
  })

  it('ensures the end date is in the past', () => {
    const input = {
      startDate: '2020-01-13',
      endDate: '3000-07-15',
      region: AWS_REGIONS.US_EAST_1,
    }

    expect(() => CreateValidRequest(input)).toThrow('End date is in the future')
  })

  it('ensures the raw start date is a parseable date', () => {
    const input = {
      startDate: 'haha lol',
      endDate: '2020-07-10',
      region: AWS_REGIONS.US_EAST_1,
    }

    expect(() => CreateValidRequest(input)).toThrow('Start date is not in a recognized RFC2822 or ISO format')
  })

  it('ensures the raw end date is a parseable date', () => {
    const input = {
      startDate: '2020-01-10',
      endDate: 'haha lol',
      region: AWS_REGIONS.US_EAST_1,
    }

    expect(() => CreateValidRequest(input)).toThrow('End date is not in a recognized RFC2822 or ISO format')
  })

  describe('given: a date is null', () => {
    it('throws error for missing start date', () => {
      const input = {
        startDate: null as string,
        endDate: '2020-01-10',
        region: AWS_REGIONS.US_EAST_1,
      }

      expect(() => CreateValidRequest(input)).toThrow('Start date must be provided')
    })

    it('throws error for missing end date', () => {
      const input = {
        startDate: '2020-01-10',
        endDate: null as string,
        region: AWS_REGIONS.US_EAST_1,
      }

      expect(() => CreateValidRequest(input)).toThrow('End date must be provided')
    })
  })

  describe('given: a date is undefined', () => {
    it('throws error for missing start date', () => {
      const input = {
        startDate: undefined as string,
        endDate: '2020-01-10',
        region: AWS_REGIONS.US_EAST_1,
      }

      expect(() => CreateValidRequest(input)).toThrow('Start date must be provided')
    })

    it('throws error for missing end date', () => {
      const input = {
        startDate: '2020-01-10',
        endDate: undefined as string,
        region: AWS_REGIONS.US_EAST_1,
      }

      expect(() => CreateValidRequest(input)).toThrow('End date must be provided')
    })
  })

  describe('given: a date is an empty string', () => {
    it('throws error for empty start date', () => {
      const input = {
        startDate: '',
        endDate: '2020-01-10',
        region: AWS_REGIONS.US_EAST_1,
      }

      expect(() => CreateValidRequest(input)).toThrow('Start date must be provided')
    })

    it('throws error for empty end date', () => {
      const input = {
        startDate: '',
        endDate: null as string,
        region: AWS_REGIONS.US_EAST_1,
      }

      expect(() => CreateValidRequest(input)).toThrow('End date must be provided')
    })
  })

  it('ensures the start date is not more than 12 months ago', () => {
    const input = {
      startDate: '2000-07-10',
      endDate: '2020-07-10',
      region: AWS_REGIONS.US_EAST_1,
    }

    expect(() => CreateValidRequest(input)).toThrow('Start date cannot be more than 12 months ago')
  })

  it('reports multiple errors', () => {
    const input = {
      startDate: '3000-07-14',
      endDate: '3000-07-13',
      region: AWS_REGIONS.US_EAST_1,
    }

    expect(() => CreateValidRequest(input)).toThrow('Start date is not before end date, Start date is in the future')
  })

  it('ensures the region is valid', () => {
    const input = {
      startDate: '2000-07-10',
      endDate: '2020-07-10',
      region: 'us-east-800',
    }

    expect(() => CreateValidRequest(input)).toThrow('Not a valid region')
  })
})
