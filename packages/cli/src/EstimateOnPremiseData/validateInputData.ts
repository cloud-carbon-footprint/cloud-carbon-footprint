/*
 * © 2021 Thoughtworks, Inc.
 */
import { OnPremiseDataInput } from '@cloud-carbon-footprint/common'

export const validateInputData = (inputData: OnPremiseDataInput[]) => {
  inputData.map((inputRow: OnPremiseDataInput) => {
    if (
      !inputRow.cpuDescription ||
      !inputRow.machineType ||
      !inputRow.memory ||
      !inputRow.startTime ||
      !inputRow.endTime ||
      !inputRow.dailyUptime ||
      !inputRow.weeklyUptime ||
      !inputRow.monthlyUptime ||
      !inputRow.annualUptime
    ) {
      throw new Error(
        'Input data is incorrect. Please check your input data file and try again.',
      )
    }
  })
}
