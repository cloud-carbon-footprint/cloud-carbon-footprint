/*
 * © 2021 ThoughtWorks, Inc.
 */

import FootprintEstimate, {
  aggregateEstimatesByDay,
  appendOrAccumulateEstimatesByDay,
  getCpuUtilizationAverage,
  getEmissionsFactors,
  getMinwatts,
  getMaxwatts,
  getPowerUsageEffectiveness,
  getWattsByAverageOrMedian,
  MutableServiceEstimate,
} from '../FootprintEstimate'
import BillingDataRow from '../BillingDataRow'
import { COMPUTE_PROCESSOR_TYPES } from '../compute'
import { CloudConstantsByProvider } from '../CloudConstantsTypes'

describe('FootprintEstimate', () => {
  const dayOne = new Date('2021-01-01')
  const dayTwo = new Date('2021-01-02')

  const region = 'us-east-1'
  const computeProcessors = ['unknown']
  const cloudConstants: CloudConstantsByProvider = {
    ...expect.anything(),
    getMinWatts: jest.fn().mockReturnValue(1.23),
    getMaxWatts: jest.fn().mockReturnValue(3.69),
    getPUE: jest.fn().mockReturnValue(1.185),
    AVG_CPU_UTILIZATION_2020: 50,
  }

  const cloudEmissionsFactors = {
    [region]: 0.000415755,
  }

  it('aggregateEstimatesByDay', () => {
    // given
    const footprintEstimates: FootprintEstimate[] = [
      {
        timestamp: dayOne,
        kilowattHours: 20,
        co2e: 2,
        usesAverageCPUConstant: true,
      },
      {
        timestamp: dayOne,
        kilowattHours: 25,
        co2e: 4,
        usesAverageCPUConstant: false,
      },
      {
        timestamp: dayOne,
        kilowattHours: 40,
        co2e: 10,
        usesAverageCPUConstant: true,
      },
      {
        timestamp: dayTwo,
        kilowattHours: 15,
        co2e: 0.3,
        usesAverageCPUConstant: false,
      },
      {
        timestamp: dayTwo,
        kilowattHours: 60,
        co2e: 7,
        usesAverageCPUConstant: false,
      },
    ]
    // when
    const result = aggregateEstimatesByDay(footprintEstimates)

    // then
    const expectedResult = {
      '2021-01-01': {
        co2e: 16,
        kilowattHours: 85,
        timestamp: dayOne,
        usesAverageCPUConstant: true,
      },
      '2021-01-02': {
        co2e: 7.3,
        kilowattHours: 75,
        timestamp: dayTwo,
        usesAverageCPUConstant: false,
      },
    }
    expect(result).toEqual(expectedResult)
  })

  it('appendOrAccumulateEstimatesByDay', () => {
    // given - accumulate
    const results = [
      {
        timestamp: dayOne,
        serviceEstimates: [
          {
            cloudProvider: 'GCP',
            kilowattHours: 0.00512128634808404,
            co2e: 0.00000256064317404202,
            usesAverageCPUConstant: false,
            serviceName: 'App Engine',
            accountName: 'test-account',
            region: 'us-east1',
            cost: 5,
          },
        ],
      },
    ]

    const billingDataRowOne: BillingDataRow = {
      timestamp: dayOne,
      accountName: 'test-account',
      region: 'us-east1',
      usageType: 'test',
      usageUnit: 'test',
      vCpus: undefined,
      machineType: 'test',
      seriesName: 'test',
      serviceName: 'App Engine',
      usageAmount: 380040914534400,
      cost: 10,
      cloudProvider: 'GCP',
      vCpuHours: 105566920704,
    }

    const footPrintEstimateOne: FootprintEstimate = {
      usesAverageCPUConstant: false,
      timestamp: dayOne,
      kilowattHours: 0.00006877379319146276,
      co2e: 3.438689659573138e-8,
    }

    // when - accumulate
    appendOrAccumulateEstimatesByDay(
      results,
      billingDataRowOne,
      footPrintEstimateOne,
    )

    // then - accumulate
    const accumulatedServicesEstimate: MutableServiceEstimate = {
      accountName: 'test-account',
      cloudProvider: 'GCP',
      co2e: 0.000002595030070637751,
      cost: 15,
      kilowattHours: 0.005190060141275502,
      region: 'us-east1',
      serviceName: 'App Engine',
      usesAverageCPUConstant: false,
    }
    const newResultOne = [
      {
        timestamp: dayOne,
        serviceEstimates: [accumulatedServicesEstimate],
      },
    ]
    expect(results).toEqual(newResultOne)

    // given - append
    const billingDataRowTwo: BillingDataRow = {
      timestamp: dayTwo,
      accountName: 'test-account',
      region: 'us-east1',
      serviceName: 'App Engine',
      usageType: 'test',
      usageUnit: 'test',
      vCpus: undefined,
      machineType: 'test',
      seriesName: 'test',
      usageAmount: 380040914534400,
      cost: 10,
      cloudProvider: 'GCP',
      vCpuHours: 105566920704,
    }

    const footPrintEstimateTwo: FootprintEstimate = {
      usesAverageCPUConstant: false,
      timestamp: dayTwo,
      kilowattHours: 0.00006877379319146276,
      co2e: 3.438689659573138e-8,
    }
    // when - accumulate
    appendOrAccumulateEstimatesByDay(
      results,
      billingDataRowTwo,
      footPrintEstimateTwo,
    )
    // then - append
    const newResultTwo = [
      {
        timestamp: dayOne,
        serviceEstimates: [accumulatedServicesEstimate],
      },
      {
        timestamp: dayTwo,
        serviceEstimates: [
          {
            cloudProvider: 'GCP',
            usesAverageCPUConstant: false,
            serviceName: 'App Engine',
            accountName: 'test-account',
            region: 'us-east1',
            co2e: 3.438689659573138e-8,
            cost: 10,
            kilowattHours: 0.00006877379319146276,
          },
        ],
      },
    ]
    expect(results).toEqual(newResultTwo)
  })

  describe('getWattsByAverageOrMedian', () => {
    it('returns median', () => {
      // given
      const computeProcessors: string[] = [COMPUTE_PROCESSOR_TYPES.SANDY_BRIDGE]
      const wattsForProcessors: number[] = [1, 2, 3, 4, 5]
      // when

      const result = getWattsByAverageOrMedian(
        computeProcessors,
        wattsForProcessors,
      )

      // then
      expect(result).toEqual(3)
    })
    it('returns 0 with no wattsForProcessors', () => {
      // given
      const computeProcessors: string[] = [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE]
      const wattsForProcessors: number[] = []
      // when

      const result = getWattsByAverageOrMedian(
        computeProcessors,
        wattsForProcessors,
      )

      // then
      expect(result).toEqual(0)
    })
    it('returns first watts with 1 wattsForProcessors', () => {
      // given
      const computeProcessors: string[] = [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE]
      const wattsForProcessors: number[] = [5]
      // when

      const result = getWattsByAverageOrMedian(
        computeProcessors,
        wattsForProcessors,
      )

      // then
      expect(result).toEqual(5)
    })
    it('returns mean watts with >1 wattsForProcessors', () => {
      // given
      const computeProcessors: string[] = [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE]
      const wattsForProcessors: number[] = [5, 7, 1, 4, 12, 20]
      // when

      const result = getWattsByAverageOrMedian(
        computeProcessors,
        wattsForProcessors,
      )

      // then
      expect(result).toEqual(8.166666666666666)
    })
    it('gets min watts', () => {
      const result = getMinwatts(computeProcessors, cloudConstants)
      expect(result).toEqual(1.23)
    })
    it('gets max watts', () => {
      const result = getMaxwatts(computeProcessors, cloudConstants)
      expect(result).toEqual(3.69)
    })
    it('gets power usage effectiveness', () => {
      const result = getPowerUsageEffectiveness(region, cloudConstants)
      expect(result).toEqual(1.185)
    })
    it('gets cpu utilization average', () => {
      const result = getCpuUtilizationAverage(cloudConstants)
      expect(result).toEqual(50)
    })
    it('gets emissions factors', () => {
      const expectedResult = { 'us-east-1': 0.000415755 }
      const result = getEmissionsFactors(cloudEmissionsFactors)
      expect(result).toEqual(expectedResult)
    })
  })
})
