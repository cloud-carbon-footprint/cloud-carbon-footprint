/*
 * © 2021 Thoughtworks, Inc.
 */

import { OnPremiseDataInput } from '@cloud-carbon-footprint/common'
import { OnPremiseDataReportRow } from '../lib'

describe('OnPremiseDataReportRow', () => {
  const onPremiseDataReportRow: OnPremiseDataInput = {
    cpuDescription: 'Intel(R) Xeon(R) CPU E5-2667 v3 @ 3.20GHz',
    machineName: 'test-machine-name',
    memory: 65459,
    machineType: 'server',
    cost: 93.12,
    startTime: new Date('2020-11-02T00:53:03Z'),
    endTime: new Date('2020-11-06T18:22:30.135082Z'),
  }

  it('should get processor family from cpuId', () => {
    const intelResult = new OnPremiseDataReportRow(
      onPremiseDataReportRow,
    ).getProcessorFamilyFromCpuDescription(
      onPremiseDataReportRow.cpuDescription,
    )

    const AMDResult = new OnPremiseDataReportRow(
      onPremiseDataReportRow,
    ).getProcessorFamilyFromCpuDescription('AMD EPYC 7262 8-Core Processor')

    expect(intelResult).toEqual(['Haswell'])
    expect(AMDResult).toEqual(['AMD EPYC 2nd Gen'])
  })

  // it('should get usage hours from timestamps', () => {
  //   const result = new OnPremiseDataReportRow(
  //     onPremiseDataReportRow,
  //   ).getUsageHoursFromTimestamps(
  //     onPremiseDataReportRow.startTime,
  //     onPremiseDataReportRow.endTime,
  //   )
  //
  //   expect(result).toEqual(113)
  // })
})
