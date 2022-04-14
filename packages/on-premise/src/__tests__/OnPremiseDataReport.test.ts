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
    machineName: 'Intel(R) Xeon(R) Silver 4114 CPU @ 2.20GHz',
    memory: 127.626953125,
    machineType: 'server',
    startTime: new Date('2022-01-17T13:38:18Z'),
    endTime: new Date('2022-01-24T18:22:29.918423Z'),
    country: 'United States',
    cost: 93.12,
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
        machineName: 'Intel(R) Xeon(R) Silver 4114 CPU @ 2.20GHz',
        memory: 127.626953125,
        machineType: 'server',
        startTime: new Date('2022-01-17T13:38:18Z'),
        endTime: new Date('2022-01-24T18:22:29.918423Z'),
        country: 'United States',
        cost: 93.12,
        co2e: 0.04734552254168001,
        kilowattHours: 111.67977200000001,
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
    newMockDataInput[0].memory = 1319.033203125
    const onPremiseDataReport = new OnPremiseDataReport(
      new ComputeEstimator(),
      new MemoryEstimator(ON_PREMISE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
    )

    const result = onPremiseDataReport.getEstimates(newMockDataInput)

    const expectedResult: OnPremiseDataOutput[] = [
      {
        machineName: 'Intel(R) Xeon(R) Silver 4114 CPU @ 2.20GHz',
        memory: 1319.033203125,
        machineType: 'server',
        startTime: new Date('2022-01-17T13:38:18Z'),
        endTime: new Date('2022-01-24T18:22:29.918423Z'),
        country: 'United States',
        cost: 93.12,
        co2e: 0.07326404583798803,
        kilowattHours: 172.81701617678922,
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
        machineName: 'Intel(R) Xeon(R) Silver 4114 CPU @ 2.20GHz',
        memory: 1319.033203125,
        machineType: 'server',
        startTime: new Date('2022-01-17T13:38:18Z'),
        endTime: new Date('2022-01-24T18:22:29.918423Z'),
        country: 'United States',
        region: 'Texas',
        cpuUtilization: 45,
        powerUsageEffectiveness: 1.45,
        cost: 93.12,
        co2e: 0.062382491692975564,
        kilowattHours: 150.565967592623,
        usageHours: 172,
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Estimates using average values for region, memory and watts as default', () => {
    const newMockDataInput: OnPremiseDataInput[] = [
      {
        machineName: 'Intel(R) Xeon(R) Amber 4114 CPU @ 2.20GHz',
        memory: 1319.033203125,
        machineType: 'server',
        cost: 93.12,
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
        machineName: 'Intel(R) Xeon(R) Amber 4114 CPU @ 2.20GHz',
        memory: 1319.033203125,
        machineType: 'server',
        startTime: new Date('2022-01-17T13:38:18Z'),
        endTime: new Date('2022-01-24T18:22:29.918423Z'),
        cost: 93.12,
        co2e: 0.052947353761939764,
        kilowattHours: 164.0092353056756,
        usageHours: 172,
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('uses default configurable values when machineType is invalid', () => {
    const newMockDataInput: OnPremiseDataInput[] = [
      {
        machineName: 'Intel(R) Xeon(R) Amber 4114 CPU @ 2.20GHz',
        memory: 1319.033203125,
        machineType: 'invalid',
        startTime: new Date('2022-01-17T13:38:18Z'),
        endTime: new Date('2022-01-24T18:22:29.918423Z'),
        cost: 93.12,
      },
    ]

    const onPremiseDataReport = new OnPremiseDataReport(
      new ComputeEstimator(),
      new MemoryEstimator(ON_PREMISE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
    )

    const result = onPremiseDataReport.getEstimates(newMockDataInput)

    const expectedResult: OnPremiseDataOutput[] = [
      {
        machineName: 'Intel(R) Xeon(R) Amber 4114 CPU @ 2.20GHz',
        memory: 1319.033203125,
        machineType: 'invalid',
        startTime: new Date('2022-01-17T13:38:18Z'),
        endTime: new Date('2022-01-24T18:22:29.918423Z'),
        cost: 93.12,
        co2e: 0.052947353761939764,
        kilowattHours: 164.0092353056756,
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
      0.043635186604328,
      102.9277412,
    ],
    [['server', 'laptop', 'desktop'], undefined, 350, 0.04032347704, 95.116],
    [
      ['laptop', 'server', 'desktop'],
      75,
      undefined,
      0.06589720222844,
      155.439926,
    ],
    [
      ['laptop', 'server', 'desktop'],
      undefined,
      250,
      0.028802483599999998,
      67.94,
    ],
    [
      ['desktop', 'server', 'laptop'],
      60,
      undefined,
      0.054766194416383994,
      129.18383359999999,
    ],
    [['desktop', 'server', 'laptop'], undefined, 300, 0.03456298032, 81.528],
  ])(
    'it should return configured values for averageWatts or cpuUtilization by machineType',
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
          machineName: 'Intel(R) Xeon(R) Silver 4114 CPU @ 2.20GHz',
          memory: 127.626953125,
          machineType: machineType[0],
          startTime: new Date('2022-01-17T13:38:18Z'),
          endTime: new Date('2022-01-24T18:22:29.918423Z'),
          country: 'United States',
          cost: 93.12,
          co2e: co2e,
          kilowattHours: kwh,
          usageHours: 172,
        },
      ]
      expect(result).toEqual(expectedResult)
    },
  )
})
