/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */
/* eslint-disable */
/* istanbul ignore file */
import ComputeEstimator from '@domain/ComputeEstimator'
import { StorageEstimator } from '@domain/StorageEstimator'
import { EstimationResult } from '@application/EstimationResult'
import { BigQuery } from '@google-cloud/bigquery'

export default class BillingExportTable {
  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly ssdStorageEstimator: StorageEstimator,
    private readonly hddStorageEstimator: StorageEstimator,
    private readonly bigQuery: BigQuery,
  ) {}

  async getEstimates(start: Date, end: Date): Promise<EstimationResult[]> {
    return []
  }
}
