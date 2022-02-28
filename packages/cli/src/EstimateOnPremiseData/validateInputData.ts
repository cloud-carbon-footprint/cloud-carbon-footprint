/*
 * © 2021 Thoughtworks, Inc.
 */
import { OnPremiseDataInput } from '@cloud-carbon-footprint/common'

export const validateInputData = (inputData: OnPremiseDataInput[]) => {
  inputData.map((inputRow: OnPremiseDataInput) => {
    if (
      !inputRow.cpuId ||
      !inputRow.machineType ||
      !inputRow.memory ||
      !inputRow.startTime ||
      !inputRow.endTime
    ) {
      throw new Error(
        'Input data is incorrect. Please check your input data file and try again.',
      )
    }
  })
}
