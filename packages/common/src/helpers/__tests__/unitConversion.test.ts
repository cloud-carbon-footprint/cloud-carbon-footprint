/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  convertBytesToTerabytes,
  convertByteSecondsToTerabyteHours,
  convertBytesToGigabytes,
  convertGigabyteHoursToTerabyteHours,
  convertGigabyteMonthsToTerabyteHours,
  convertGigaBytesToTerabyteHours,
  convertTerabytesToGigabytes,
} from '../unitConversion'

describe('Calculations helpers', () => {
  const usageAmount = 5
  const timestamp = new Date('2021-06-15')
  it('convert byteSeconds to terabyteHours', () => {
    const result = convertByteSecondsToTerabyteHours(usageAmount)
    expect(result).toEqual(1.2631870857957337e-15)
  })
  it('convert convert bytes to gigabytes', () => {
    const result = convertBytesToGigabytes(usageAmount)
    expect(result).toEqual(4.6566128730773926e-9)
  })
  it('convert convert byteHours to terabyteHours', () => {
    const result = convertBytesToTerabytes(usageAmount)
    expect(result).toEqual(4.547473508864641e-12)
  })
  it('convert convert gigabyteHours to terabyteHours', () => {
    const result = convertGigabyteHoursToTerabyteHours(usageAmount)
    expect(result).toEqual(0.005)
  })
  it('convert convert gigabyte months to terabyteHours', () => {
    const result = convertGigabyteMonthsToTerabyteHours(usageAmount, timestamp)
    expect(result).toEqual(3.6)
  })
  it('convert convert gigabyte months to terabyteHours with invalid timestamp', () => {
    const result = convertGigabyteMonthsToTerabyteHours(
      usageAmount,
      new Date(''),
    )
    expect(result).toEqual(3.6504000000000003)
  })
  it('convert convert terabytes to gigabytes', () => {
    const result = convertTerabytesToGigabytes(usageAmount)
    expect(result).toEqual(5000)
  })
  it('convert gigaBytes to terabyteHours', () => {
    const result = convertGigaBytesToTerabyteHours(usageAmount)
    expect(result).toEqual(0.12)
  })
})
