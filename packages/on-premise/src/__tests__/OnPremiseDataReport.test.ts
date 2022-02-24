/*
 * © 2021 Thoughtworks, Inc.
 */

import { ComputeEstimator, MemoryEstimator } from '@cloud-carbon-footprint/core'

import {
  Logger,
  OnPremiseDataInput,
  OnPremiseDataOutput,
} from '@cloud-carbon-footprint/common'

import { OnPremiseDataReport } from '../lib'
import { ON_PREMISE_CLOUD_CONSTANTS } from '../domain'

const consoleWarnSpy = jest.spyOn(Logger.prototype, 'warn')

const mockDataInput: OnPremiseDataInput[] = [
  {
    cpuId: 'Intel(R) Xeon(R) Silver 4114 CPU @ 2.20GHz',
    memory: 130690,
    machineType: 'server',
    startTime: new Date('2022-01-17T13:38:18Z'),
    endTime: new Date('2022-01-24T18:22:29.918423Z'),
    country: 'United States',
  },
]

describe('On-Premise Data Report', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('Returns estimates for Compute', () => {
    const onPremiseDataReport = new OnPremiseDataReport(
      new ComputeEstimator(),
      new MemoryEstimator(ON_PREMISE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
    )

    const result = onPremiseDataReport.getEstimates(mockDataInput)

    const expectedResult: OnPremiseDataOutput[] = [
      {
        cpuId: 'Intel(R) Xeon(R) Silver 4114 CPU @ 2.20GHz',
        memory: 130690,
        machineType: 'server',
        startTime: new Date('2022-01-17T13:38:18Z'),
        endTime: new Date('2022-01-24T18:22:29.918423Z'),
        country: 'United States',
        co2e: 0.0419517288344,
        kilowattHours: 98.95676,
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimates for Compute + Memory', () => {
    const newMockDataInput = [
      {
        ...mockDataInput[0],
      },
    ]
    newMockDataInput[0].memory = 1350690
    const onPremiseDataReport = new OnPremiseDataReport(
      new ComputeEstimator(),
      new MemoryEstimator(ON_PREMISE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
    )

    const result = onPremiseDataReport.getEstimates(newMockDataInput)

    const expectedResult: OnPremiseDataOutput[] = [
      {
        cpuId: 'Intel(R) Xeon(R) Silver 4114 CPU @ 2.20GHz',
        memory: 1350690,
        machineType: 'server',
        startTime: new Date('2022-01-17T13:38:18Z'),
        endTime: new Date('2022-01-24T18:22:29.918423Z'),
        country: 'United States',
        co2e: 0.06491750897036913,
        kilowattHours: 153.129001675636,
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns no estimates when machineType is invalid', () => {
    const newMockDataInput = [
      {
        ...mockDataInput[0],
      },
    ]
    newMockDataInput[0].machineType = 'invalid'

    const onPremiseDataReport = new OnPremiseDataReport(
      new ComputeEstimator(),
      new MemoryEstimator(ON_PREMISE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
    )

    const result = onPremiseDataReport.getEstimates(newMockDataInput)

    const expectedResult: OnPremiseDataOutput[] = [
      {
        cpuId: 'Intel(R) Xeon(R) Silver 4114 CPU @ 2.20GHz',
        memory: 130690,
        machineType: 'invalid',
        startTime: new Date('2022-01-17T13:38:18Z'),
        endTime: new Date('2022-01-24T18:22:29.918423Z'),
        country: 'United States',
        co2e: 0,
        kilowattHours: 0,
      },
    ]
    expect(result).toEqual(expectedResult)
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Unsupported machine type: invalid',
    )
  })

  it('Returns estimates with configured serverUtilization and pue with US region', () => {
    const newMockDataInput = [
      {
        ...mockDataInput[0],
      },
    ]
    newMockDataInput[0].memory = 1350690
    newMockDataInput[0].serverUtilization = 45
    newMockDataInput[0].powerUsageEffectiveness = 1.45
    newMockDataInput[0].region = 'Texas'

    const onPremiseDataReport = new OnPremiseDataReport(
      new ComputeEstimator(),
      new MemoryEstimator(ON_PREMISE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
    )

    const result = onPremiseDataReport.getEstimates(newMockDataInput)

    const expectedResult: OnPremiseDataOutput[] = [
      {
        cpuId: 'Intel(R) Xeon(R) Silver 4114 CPU @ 2.20GHz',
        memory: 1350690,
        machineType: 'server',
        startTime: new Date('2022-01-17T13:38:18Z'),
        endTime: new Date('2022-01-24T18:22:29.918423Z'),
        country: 'United States',
        region: 'Texas',
        serverUtilization: 45,
        powerUsageEffectiveness: 1.45,
        co2e: 0.062382491692975564,
        kilowattHours: 150.565967592623,
      },
    ]
    expect(result).toEqual(expectedResult)
  })
})
