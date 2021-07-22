/*
 * © 2021 Thoughtworks, Inc.
 */
import { MetricDataResult } from 'aws-sdk/clients/cloudwatch'

import ComputeUsage, {
  buildComputeUsages,
  extractRawComputeUsages,
  RawComputeUsage,
} from '../ComputeUsage'
import CloudConstants from '../../CloudConstantsTypes'

describe('ComputeUsage', () => {
  const dayOneHourOne = '2020-07-10T22:00:00.000Z'
  const dayTwoHourOne = '2020-07-11T00:00:00.000Z'
  const dayTwoHourTwo = '2020-07-11T01:00:00.000Z'

  it('buildComputeUsages', () => {
    // given
    const rawComputeUsages: RawComputeUsage[] = [
      {
        timestamp: dayOneHourOne,
        id: 'cpuUtilization',
        value: 31.435897435897434,
      },
      {
        timestamp: dayOneHourOne,
        id: 'cpuUtilization',
        value: 11.576923076923077,
      },
      {
        timestamp: dayTwoHourOne,
        id: 'cpuUtilization',
        value: 9.716666666666667,
      },
      {
        timestamp: dayTwoHourTwo,
        id: 'cpuUtilization',
        value: 20.46153846153846,
      },
      {
        timestamp: dayOneHourOne,
        id: 'cpuUtilization',
        value: 9.63265306122449,
      },
      {
        timestamp: dayTwoHourOne,
        id: 'cpuUtilization',
        value: 13.083333333333334,
      },
      {
        timestamp: dayTwoHourTwo,
        id: 'cpuUtilization',
        value: 32.44444444444444,
      },
      {
        timestamp: dayTwoHourTwo,
        id: 'cpuUtilization',
        value: 10.26923076923077,
      },
      {
        timestamp: dayTwoHourTwo,
        id: 'cpuUtilization',
        value: 9.75,
      },
      {
        timestamp: dayOneHourOne,
        id: 'cpuUtilization',
        value: 24.25,
      },
      { timestamp: dayOneHourOne, id: 'vCPUs', value: 4.5 },
      { timestamp: dayTwoHourOne, id: 'vCPUs', value: 4 },
      {
        timestamp: dayTwoHourTwo,
        id: 'vCPUs',
        value: 4.333333333333333,
      },
    ]

    const cloudConstants: CloudConstants = {
      avgCpuUtilization: 50,
    }

    // when
    const result = buildComputeUsages(rawComputeUsages, cloudConstants)

    // then
    const expectedResult: ComputeUsage[] = [
      {
        cpuUtilizationAverage: 19.22386839351125,
        numberOfvCpus: 4.5,
        timestamp: new Date(dayOneHourOne),
        usesAverageCPUConstant: false,
      },
      {
        cpuUtilizationAverage: 11.4,
        numberOfvCpus: 4,
        timestamp: new Date(dayTwoHourOne),
        usesAverageCPUConstant: false,
      },
      {
        cpuUtilizationAverage: 18.231303418803417,
        numberOfvCpus: 4.333333333333333,
        timestamp: new Date(dayTwoHourTwo),
        usesAverageCPUConstant: false,
      },
    ]

    expect(result).toEqual(expectedResult)
  })

  it('buildComputeUsages using cloud constant for average CPOU Utilization', () => {
    const rawComputeUsages: RawComputeUsage[] = [
      { timestamp: dayOneHourOne, id: 'vCPUs', value: 4.5 },
    ]

    const cloudConstants: CloudConstants = {
      avgCpuUtilization: 50,
    }

    const result = buildComputeUsages(rawComputeUsages, cloudConstants)

    const expectedResults = [
      {
        cpuUtilizationAverage: 50,
        numberOfvCpus: 4.5,
        timestamp: new Date(dayOneHourOne),
        usesAverageCPUConstant: true,
      },
    ]
    expect(result).toEqual(expectedResults)
  })

  it('extractRawComputeUsages', () => {
    const testMetricId = 'test-metric-id'
    const metricDataResult: MetricDataResult = {
      Id: testMetricId,
      Timestamps: [new Date('2021-01-01'), new Date('2021-01-02')],
      Values: [10, 20],
    }
    const result = extractRawComputeUsages(metricDataResult)

    const expectedResults: RawComputeUsage[] = [
      { id: testMetricId, timestamp: '2021-01-01T00:00:00.000Z', value: 10 },
      { id: testMetricId, timestamp: '2021-01-02T00:00:00.000Z', value: 20 },
    ]

    expect(result).toEqual(expectedResults)
  })
})
