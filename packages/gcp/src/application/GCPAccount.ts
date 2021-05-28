/*
 * © 2021 ThoughtWorks, Inc.
 */

import { v3 } from '@google-cloud/monitoring'
import { ClientOptions } from 'google-gax'
import { BigQuery } from '@google-cloud/bigquery'
import {
  ICloudService,
  Region,
  ComputeEstimator,
  StorageEstimator,
  NetworkingEstimator,
  MemoryEstimator,
  CloudProviderAccount,
} from '@cloud-carbon-footprint/core'
import { configLoader, EstimationResult } from '@cloud-carbon-footprint/common'
import { BillingExportTable, ComputeEngine } from '../lib'
import {
  GCP_CLOUD_CONSTANTS,
  GCP_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '../domain'

export default class GCPAccount extends CloudProviderAccount {
  constructor(
    public projectId: string,
    public name: string,
    private regions: string[],
  ) {
    super()
  }

  getDataForRegions(
    startDate: Date,
    endDate: Date,
  ): Promise<EstimationResult[]>[] {
    return this.regions.map((regionId) => {
      return this.getDataForRegion(regionId, startDate, endDate)
    })
  }

  getDataForRegion(
    regionId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<EstimationResult[]> {
    const gcpServices = this.getServices()
    const gcpConstants = {
      minWatts: GCP_CLOUD_CONSTANTS.MIN_WATTS_AVG,
      maxWatts: GCP_CLOUD_CONSTANTS.MAX_WATTS_AVG,
      powerUsageEffectiveness: GCP_CLOUD_CONSTANTS.getPUE(),
    }
    const region = new Region(
      regionId,
      gcpServices,
      GCP_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
      gcpConstants,
    )
    return this.getRegionData('GCP', region, startDate, endDate)
  }

  getDataFromBillingExportTable(startDate: Date, endDate: Date) {
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new BigQuery({ projectId: this.projectId }),
    )
    return billingExportTableService.getEstimates(startDate, endDate)
  }

  getServices(): ICloudService[] {
    return configLoader().GCP.CURRENT_SERVICES.map(({ key }) => {
      return this.getService(key)
    })
  }

  private getService(key: string): ICloudService {
    if (this.services[key] === undefined)
      throw new Error('Unsupported service: ' + key)
    const options: ClientOptions = {
      projectId: this.projectId,
    }
    return this.services[key](options)
  }

  private services: {
    [id: string]: (options: ClientOptions) => ICloudService
  } = {
    computeEngine: (options) => {
      return new ComputeEngine(new v3.MetricServiceClient(options))
    },
  }
}
