/*
 * © 2021 Thoughtworks, Inc.
 */

import { renderHook } from '@testing-library/react-hooks'
import {
  mockData,
  mockDataWithHigherPrecision,
  mockDataWithUnknownsAWS,
  mockDataWithUnknownsGCP,
  mockRecommendationData,
} from '../data'
import {
  calculatePercentChange,
  tableFormatNearZero,
  formattedNumberWithCommas,
  sumCO2ByServiceOrRegion,
  sumEstimates,
  sumRecommendations,
  sumServiceTotals,
  useFilterDataFromEstimates,
  useFilterDataFromRecommendations,
  tableFormatRawCo2e,
} from './transformData'
import {
  mockDataWithSmallNumbers,
  mockEmissionsAndRecommendations,
  mockEmissionsAndRecommendationsWithUnknowns,
} from '../data/mockData'
import { Co2eUnit, UnknownTypes } from '../../Types'
import each from 'jest-each'

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
    expect(sumEstimates(mockData, 'co2e')).toEqual(expected)
  })

  it('returns the sum of CO2 metric tons and gallons', () => {
    const expected = 3.779
    expect(sumRecommendations(mockRecommendationData, 'co2eSavings')).toEqual(
      expected,
    )
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

  it('extracts account names, regions, and recommendation types from recommendation data', () => {
    const { result } = renderHook(() =>
      useFilterDataFromRecommendations(mockEmissionsAndRecommendations),
    )

    const expectedResult = {
      accounts: [
        { cloudProvider: 'aws', key: testAccountA, name: testAccountA },
        { cloudProvider: 'gcp', key: testAccountB, name: testAccountB },
        { cloudProvider: 'aws', key: testAccountB, name: testAccountB },
      ],
      regions: [
        { cloudProvider: 'aws', key: 'us-east-1', name: 'us-east-1' },
        { cloudProvider: 'gcp', key: 'us-east-1', name: 'us-east-1' },
        {
          cloudProvider: 'aws',
          key: 'us-west-1',
          name: 'us-west-1',
        },
        {
          cloudProvider: 'aws',
          key: 'us-west-2',
          name: 'us-west-2',
        },
      ],
      recommendationTypes: [
        {
          cloudProvider: 'aws',
          key: 'Modify',
          name: 'Modify',
        },
        {
          cloudProvider: 'aws',
          key: 'Terminate',
          name: 'Terminate',
        },
      ],
    }

    expect(result.current).toEqual(expectedResult)
  })

  it('extracts account names, regions, and recommendation types from recommendation data when unknown', () => {
    const { result } = renderHook(() =>
      useFilterDataFromRecommendations(
        mockEmissionsAndRecommendationsWithUnknowns,
      ),
    )

    const expectedResult = {
      accounts: [
        {
          cloudProvider: 'aws',
          key: 'test-a',
          name: 'test-a',
        },
        {
          cloudProvider: 'aws',
          key: UnknownTypes.UNKNOWN_ACCOUNT,
          name: UnknownTypes.UNKNOWN_ACCOUNT,
        },
        {
          cloudProvider: 'gcp',
          key: 'test-b',
          name: 'test-b',
        },
        {
          cloudProvider: 'gcp',
          key: 'Unknown Account',
          name: 'Unknown Account',
        },
      ],
      regions: [
        {
          cloudProvider: 'aws',
          key: 'unknown',
          name: 'unknown',
        },
        {
          cloudProvider: 'aws',
          key: 'us-east-1',
          name: 'us-east-1',
        },
        {
          cloudProvider: 'gcp',
          key: 'unknown',
          name: 'unknown',
        },
        {
          cloudProvider: 'gcp',
          key: 'us-east-1',
          name: 'us-east-1',
        },
        {
          cloudProvider: 'aws',
          key: UnknownTypes.UNKNOWN_REGION,
          name: UnknownTypes.UNKNOWN_REGION,
        },
      ],
      recommendationTypes: [
        {
          cloudProvider: 'aws',
          key: UnknownTypes.UNKNOWN_RECOMMENDATION_TYPE,
          name: UnknownTypes.UNKNOWN_RECOMMENDATION_TYPE,
        },
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
    it('returns the sum of co2e rounded to 4 decimal places', () => {
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
  describe('rounding with small numbers', () => {
    const expectedTotals = {
      co2e: [
        {
          x: date1,
          y: 0.000002469,
          usesAverageCPUConstant: false,
          kilowattHours: 0.0025,
          cost: 0.0025,
        },
        {
          x: date2,
          y: 0.000002469,
          usesAverageCPUConstant: true,
          kilowattHours: 0.0025,
          cost: 0.0025,
        },
      ],
      kilowattHours: [
        { x: date1, y: 0.0025 },
        { x: date2, y: 0.0025 },
      ],
      cost: [
        { x: date1, y: 0.0025 },
        { x: date2, y: 0.0025 },
      ],
    }
    it('returns the sum of co2e rounded to 4 digits showing', () => {
      expect(sumServiceTotals(mockDataWithSmallNumbers).co2Series).toEqual(
        expectedTotals.co2e,
      )
    })

    it('returns the sum of co2e rounded to the hundredths place', () => {
      expect(
        sumServiceTotals(mockDataWithSmallNumbers).kilowattHoursSeries,
      ).toEqual(expectedTotals.kilowattHours)
    })

    it('returns the sum of co2e rounded to the hundredths place', () => {
      expect(sumServiceTotals(mockDataWithSmallNumbers).costSeries).toEqual(
        expectedTotals.cost,
      )
    })

    it('calculates the percent change between two numbers', () => {
      expect(calculatePercentChange(100, 100)).toBe(0)
      expect(calculatePercentChange(100, 110)).toBe(-10)
      expect(calculatePercentChange(200, 275)).toBe(-37)
      expect(calculatePercentChange(100, 50)).toBe(50)
      expect(calculatePercentChange(200, 135)).toBe(33)
    })

    it('formats number to a string with commas and with a default decimal place of 2', () => {
      expect(formattedNumberWithCommas(1000000)).toBe('1,000,000')
      expect(formattedNumberWithCommas(100)).toBe('100')
      expect(formattedNumberWithCommas(1000000.20567)).toBe('1,000,000.21')
    })

    it('formats number to a string with commas and with provided decimal place', () => {
      expect(formattedNumberWithCommas(1000000.123456, 4)).toBe(
        '1,000,000.1235',
      )
    })
  })
})

describe('tableFormatNearZero', () => {
  const a = [
    [0, '0'],
    [0.0001, '< 0.001'],
    [0.00099, '0.001'],
    [0.001, '0.001'],
    [1, '1'],
  ]
  each(a).it(
    ' formats numbers near zero properly',
    (numericInput: number, expectedOutput: string) => {
      expect(tableFormatNearZero(numericInput)).toEqual(expectedOutput)
    },
  )
})

describe('tableFormatRawCo2e', () => {
  const a = [
    [0, Co2eUnit.MetricTonnes, '0'],
    [0, Co2eUnit.Kilograms, '0'],
    [0.0001, Co2eUnit.MetricTonnes, '< 0.001'],
    [0.0001, Co2eUnit.Kilograms, '0.1'],
    [0.00099, Co2eUnit.MetricTonnes, '0.001'],
    [0.00099, Co2eUnit.Kilograms, '0.99'],
    [1, Co2eUnit.MetricTonnes, '1'],
    [1, Co2eUnit.Kilograms, '1000'],
  ]
  each(a).it(
    ' formats Co2e properly',
    (numericInput: number, co2eUnit: Co2eUnit, expectedOutput: string) => {
      expect(tableFormatRawCo2e(co2eUnit, numericInput)).toEqual(expectedOutput)
    },
  )
})
