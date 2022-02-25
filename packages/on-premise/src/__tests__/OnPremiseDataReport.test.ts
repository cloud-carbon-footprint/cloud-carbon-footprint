/*
 * © 2021 Thoughtworks, Inc.
 */

import { ComputeEstimator, MemoryEstimator } from '@cloud-carbon-footprint/core'

import {
  OnPremiseDataInput,
  OnPremiseDataOutput,
  configLoader,
} from '@cloud-carbon-footprint/common'

import { OnPremiseDataReport } from '../lib'
import { ON_PREMISE_CLOUD_CONSTANTS } from '../domain'

jest.mock('@cloud-carbon-footprint/common', () => ({
  ...(jest.requireActual('@cloud-carbon-footprint/common') as Record<
    string,
    unknown
  >),
  configLoader: jest.fn().mockImplementation(() => {
    return {
      ON_PREMISE: {
        SERVER: {
          CPU_UTILIZATION: undefined,
          AVERAGE_WATTS: undefined,
        },
        LAPTOP: {
          CPU_UTILIZATION: undefined,
          AVERAGE_WATTS: undefined,
        },
        DESKTOP: {
          CPU_UTILIZATION: undefined,
          AVERAGE_WATTS: undefined,
        },
      },
    }
  }),
}))

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
        usageHours: 172,
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
        usageHours: 172,
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimates with configured serverUtilization and pue with US region', () => {
    const newMockDataInput = [
      {
        ...mockDataInput[0],
      },
    ]
    newMockDataInput[0].memory = 1350690
    newMockDataInput[0].cpuUtilization = 45
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
        cpuUtilization: 45,
        powerUsageEffectiveness: 1.45,
        co2e: 0.062382491692975564,
        kilowattHours: 150.565967592623,
        usageHours: 172,
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Estimates use average values for region, memory and watts as default', () => {
    const newMockDataInput: OnPremiseDataInput[] = [
      {
        cpuId: 'Intel(R) Xeon(R) Amber 4114 CPU @ 2.20GHz',
        memory: 1350690,
        machineType: 'server',
        startTime: new Date('2022-01-17T13:38:18Z'),
        endTime: new Date('2022-01-24T18:22:29.918423Z'),
      },
    ]

    const onPremiseDataReport = new OnPremiseDataReport(
      new ComputeEstimator(),
      new MemoryEstimator(ON_PREMISE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
    )

    const result = onPremiseDataReport.getEstimates(newMockDataInput)

    const expectedResult: OnPremiseDataOutput[] = [
      {
        cpuId: 'Intel(R) Xeon(R) Amber 4114 CPU @ 2.20GHz',
        memory: 1350690,
        machineType: 'server',
        startTime: new Date('2022-01-17T13:38:18Z'),
        endTime: new Date('2022-01-24T18:22:29.918423Z'),
        co2e: 0.04691537675108586,
        kilowattHours: 145.3246388784467,
        usageHours: 172,
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimates with configured serverUtilization and pue with US region', () => {
    const newMockDataInput = [
      {
        ...mockDataInput[0],
      },
    ]
    newMockDataInput[0].memory = 1350690
    newMockDataInput[0].cpuUtilization = 45
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
        cpuUtilization: 45,
        powerUsageEffectiveness: 1.45,
        co2e: 0.062382491692975564,
        kilowattHours: 150.565967592623,
        usageHours: 172,
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('uses default configurable values when machineType is invalid', () => {
    const newMockDataInput: OnPremiseDataInput[] = [
      {
        cpuId: 'Intel(R) Xeon(R) Amber 4114 CPU @ 2.20GHz',
        memory: 1350690,
        machineType: 'invalid',
        startTime: new Date('2022-01-17T13:38:18Z'),
        endTime: new Date('2022-01-24T18:22:29.918423Z'),
      },
    ]

    const onPremiseDataReport = new OnPremiseDataReport(
      new ComputeEstimator(),
      new MemoryEstimator(ON_PREMISE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
    )

    const result = onPremiseDataReport.getEstimates(newMockDataInput)

    const expectedResult: OnPremiseDataOutput[] = [
      {
        cpuId: 'Intel(R) Xeon(R) Amber 4114 CPU @ 2.20GHz',
        memory: 1350690,
        machineType: 'invalid',
        startTime: new Date('2022-01-17T13:38:18Z'),
        endTime: new Date('2022-01-24T18:22:29.918423Z'),
        co2e: 0.04691537675108586,
        kilowattHours: 145.3246388784467,
        usageHours: 172,
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it.each([
    [
      ['server', 'laptop', 'desktop'],
      45,
      undefined,
      0.03866408939623999,
      91.20179599999999,
    ],
    [['server', 'laptop', 'desktop'], undefined, 350, 0.0357296632, 84.28],
    [
      ['laptop', 'server', 'desktop'],
      75,
      undefined,
      0.05838992602519999,
      137.73157999999998,
    ],
    [
      ['laptop', 'server', 'desktop'],
      undefined,
      250,
      0.025521187999999997,
      60.199999999999996,
    ],
    [
      ['desktop', 'server', 'laptop'],
      60,
      undefined,
      0.048527007710719994,
      114.46668799999999,
    ],
    [
      ['desktop', 'server', 'laptop'],
      undefined,
      300,
      0.030625425599999995,
      72.24,
    ],
  ])(
    'it should configured values for averageWatts or cpuUtilization by machineType',
    (
      machineType: string[],
      cpuUtilization: number | undefined,
      averageWatts: number | undefined,
      co2e: number,
      kwh: number,
    ) => {
      ;(configLoader as jest.Mock).mockReturnValue({
        ON_PREMISE: {
          [machineType[0].toUpperCase()]: {
            CPU_UTILIZATION: cpuUtilization,
            AVERAGE_WATTS: averageWatts,
          },
          [machineType[1].toUpperCase()]: {
            CPU_UTILIZATION: undefined,
            AVERAGE_WATTS: undefined,
          },
          [machineType[2].toUpperCase()]: {
            CPU_UTILIZATION: undefined,
            AVERAGE_WATTS: undefined,
          },
        },
      })

      const newMockDataInput = [
        {
          ...mockDataInput[0],
        },
      ]
      newMockDataInput[0].machineType = machineType[0]

      const onPremiseDataReport = new OnPremiseDataReport(
        new ComputeEstimator(),
        new MemoryEstimator(ON_PREMISE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      )

      const result = onPremiseDataReport.getEstimates(newMockDataInput)

      const expectedResult: OnPremiseDataOutput[] = [
        {
          cpuId: 'Intel(R) Xeon(R) Silver 4114 CPU @ 2.20GHz',
          memory: 130690,
          machineType: machineType[0],
          startTime: new Date('2022-01-17T13:38:18Z'),
          endTime: new Date('2022-01-24T18:22:29.918423Z'),
          country: 'United States',
          co2e: co2e,
          kilowattHours: kwh,
          usageHours: 172,
        },
      ]
      expect(result).toEqual(expectedResult)
    },
  )
})
