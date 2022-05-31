/*
 * © 2021 Thoughtworks, Inc.
 */
import { OnPremiseDataOutput } from '@cloud-carbon-footprint/common'
import { createObjectCsvWriter } from 'csv-writer'

export async function writeToCsv(
  outputFileName: string,
  outputData: OnPremiseDataOutput[],
) {
  const csvWriter = createObjectCsvWriter({
    path: outputFileName,
    header: [
      { id: 'cpuDescription', title: 'cpuDescription' },
      { id: 'machineName', title: 'machineName' },
      { id: 'memory', title: 'memory' },
      { id: 'machineType', title: 'machineType' },
      { id: 'startTime', title: 'startTime' },
      { id: 'endTime', title: 'endTime' },
      { id: 'country', title: 'country' },
      { id: 'region', title: 'region' },
      { id: 'cpuUtilization', title: 'cpuUtilization' },
      { id: 'powerUsageEffectiveness', title: 'powerUsageEffectiveness' },
      { id: 'cost', title: 'cost' },
      { id: 'dailyUptime', title: 'dailyUptime' },
      { id: 'dailyKilowattHours', title: 'dailyKilowattHours' },
      { id: 'dailyCo2e', title: 'dailyCo2e' },
      { id: 'weeklyUptime', title: 'weeklyUptime' },
      { id: 'weeklyKilowattHours', title: 'weeklyKilowattHours' },
      { id: 'weeklyCo2e', title: 'weeklyCo2e' },
      { id: 'monthlyUptime', title: 'monthlyUptime' },
      { id: 'monthlyKilowattHours', title: 'monthlyKilowattHours' },
      { id: 'monthlyCo2e', title: 'monthlyCo2e' },
      { id: 'annualUptime', title: 'annualUptime' },
      { id: 'annualKilowattHours', title: 'annualKilowattHours' },
      { id: 'annualCo2e', title: 'annualCo2e' },
    ],
  })
  await csvWriter.writeRecords(outputData)
}
