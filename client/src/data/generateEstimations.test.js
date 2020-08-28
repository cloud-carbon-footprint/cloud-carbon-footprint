import generateData from './jsonGenerator'
import moment from 'moment'

test('should generate data up to one month prior', () => {
    const today = moment.utc().hours(0).minutes(0).seconds(0).millisecond(0)
    const result = JSON.parse(generateData(today, 1))

    expect(result.footprint.length).toEqual(2)
    expect(result.footprint[0].timestamp).toBe(today.toISOString())
    expect(result.footprint[1].timestamp).toBe(today.clone().subtract(1, 'M').toISOString())
})

test('should generate three months of data', () => {
    const today = moment.utc().hours(0).minutes(0).seconds(0).millisecond(0)
    const result = JSON.parse(generateData(today, 3))

    expect(result.footprint.length).toEqual(4)
    expect(result.footprint[0].timestamp).toBe(today.toISOString())
    expect(result.footprint[1].timestamp).toBe(today.clone().subtract(1, 'M').toISOString())
    expect(result.footprint[2].timestamp).toBe(today.clone().subtract(2, 'M').toISOString())
    expect(result.footprint[3].timestamp).toBe(today.clone().subtract(3, 'M').toISOString())
})

