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
    cpuDescription: 'Intel(R) Xeon(R) Silver 4114 CPU @ 2.20GHz',
    machineName: 'test-machine-name',
    memory: 127.626953125,
    machineType: 'server',
    startTime: new Date('2022-01-17T13:38:18Z'),
    endTime: new Date('2022-01-24T18:22:29.918423Z'),
    country: 'United States',
    cost: 93.12,
    dailyUptime: 4,
    weeklyUptime: 12,
    monthlyUptime: 36,
    annualUptime: 36,
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
        cpuDescription: 'Intel(R) Xeon(R) Silver 4114 CPU @ 2.20GHz',
        machineName: 'test-machine-name',
        memory: 127.626953125,
        machineType: 'server',
        startTime: new Date('2022-01-17T13:38:18Z'),
        endTime: new Date('2022-01-24T18:22:29.918423Z'),
        country: 'United States',
        cost: 93.12,
        dailyCo2e: 0.00110105866376,
        dailyKilowattHours: 2.597204,
        dailyUptime: 4,
        weeklyCo2e: 0.00330317599128,
        weeklyKilowattHours: 7.791612000000001,
        weeklyUptime: 12,
        monthlyCo2e: 0.009909527973840001,
        monthlyKilowattHours: 23.374836000000002,
        monthlyUptime: 36,
        annualCo2e: 0.009909527973840001,
        annualKilowattHours: 23.374836000000002,
        annualUptime: 36,
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
    newMockDataInput[0].memory = 1319.033203125
    const onPremiseDataReport = new OnPremiseDataReport(
      new ComputeEstimator(),
      new MemoryEstimator(ON_PREMISE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
    )

    const result = onPremiseDataReport.getEstimates(newMockDataInput)

    const expectedResult: OnPremiseDataOutput[] = [
      {
        cpuDescription: 'Intel(R) Xeon(R) Silver 4114 CPU @ 2.20GHz',
        machineName: 'test-machine-name',
        memory: 1319.033203125,
        machineType: 'server',
        startTime: new Date('2022-01-17T13:38:18Z'),
        endTime: new Date('2022-01-24T18:22:29.918423Z'),
        country: 'United States',
        cost: 93.12,
        dailyCo2e: 0.0017038150194880932,
        dailyKilowattHours: 4.0190003762044,
        dailyUptime: 4,
        weeklyCo2e: 0.00511144505846428,
        weeklyKilowattHours: 12.057001128613202,
        weeklyUptime: 12,
        monthlyCo2e: 0.01533433517539284,
        monthlyKilowattHours: 36.171003385839605,
        monthlyUptime: 36,
        annualCo2e: 0.01533433517539284,
        annualKilowattHours: 36.171003385839605,
        annualUptime: 36,
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
    newMockDataInput[0].memory = 1319.033203125
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
        cpuDescription: 'Intel(R) Xeon(R) Silver 4114 CPU @ 2.20GHz',
        machineName: 'test-machine-name',
        memory: 1319.033203125,
        machineType: 'server',
        startTime: new Date('2022-01-17T13:38:18Z'),
        endTime: new Date('2022-01-24T18:22:29.918423Z'),
        country: 'United States',
        cost: 93.12,
        powerUsageEffectiveness: 1.45,
        region: 'Texas',
        cpuUtilization: 45,
        dailyCo2e: 0.0014507556207668734,
        dailyKilowattHours: 3.501534130061,
        dailyUptime: 4,
        weeklyCo2e: 0.00435226686230062,
        weeklyKilowattHours: 10.504602390183,
        weeklyUptime: 12,
        monthlyCo2e: 0.013056800586901859,
        monthlyKilowattHours: 31.513807170548997,
        monthlyUptime: 36,
        annualCo2e: 0.013056800586901859,
        annualKilowattHours: 31.513807170548997,
        annualUptime: 36,
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Estimates using average values for region, memory and watts as default', () => {
    const newMockDataInput: OnPremiseDataInput[] = [
      {
        cpuDescription: 'Intel(R) Xeon(R) Amber 4114 CPU @ 2.20GHz',
        machineName: 'test-machine-name',
        memory: 1319.033203125,
        machineType: 'server',
        cost: 93.12,
        startTime: new Date('2022-01-17T13:38:18Z'),
        endTime: new Date('2022-01-24T18:22:29.918423Z'),
        dailyUptime: 4,
        weeklyUptime: 12,
        monthlyUptime: 36,
        annualUptime: 36,
      },
    ]

    const onPremiseDataReport = new OnPremiseDataReport(
      new ComputeEstimator(),
      new MemoryEstimator(ON_PREMISE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
    )

    const result = onPremiseDataReport.getEstimates(newMockDataInput)

    const expectedResult: OnPremiseDataOutput[] = [
      {
        cpuDescription: 'Intel(R) Xeon(R) Amber 4114 CPU @ 2.20GHz',
        machineName: 'test-machine-name',
        memory: 1319.033203125,
        machineType: 'server',
        startTime: new Date('2022-01-17T13:38:18Z'),
        endTime: new Date('2022-01-24T18:22:29.918423Z'),
        cost: 93.12,
        dailyCo2e: 0.0012313338084172039,
        dailyKilowattHours: 3.814168262922688,
        dailyUptime: 4,
        weeklyCo2e: 0.0036940014252516114,
        weeklyKilowattHours: 11.442504788768062,
        weeklyUptime: 12,
        monthlyCo2e: 0.011082004275754835,
        monthlyKilowattHours: 34.327514366304186,
        monthlyUptime: 36,
        annualCo2e: 0.011082004275754835,
        annualKilowattHours: 34.327514366304186,
        annualUptime: 36,
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('uses default configurable values when machineType is invalid', () => {
    const newMockDataInput: OnPremiseDataInput[] = [
      {
        cpuDescription: 'Intel(R) Xeon(R) Amber 4114 CPU @ 2.20GHz',
        machineName: 'test-machine-name',
        memory: 1319.033203125,
        machineType: 'invalid',
        startTime: new Date('2022-01-17T13:38:18Z'),
        endTime: new Date('2022-01-24T18:22:29.918423Z'),
        cost: 93.12,
        dailyUptime: 4,
        weeklyUptime: 12,
        monthlyUptime: 36,
        annualUptime: 36,
      },
    ]

    const onPremiseDataReport = new OnPremiseDataReport(
      new ComputeEstimator(),
      new MemoryEstimator(ON_PREMISE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
    )

    const result = onPremiseDataReport.getEstimates(newMockDataInput)

    const expectedResult: OnPremiseDataOutput[] = [
      {
        cpuDescription: 'Intel(R) Xeon(R) Amber 4114 CPU @ 2.20GHz',
        machineName: 'test-machine-name',
        memory: 1319.033203125,
        machineType: 'invalid',
        startTime: new Date('2022-01-17T13:38:18Z'),
        endTime: new Date('2022-01-24T18:22:29.918423Z'),
        cost: 93.12,
        dailyCo2e: 0.0012313338084172039,
        dailyKilowattHours: 3.814168262922688,
        dailyUptime: 4,
        weeklyCo2e: 0.0036940014252516114,
        weeklyKilowattHours: 11.442504788768062,
        weeklyUptime: 12,
        monthlyCo2e: 0.011082004275754835,
        monthlyKilowattHours: 34.327514366304186,
        monthlyUptime: 36,
        annualCo2e: 0.011082004275754835,
        annualKilowattHours: 34.327514366304186,
        annualUptime: 36,
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it.each([
    [
      ['server', 'laptop', 'desktop'],
      45,
      undefined,
      2.3936684,
      0.001014771781496,
      7.181005200000001,
      0.0030443153444880003,
      21.5430156,
      0.009132946033464,
      21.5430156,
      0.009132946033464,
    ],
    [
      ['server', 'laptop', 'desktop'],
      undefined,
      350,
      2.212,
      0.00093775528,
      6.636,
      0.00281326584,
      19.908,
      0.00843979752,
      19.908,
      0.00843979752,
    ],
    [
      ['laptop', 'server', 'desktop'],
      75,
      undefined,
      3.6148820000000006,
      0.0015324930750800002,
      10.844646000000003,
      0.004597479225240001,
      32.533938000000006,
      0.013792437675720002,
      32.533938000000006,
      0.013792437675720002,
    ],
    [
      ['laptop', 'server', 'desktop'],
      undefined,
      250,
      1.58,
      0.0006698252,
      4.74,
      0.0020094756,
      14.22,
      0.0060284268,
      14.22,
      0.0060284268,
    ],
    [
      ['desktop', 'server', 'laptop'],
      60,
      undefined,
      3.0042752,
      0.001273632428288,
      9.0128256,
      0.0038208972848639998,
      27.0384768,
      0.011462691854592,
      27.0384768,
      0.011462691854592,
    ],
    [
      ['desktop', 'server', 'laptop'],
      undefined,
      300,
      1.896,
      0.0008037902399999999,
      5.688,
      0.0024113707199999996,
      17.064,
      0.007234112159999999,
      17.064,
      0.007234112159999999,
    ],
  ])(
    'it should return configured values for averageWatts or cpuUtilization by machineType',
    (
      machineType: string[],
      cpuUtilization: number | undefined,
      averageWatts: number | undefined,
      dailyKilowattHours: number,
      dailyCo2e: number,
      weeklyKilowattHours: number,
      weeklyCo2e: number,
      monthlyKilowattHours: number,
      monthlyCo2e: number,
      annualKilowattHours: number,
      annualCo2e: number,
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
          cpuDescription: 'Intel(R) Xeon(R) Silver 4114 CPU @ 2.20GHz',
          machineName: 'test-machine-name',
          memory: 127.626953125,
          machineType: machineType[0],
          startTime: new Date('2022-01-17T13:38:18Z'),
          endTime: new Date('2022-01-24T18:22:29.918423Z'),
          country: 'United States',
          cost: 93.12,
          dailyCo2e: dailyCo2e,
          dailyKilowattHours: dailyKilowattHours,
          dailyUptime: 4,
          weeklyCo2e: weeklyCo2e,
          weeklyKilowattHours: weeklyKilowattHours,
          weeklyUptime: 12,
          monthlyCo2e: monthlyCo2e,
          monthlyKilowattHours: monthlyKilowattHours,
          monthlyUptime: 36,
          annualCo2e: annualCo2e,
          annualKilowattHours: annualKilowattHours,
          annualUptime: 36,
        },
      ]
      expect(result).toEqual(expectedResult)
    },
  )
})
