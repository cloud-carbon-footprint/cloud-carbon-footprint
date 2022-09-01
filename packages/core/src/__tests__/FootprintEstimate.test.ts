/*
 * © 2021 Thoughtworks, Inc.
 */

import FootprintEstimate, {
  accumulateKilowattHours,
  AccumulateKilowattHoursBy,
  aggregateEstimatesByDay,
  appendOrAccumulateEstimatesByDay,
  estimateCo2,
  getWattsByAverageOrMedian,
  MutableServiceEstimate,
} from '../FootprintEstimate'
import BillingDataRow from '../BillingDataRow'
import { COMPUTE_PROCESSOR_TYPES } from '../compute'
import { GroupBy } from '@cloud-carbon-footprint/common'
import each from 'jest-each'
import {
  accumulateKilowattHoursPerCostData,
  accumulateKilowattHoursPerUsageAmount,
} from './fixtures/footprintEstimate.fixtures'

describe('FootprintEstimate', () => {
  const dayOne = new Date('2021-01-01')
  const dayTwo = new Date('2021-01-02')
  const grouping = GroupBy.day

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
    const tagNames = ['Environment']

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
            accountId: 'test account id',
            accountName: 'test-account',
            region: 'us-east1',
            cost: 5,
            tags: {
              Environment: 'prod',
            },
          },
        ],
        periodStartDate: dayOne,
        periodEndDate: new Date('2021-01-01T23:59:59.000Z'),
        groupBy: GroupBy.day,
      },
    ]

    const billingDataRowOne: BillingDataRow = {
      timestamp: dayOne,
      accountId: 'test account id',
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
      instanceType: 'test',
      replicationFactor: 1,
      tags: {
        Environment: 'prod',
      },
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
      grouping,
      tagNames,
    )

    // then - accumulate
    const accumulatedServicesEstimate: MutableServiceEstimate = {
      accountId: 'test account id',
      accountName: 'test-account',
      cloudProvider: 'GCP',
      co2e: 0.000002595030070637751,
      cost: 15,
      kilowattHours: 0.005190060141275502,
      region: 'us-east1',
      serviceName: 'App Engine',
      usesAverageCPUConstant: false,
      tags: {
        Environment: 'prod',
      },
    }
    const newResultOne = [
      {
        timestamp: dayOne,
        periodStartDate: new Date('2021-01-01T00:00:00.000Z'),
        periodEndDate: new Date('2021-01-01T23:59:59.000Z'),
        groupBy: grouping,
        serviceEstimates: [accumulatedServicesEstimate],
      },
    ]
    expect(results).toEqual(newResultOne)

    // given - append
    const billingDataRowTwo: BillingDataRow = {
      timestamp: dayTwo,
      accountId: 'test account id',
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
      instanceType: 'test',
      replicationFactor: 1,
      tags: {
        Environment: 'prod',
      },
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
      grouping,
      tagNames,
    )
    // then - append
    const newResultTwo = [
      {
        timestamp: dayOne,
        serviceEstimates: [accumulatedServicesEstimate],
        groupBy: grouping,
        periodEndDate: new Date('2021-01-01T23:59:59.000Z'),
        periodStartDate: new Date('2021-01-01T00:00:00.000Z'),
      },
      {
        timestamp: dayTwo,
        serviceEstimates: [
          {
            cloudProvider: 'GCP',
            usesAverageCPUConstant: false,
            serviceName: 'App Engine',
            accountId: 'test account id',
            accountName: 'test-account',
            region: 'us-east1',
            co2e: 3.438689659573138e-8,
            cost: 10,
            kilowattHours: 0.00006877379319146276,
            tags: {
              Environment: 'prod',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2021-01-02T23:59:59.000Z'),
        periodStartDate: new Date('2021-01-02T00:00:00.000Z'),
      },
    ]
    expect(results).toEqual(newResultTwo)

    // given - append
    const billingDataRowThree: BillingDataRow = {
      timestamp: dayTwo,
      accountId: 'test account id 2',
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
      instanceType: 'test',
      replicationFactor: 1,
      tags: {
        Environment: 'prod',
      },
    }

    const footPrintEstimateThree: FootprintEstimate = {
      usesAverageCPUConstant: false,
      timestamp: dayTwo,
      kilowattHours: 0.00006877379319146276,
      co2e: 3.438689659573138e-8,
    }
    // when - accumulate
    appendOrAccumulateEstimatesByDay(
      results,
      billingDataRowThree,
      footPrintEstimateThree,
      grouping,
      tagNames,
    )
    // then - append
    const newResultThree = [
      {
        timestamp: dayOne,
        serviceEstimates: [accumulatedServicesEstimate],
        groupBy: grouping,
        periodEndDate: new Date('2021-01-01T23:59:59.000Z'),
        periodStartDate: new Date('2021-01-01T00:00:00.000Z'),
      },
      {
        timestamp: dayTwo,
        serviceEstimates: [
          {
            cloudProvider: 'GCP',
            usesAverageCPUConstant: false,
            serviceName: 'App Engine',
            accountId: 'test account id',
            accountName: 'test-account',
            region: 'us-east1',
            co2e: 3.438689659573138e-8,
            cost: 10,
            kilowattHours: 0.00006877379319146276,
            tags: {
              Environment: 'prod',
            },
          },
          {
            cloudProvider: 'GCP',
            usesAverageCPUConstant: false,
            serviceName: 'App Engine',
            accountId: 'test account id 2',
            accountName: 'test-account',
            region: 'us-east1',
            co2e: 3.438689659573138e-8,
            cost: 10,
            kilowattHours: 0.00006877379319146276,
            tags: {
              Environment: 'prod',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2021-01-02T23:59:59.000Z'),
        periodStartDate: new Date('2021-01-02T00:00:00.000Z'),
      },
    ]
    expect(results).toEqual(newResultThree)

    // given - append
    const billingDataRowFour: BillingDataRow = {
      timestamp: dayTwo,
      accountId: 'test account id 2',
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
      instanceType: 'test',
      replicationFactor: 1,
      tags: {
        Environment: 'staging',
      },
    }

    const footPrintEstimateFour: FootprintEstimate = {
      usesAverageCPUConstant: false,
      timestamp: dayTwo,
      kilowattHours: 0.00006877379319146276,
      co2e: 3.438689659573138e-8,
    }
    // when - accumulate
    appendOrAccumulateEstimatesByDay(
      results,
      billingDataRowFour,
      footPrintEstimateFour,
      grouping,
      tagNames,
    )
    // then - append
    const newResultFour = [
      {
        timestamp: dayOne,
        serviceEstimates: [accumulatedServicesEstimate],
        groupBy: grouping,
        periodEndDate: new Date('2021-01-01T23:59:59.000Z'),
        periodStartDate: new Date('2021-01-01T00:00:00.000Z'),
      },
      {
        timestamp: dayTwo,
        serviceEstimates: [
          {
            cloudProvider: 'GCP',
            usesAverageCPUConstant: false,
            serviceName: 'App Engine',
            accountId: 'test account id',
            accountName: 'test-account',
            region: 'us-east1',
            co2e: 3.438689659573138e-8,
            cost: 10,
            kilowattHours: 0.00006877379319146276,
            tags: {
              Environment: 'prod',
            },
          },
          {
            cloudProvider: 'GCP',
            usesAverageCPUConstant: false,
            serviceName: 'App Engine',
            accountId: 'test account id 2',
            accountName: 'test-account',
            region: 'us-east1',
            co2e: 3.438689659573138e-8,
            cost: 10,
            kilowattHours: 0.00006877379319146276,
            tags: {
              Environment: 'prod',
            },
          },
          {
            cloudProvider: 'GCP',
            usesAverageCPUConstant: false,
            serviceName: 'App Engine',
            accountId: 'test account id 2',
            accountName: 'test-account',
            region: 'us-east1',
            co2e: 3.438689659573138e-8,
            cost: 10,
            kilowattHours: 0.00006877379319146276,
            tags: {
              Environment: 'staging',
            },
          },
        ],
        groupBy: grouping,
        periodEndDate: new Date('2021-01-02T23:59:59.000Z'),
        periodStartDate: new Date('2021-01-02T00:00:00.000Z'),
      },
    ]
    expect(results).toEqual(newResultFour)
  })

  describe('accumulateKilowattHours by cost', () => {
    each(accumulateKilowattHoursPerCostData).it(
      'kilowatt hours and cost totals per service and usage unit',
      (
        kilowattHoursByServiceAndUsageUnit,
        billingDataRow,
        kilowattHours,
        expectedResult,
      ) => {
        accumulateKilowattHours(
          kilowattHoursByServiceAndUsageUnit,
          billingDataRow,
          kilowattHours,
          AccumulateKilowattHoursBy.COST,
        )
        expect(kilowattHoursByServiceAndUsageUnit).toEqual(expectedResult)
      },
    )
  })

  describe('accumulateKilowattHours by usage amount', () => {
    each(accumulateKilowattHoursPerUsageAmount).it(
      'kilowatt hours and cost totals per service and usage unit',
      (
        kilowattHoursByServiceAndUsageUnit,
        billingDataRow,
        kilowattHours,
        expectedResult,
      ) => {
        accumulateKilowattHours(
          kilowattHoursByServiceAndUsageUnit,
          billingDataRow,
          kilowattHours,
          AccumulateKilowattHoursBy.USAGE_AMOUNT,
        )
        expect(kilowattHoursByServiceAndUsageUnit).toEqual(expectedResult)
      },
    )
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
  })

  describe('estimateCo2', () => {
    const emissionsFactors = {
      testRegion: 2,
      Unknown: 3,
    }
    it('estimates CO2e for known region', () => {
      const result = estimateCo2(2, 'testRegion', emissionsFactors)
      expect(result).toEqual(4)
    })

    it('estimates CO2e for unknown region', () => {
      const result = estimateCo2(2, 'someRegion', emissionsFactors)
      expect(result).toEqual(6)
    })
  })
})
