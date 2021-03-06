/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */
import {
  sumCO2,
  sumCO2ByServiceOrRegion,
  sumServiceTotals,
  useFilterDataFromEstimates,
} from './transformData'
import { renderHook } from '@testing-library/react-hooks'

const date1 = new Date('2020-07-10T00:00:00.000Z')
const date2 = new Date('2020-07-11T00:00:00.000Z')
const data = [
  {
    timestamp: date1,
    serviceEstimates: [
      {
        timestamp: date1,
        serviceName: 'ebs',
        kilowattHours: 12,
        co2e: 15,
        cost: 5,
        region: 'us-east-1',
        usesAverageCPUConstant: false,
        cloudProvider: 'AWS',
        accountName: 'test-a',
      },
      {
        timestamp: date1,
        serviceName: 'ec2',
        kilowattHours: 4,
        co2e: 5,
        cost: 4,
        region: 'us-east-1',
        usesAverageCPUConstant: false,
        cloudProvider: 'GCP',
        accountName: 'test-b',
      },
    ],
  },
  {
    timestamp: date2,
    serviceEstimates: [
      {
        timestamp: date2,
        serviceName: 'ebs',
        kilowattHours: 25,
        co2e: 3,
        cost: 6,
        region: 'us-east-1',
        usesAverageCPUConstant: false,
        cloudProvider: 'AWS',
        accountName: 'test-a',
      },
      {
        timestamp: date2,
        serviceName: 'ec2',
        kilowattHours: 2,
        co2e: 7,
        cost: 6,
        region: 'us-east-1',
        usesAverageCPUConstant: true,
        cloudProvider: 'AWS',
        accountName: 'test-c',
      },
    ],
  },
]

const dataWithHigherPrecision = [
  {
    timestamp: date1,
    serviceEstimates: [
      {
        timestamp: date1,
        serviceName: 'ebs',
        kilowattHours: 12.2342,
        co2e: 15.12341,
        cost: 5.82572,
        region: 'us-east-1',
        usesAverageCPUConstant: false,
      },
      {
        timestamp: date1,
        serviceName: 'ec2',
        kilowattHours: 4.745634,
        co2e: 5.234236,
        cost: 4.732,
        region: 'us-east-1',
        usesAverageCPUConstant: false,
      },
    ],
  },
  {
    timestamp: date2,
    serviceEstimates: [
      {
        timestamp: date2,
        serviceName: 'ebs',
        kilowattHours: 25.73446,
        co2e: 3.2600234,
        cost: 6.05931,
        region: 'us-east-1',
        usesAverageCPUConstant: false,
      },
      {
        timestamp: date2,
        serviceName: 'ec2',
        kilowattHours: 2.4523452,
        co2e: 7.7536,
        cost: 6.2323,
        region: 'us-east-1',
        usesAverageCPUConstant: true,
      },
    ],
  },
]

const dataWithUnknowns = [
  {
    timestamp: date1,
    serviceEstimates: [
      {
        timestamp: date1,
        serviceName: null,
        kilowattHours: 5,
        co2e: 6,
        cost: 7,
        region: 'unknown',
        usesAverageCPUConstant: true,
        cloudProvider: 'AWS',
        accountName: 'test-a',
      },
      {
        timestamp: date1,
        serviceName: 'ebs',
        kilowattHours: 7,
        co2e: 6,
        cost: 5,
        region: 'us-east-1',
        usesAverageCPUConstant: true,
        cloudProvider: 'GCP',
        accountName: null,
      },
    ],
  },
  {
    timestamp: date2,
    serviceEstimates: [
      {
        timestamp: date2,
        serviceName: null,
        kilowattHours: 5,
        co2e: 6,
        cost: 7,
        region: 'unknown',
        usesAverageCPUConstant: true,
        cloudProvider: 'GCP',
        accountName: 'test-b',
      },
      {
        timestamp: date2,
        serviceName: 'ec2',
        kilowattHours: 7,
        co2e: 6,
        cost: 5,
        region: 'us-east-1',
        usesAverageCPUConstant: true,
        cloudProvider: 'AWS',
        accountName: null,
      },
    ],
  },
]

describe('transformData', () => {
  it('returns the sum of CO2 per service', () => {
    const expected = { ebs: 18, ec2: 12 }
    expect(sumCO2ByServiceOrRegion(data, 'service')).toEqual(expected)
  })

  it('returns the sum of CO2 metric tons and gallons', () => {
    const expected = 30
    expect(sumCO2(data)).toEqual(expected)
  })

  it('extract account names from estimates data', async () => {
    const { result } = renderHook(() => useFilterDataFromEstimates(data))
    // then
    const expectedResult = {
      accounts: [
        { cloudProvider: 'aws', key: 'test-a', name: 'test-a' },
        { cloudProvider: 'gcp', key: 'test-b', name: 'test-b' },
        { cloudProvider: 'aws', key: 'test-c', name: 'test-c' },
      ],
      services: [
        { cloudProvider: 'aws', key: 'ebs', name: 'ebs' },
        { cloudProvider: 'gcp', key: 'ec2', name: 'ec2' },
        { cloudProvider: 'aws', key: 'ec2', name: 'ec2' },
      ],
    }
    expect(result.current).toEqual(expectedResult)
  })

  it('handles data with null account names', () => {
    const expected = {
      'test-a': 6,
      'test-b': 6,
      'Unknown Account - GCP': 6,
      'Unknown Account - AWS': 6,
    }
    expect(sumCO2ByServiceOrRegion(dataWithUnknowns, 'account')).toEqual(
      expected,
    )
  })

  it('handles data with null service names', () => {
    const expected = {
      ebs: 6,
      ec2: 6,
      'Unknown Service - GCP': 6,
      'Unknown Service - AWS': 6,
    }
    expect(sumCO2ByServiceOrRegion(dataWithUnknowns, 'service')).toEqual(
      expected,
    )
  })

  it('handles data with unknown regions', () => {
    const expected = {
      'us-east-1': 12,
      'Unknown Region - GCP': 6,
      'Unknown Region - AWS': 6,
    }
    expect(sumCO2ByServiceOrRegion(dataWithUnknowns, 'region')).toEqual(
      expected,
    )
  })
})

describe('sumServiceTotals', () => {
  const expectedTotals = {
    co2e: [
      {
        x: date1,
        y: 20,
        usesAverageCPUConstant: false,
        kilowattHours: 16,
        cost: 9,
      },
      {
        x: date2,
        y: 10,
        usesAverageCPUConstant: true,
        kilowattHours: 27,
        cost: 12,
      },
    ],
    kilowattHours: [
      { x: date1, y: 16 },
      { x: date2, y: 27 },
    ],
    cost: [
      { x: date1, y: 9 },
      { x: date2, y: 12 },
    ],
  }

  it('returns the sum of co2e for all services', () => {
    const expectedCo2e = expectedTotals.co2e
    expect(sumServiceTotals(data).co2Series).toEqual(expectedCo2e)
  })

  it('returns the sum of kilowatt hours for all services', () => {
    const expectedWattHours = expectedTotals.kilowattHours
    expect(sumServiceTotals(data).kilowattHoursSeries).toEqual(
      expectedWattHours,
    )
  })

  it('returns the sum of cost for all services', () => {
    const expectedCost = expectedTotals.cost
    expect(sumServiceTotals(data).costSeries).toEqual(expectedCost)
  })

  describe('rounding to the hundredths', () => {
    const expectedTotals = {
      co2e: [
        {
          x: date1,
          y: 20.3576,
          usesAverageCPUConstant: false,
          kilowattHours: 16.98,
          cost: 10.56,
        },
        {
          x: date2,
          y: 11.0136,
          usesAverageCPUConstant: true,
          kilowattHours: 28.19,
          cost: 12.29,
        },
      ],
      kilowattHours: [
        { x: date1, y: 16.98 },
        { x: date2, y: 28.19 },
      ],
      cost: [
        { x: date1, y: 10.56 },
        { x: date2, y: 12.29 },
      ],
    }
    it('returns the sum of co2e rounded to 3 decimal places', () => {
      expect(sumServiceTotals(dataWithHigherPrecision).co2Series).toEqual(
        expectedTotals.co2e,
      )
    })

    it('returns the sum of co2e rounded to the hundredths place', () => {
      expect(
        sumServiceTotals(dataWithHigherPrecision).kilowattHoursSeries,
      ).toEqual(expectedTotals.kilowattHours)
    })

    it('returns the sum of co2e rounded to the hundredths place', () => {
      expect(sumServiceTotals(dataWithHigherPrecision).costSeries).toEqual(
        expectedTotals.cost,
      )
    })
  })
})
