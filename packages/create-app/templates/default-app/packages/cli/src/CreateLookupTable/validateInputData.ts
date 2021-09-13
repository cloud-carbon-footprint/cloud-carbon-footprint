/*
 * © 2021 Thoughtworks, Inc.
 */
import { LookupTableInput } from '@cloud-carbon-footprint/common'

export const validateInputData = (inputData: LookupTableInput[]) => {
  inputData.map((inputRow: LookupTableInput) => {
    if (
      !inputRow.serviceName ||
      typeof inputRow.region !== 'string' ||
      !inputRow.region ||
      !inputRow.usageType ||
      !inputRow.usageUnit
    ) {
      throw new Error(
        'Input data is incorrect. Please check your input data file and try again.',
      )
    }
  })
}
