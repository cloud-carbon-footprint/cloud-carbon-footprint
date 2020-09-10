import { sumCO2, sumCO2ByService, transformData } from './transformData'

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
        cost: 0,
        region: 'us-east-1',
      },
      {
        timestamp: date1,
        serviceName: 'ec2',
        wattHours: 4,
        co2e: 5,
        cost: 0,
        region: 'us-east-1',
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
        cost: 0,
        region: 'us-east-1',
      },
      {
        timestamp: date2,
        serviceName: 'ec2',
        wattHours: 2,
        co2e: 7,
        cost: 0,
        region: 'us-east-1',
      },
    ],
  },
]

describe('transformData', () => {
  it('returns the sum of co2e for all services', () => {
    const expected = [
      { x: date1, y: 20 },
      { x: date2, y: 10 },
    ]
    expect(transformData(data)).toEqual(expected)
  })

  it('returns the sum of CO2 per service', () => {
    const expected = { ebs: 18, ec2: 12 }
    expect(sumCO2ByService(data)).toEqual(expected)
  })

  it('returns the sum of CO2 kg and gallons', () => {
    const expected = 30
    expect(sumCO2(data)).toEqual(expected)
  })
})
