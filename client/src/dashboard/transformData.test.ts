/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { sumCO2, sumCO2ByServiceOrRegion, sumServiceTotals } from './transformData'

const date1 = new Date('2020-07-10T00:00:00.000Z')
const date2 = new Date('2020-07-11T00:00:00.000Z')
const data = [
  {
    timestamp: date1,
    serviceEstimates: [
      {
        timestamp: date1,
        serviceName: 'ebs',
        wattHours: 12,
        co2e: 15,
        cost: 5,
        region: 'us-east-1',
        usesAverageCPUConstant: false,
      },
      {
        timestamp: date1,
        serviceName: 'ec2',
        wattHours: 4,
        co2e: 5,
        cost: 4,
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
        wattHours: 25,
        co2e: 3,
        cost: 6,
        region: 'us-east-1',
        usesAverageCPUConstant: false,
      },
      {
        timestamp: date2,
        serviceName: 'ec2',
        wattHours: 2,
        co2e: 7,
        cost: 6,
        region: 'us-east-1',
        usesAverageCPUConstant: true,
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
        wattHours: 12.2342,
        co2e: 15.12341,
        cost: 5.82572,
        region: 'us-east-1',
        usesAverageCPUConstant: false,
      },
      {
        timestamp: date1,
        serviceName: 'ec2',
        wattHours: 4.745634,
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
        wattHours: 25.73446,
        co2e: 3.2600234,
        cost: 6.05931,
        region: 'us-east-1',
        usesAverageCPUConstant: false,
      },
      {
        timestamp: date2,
        serviceName: 'ec2',
        wattHours: 2.4523452,
        co2e: 7.7536,
        cost: 6.2323,
        region: 'us-east-1',
        usesAverageCPUConstant: true,
      },
    ],
  },
]

describe('transformData', () => {
  it('returns the sum of CO2 per service', () => {
    const expected = { ebs: 18, ec2: 12 }
    expect(sumCO2ByServiceOrRegion(data, 'service')).toEqual(expected)
  })

  it('returns the sum of CO2 kg and gallons', () => {
    const expected = 30
    expect(sumCO2(data)).toEqual(expected)
  })
})

describe('sumServiceTotals', () => {
  const expectedTotals = {
    co2e: [
      { x: date1, y: 20, usesAverageCPUConstant: false, wattHours: 16, cost: 9 },
      { x: date2, y: 10, usesAverageCPUConstant: true, wattHours: 27, cost: 12 },
    ],
    wattHours: [
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

  it('returns the sum of watt hours for all services', () => {
    const expectedWattHours = expectedTotals.wattHours
    expect(sumServiceTotals(data).wattHoursSeries).toEqual(expectedWattHours)
  })

  it('returns the sum of cost for all services', () => {
    const expectedCost = expectedTotals.cost
    expect(sumServiceTotals(data).costSeries).toEqual(expectedCost)
  })

  describe('rounding to the hundredths', () => {
    const expectedTotals = {
      co2e: [
        { x: date1, y: 20.36, usesAverageCPUConstant: false, wattHours: 16.98, cost: 10.56 },
        { x: date2, y: 11.01, usesAverageCPUConstant: true, wattHours: 28.19, cost: 12.29 },
      ],
      wattHours: [
        { x: date1, y: 16.98 },
        { x: date2, y: 28.19 },
      ],
      cost: [
        { x: date1, y: 10.56 },
        { x: date2, y: 12.29 },
      ],
    }
    it('returns the sum of co2e rounded to the hundredths place', () => {
      expect(sumServiceTotals(dataWithHigherPrecision).co2Series).toEqual(expectedTotals.co2e)
    })

    it('returns the sum of co2e rounded to the hundredths place', () => {
      expect(sumServiceTotals(dataWithHigherPrecision).wattHoursSeries).toEqual(expectedTotals.wattHours)
    })

    it('returns the sum of co2e rounded to the hundredths place', () => {
      expect(sumServiceTotals(dataWithHigherPrecision).costSeries).toEqual(expectedTotals.cost)
    })
  })
})
