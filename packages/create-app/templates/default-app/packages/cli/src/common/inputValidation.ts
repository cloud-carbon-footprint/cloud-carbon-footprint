/*
 * © 2021 Thoughtworks, Inc.
 */
import {
  EstimationRequestValidationError,
  OnPremiseDataInput,
} from '@cloud-carbon-footprint/common'

type cliDataInput = {
  groupBy: string
}

export const validateOnPremiseInput = (inputData: OnPremiseDataInput[]) => {
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

export const validateCliInput = (inputData: cliDataInput) => {
  const groupingOptions = ['day', 'dayAndService', 'service']
  if (!groupingOptions.includes(inputData.groupBy)) {
    throw new EstimationRequestValidationError(
      `GroupBy param is incorrect. Please specify one of the following grouping methods: ${groupingOptions.join(
        ' | ',
      )}`,
    )
  }
}
