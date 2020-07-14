import { validate } from '../../../src/application/EstimationRequest'
import moment = require('moment')

describe('validate', () => {
  it('parses the start and end dates', () => {
    const input = {
      startDate: '2020-07-01',
      endDate: '2020-07-13',
    }

    const result = validate(input)

    expect(result).toEqual({
      startDate: moment('2020-07-01').toDate(),
      endDate: moment('2020-07-13').toDate(),
    })
  })

  it('ensures the start date is before the end date', () => {
    const input = {
      startDate: '2020-07-14',
      endDate: '2020-07-13',
    }

    expect(() => validate(input)).toThrow('Start date is not before end date')
  })

  it('ensures the start date is in the past', () => {
    const input = {
      startDate: '3000-07-14',
      endDate: '3000-07-15',
    }

    expect(() => validate(input)).toThrow('Start date is in the future')
  })

  it('ensures the end date is in the past', () => {
    const input = {
      startDate: '2020-01-13',
      endDate: '3000-07-15',
    }

    expect(() => validate(input)).toThrow('End date is in the future')
  })

  it('ensures the raw start date is a parseable date', () => {
    const input = {
      startDate: 'haha lol',
      endDate: '2020-07-10',
    }

    expect(() => validate(input)).toThrow('Start date is not in a recognized RFC2822 or ISO format')
  })

  it('ensures the raw end date is a parseable date', () => {
    const input = {
      startDate: '2020-01-10',
      endDate: 'haha lol',
    }

    expect(() => validate(input)).toThrow('End date is not in a recognized RFC2822 or ISO format')
  })

  it('ensures the start date is present', () => {
    const input = {
      startDate: null as string,
      endDate: '2020-01-10',
    }

    expect(() => validate(input)).toThrow('Start date must be provided')
  })

  it('ensures the start date is present 1', () => {
    const input = {
      startDate: undefined as string,
      endDate: '2020-01-10',
    }

    expect(() => validate(input)).toThrow('Start date must be provided')
  })

  it('ensures the start date is present 2', () => {
    const input = {
      startDate: '',
      endDate: '2020-01-10',
    }

    expect(() => validate(input)).toThrow('Start date must be provided')
  })

  it('ensures the end date is present', () => {
    const input = {
      startDate: '2020-01-10',
      endDate: null as string,
    }

    expect(() => validate(input)).toThrow('End date must be provided')
  })

  it('ensures the end date is present 1', () => {
    const input = {
      startDate: '2020-01-10',
      endDate: undefined as string,
    }

    expect(() => validate(input)).toThrow('End date must be provided')
  })

  it('ensures the end date is present 2', () => {
    const input = {
      startDate: '',
      endDate: null as string,
    }

    expect(() => validate(input)).toThrow('End date must be provided')
  })

  it('ensures the start date is not more than 12 months ago', () => {
    const input = {
      startDate: '2000-07-10',
      endDate: '2020-07-10',
    }

    expect(() => validate(input)).toThrow('Start date cannot be more than 12 months ago')
  })

  it('reports multiple errors', () => {
    const input = {
      startDate: '3000-07-14',
      endDate: '3000-07-13',
    }

    expect(() => validate(input)).toThrow('Start date is not before end date, Start date is in the future')
  })
})
