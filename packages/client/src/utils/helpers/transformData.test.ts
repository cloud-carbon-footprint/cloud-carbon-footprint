/*
 * © 2021 ThoughtWorks, Inc.
 */

import { renderHook } from '@testing-library/react-hooks'
import {
  mockData,
  mockDataWithUnknownsAWS,
  mockDataWithHigherPrecision,
  mockDataWithUnknownsGCP,
} from '../data'
import {
  sumCO2,
  sumCO2ByServiceOrRegion,
  sumServiceTotals,
  useFilterDataFromEstimates,
} from './transformData'

const testAccountA = 'test-a'
const testAccountB = 'test-b'
const testAccountC = 'test-c'

const date1 = new Date('2020-07-10T00:00:00.000Z')
const date2 = new Date('2020-07-11T00:00:00.000Z')

describe('transformData', () => {
  it('returns the sum of CO2 per service', () => {
    const expected = { ebs: ['AWS', 18], ec2: ['AWS', 12] }
    expect(sumCO2ByServiceOrRegion(mockData, 'service')).toEqual(expected)
  })

  it('returns the sum of CO2 metric tons and gallons', () => {
    const expected = 30
    expect(sumCO2(mockData)).toEqual(expected)
  })

  it('extract account names from estimates data', async () => {
    const { result } = renderHook(() => useFilterDataFromEstimates(mockData))
    // then
    const expectedResult = {
      accounts: [
        { cloudProvider: 'aws', key: testAccountA, name: testAccountA },
        { cloudProvider: 'gcp', key: testAccountB, name: testAccountB },
        { cloudProvider: 'aws', key: testAccountC, name: testAccountC },
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
    const expectedAWS = {
      [testAccountA]: ['AWS', 6],
      'Unknown Account': ['AWS', 6],
    }
    const expectedGCP = {
      [testAccountB]: ['GCP', 6],
      'Unknown Account': ['GCP', 6],
    }
    expect(sumCO2ByServiceOrRegion(mockDataWithUnknownsAWS, 'account')).toEqual(
      expectedAWS,
    )
    expect(sumCO2ByServiceOrRegion(mockDataWithUnknownsGCP, 'account')).toEqual(
      expectedGCP,
    )
  })

  it('handles data with null service names', () => {
    const expectedAWS = {
      ec2: ['AWS', 6],
      'Unknown Service': ['AWS', 6],
    }
    const expectedGCP = {
      ebs: ['GCP', 6],
      'Unknown Service': ['GCP', 6],
    }
    expect(sumCO2ByServiceOrRegion(mockDataWithUnknownsAWS, 'service')).toEqual(
      expectedAWS,
    )
    expect(sumCO2ByServiceOrRegion(mockDataWithUnknownsGCP, 'service')).toEqual(
      expectedGCP,
    )
  })

  it('handles data with unknown regions', () => {
    const expectedAWS = {
      'us-east-1': ['AWS', 6],
      'Unknown Region': ['AWS', 6],
    }
    const expectedGCP = {
      'us-east-1': ['GCP', 6],
      'Unknown Region': ['GCP', 6],
    }
    expect(sumCO2ByServiceOrRegion(mockDataWithUnknownsAWS, 'region')).toEqual(
      expectedAWS,
    )
    expect(sumCO2ByServiceOrRegion(mockDataWithUnknownsGCP, 'region')).toEqual(
      expectedGCP,
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
    expect(sumServiceTotals(mockData).co2Series).toEqual(expectedCo2e)
  })

  it('returns the sum of kilowatt hours for all services', () => {
    const expectedWattHours = expectedTotals.kilowattHours
    expect(sumServiceTotals(mockData).kilowattHoursSeries).toEqual(
      expectedWattHours,
    )
  })

  it('returns the sum of cost for all services', () => {
    const expectedCost = expectedTotals.cost
    expect(sumServiceTotals(mockData).costSeries).toEqual(expectedCost)
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
      expect(sumServiceTotals(mockDataWithHigherPrecision).co2Series).toEqual(
        expectedTotals.co2e,
      )
    })

    it('returns the sum of co2e rounded to the hundredths place', () => {
      expect(
        sumServiceTotals(mockDataWithHigherPrecision).kilowattHoursSeries,
      ).toEqual(expectedTotals.kilowattHours)
    })

    it('returns the sum of co2e rounded to the hundredths place', () => {
      expect(sumServiceTotals(mockDataWithHigherPrecision).costSeries).toEqual(
        expectedTotals.cost,
      )
    })
  })
})
