/*
 * © 2021 Thoughtworks, Inc.
 */

import { ComputeEstimator, MemoryEstimator } from '@cloud-carbon-footprint/core'
import {
  Logger,
  OnPremiseDataInput,
  OnPremiseDataOutput,
} from '@cloud-carbon-footprint/common'

import { ON_PREMISE_CLOUD_CONSTANTS } from '../domain'
import { OnPremiseDataReport } from '../lib'

export default class OnPremise {
  private logger: Logger
  constructor() {
    this.logger = new Logger('On Premise')
  }

  static getOnPremiseDataFromInputData(
    inputData: OnPremiseDataInput[],
  ): OnPremiseDataOutput[] {
    const onPremiseDataReport = new OnPremiseDataReport(
      new ComputeEstimator(),
      new MemoryEstimator(ON_PREMISE_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
    )
    return onPremiseDataReport.getEstimates(inputData)
  }
}
