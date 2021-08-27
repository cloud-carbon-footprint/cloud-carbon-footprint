/*
 * © 2021 Thoughtworks, Inc.
 */
import { LookupTableInput } from '@cloud-carbon-footprint/common'

export const validateInputData = (inputData: LookupTableInput[]) => {
  inputData.map((inputRow: LookupTableInput) => {
    if (
      !inputRow.serviceName ||
      !inputRow.region ||
      !inputRow.usageType ||
      !inputRow.usageUnit ||
      typeof inputRow.vCpus !== 'string'
    ) {
      throw new Error(
        'Input data is incorrect. Please check your input data file and try again.',
      )
    }
  })
}
