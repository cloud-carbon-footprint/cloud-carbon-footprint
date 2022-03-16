/*
 * © 2021 Thoughtworks, Inc.
 */

import { OnPremise } from '../application'
import { OnPremiseDataReport } from '../lib'
import {
  OnPremiseDataOutput,
  OnPremiseDataInput,
} from '@cloud-carbon-footprint/common'

const getEstimatesSpy = jest.spyOn(
  OnPremiseDataReport.prototype,
  'getEstimates',
)

const inputData: OnPremiseDataInput[] = [
  {
    machineName: 'Intel(R) Xeon(R) Silver 4114 CPU @ 2.20GHz',
    memory: 130690,
    machineType: 'server',
    startTime: new Date('2022-01-17T13:38:18Z'),
    endTime: new Date('2022-01-24T18:22:29.918423Z'),
    country: 'United States',
    region: 'Texas',
    cost: 93.12,
  },
]

describe('On Premise', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('gets results from getOnPremiseDataFromInputData function', () => {
    const mockEstimates: OnPremiseDataOutput[] = [
      {
        machineName: 'Intel(R) Xeon(R) Silver 4114 CPU @ 2.20GHz',
        memory: 130690,
        machineType: 'server',
        startTime: new Date('2022-01-17T13:38:18Z'),
        endTime: new Date('2022-01-24T18:22:29.918423Z'),
        country: 'United States',
        region: 'Texas',
        cost: 93.12,
        usageHours: 172,
        kilowattHours: 0.09313874999999999,
        co2e: 0.000021235635,
      },
    ]

    ;(getEstimatesSpy as jest.Mock).mockResolvedValue(mockEstimates)

    // when
    OnPremise.getOnPremiseDataFromInputData(inputData)

    // then
    expect(getEstimatesSpy).toHaveBeenCalledWith(inputData)
  })
})
