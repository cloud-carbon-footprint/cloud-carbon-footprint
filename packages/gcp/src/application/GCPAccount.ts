/*
 * © 2021 Thoughtworks, Inc.
 */

import { v3 } from '@google-cloud/monitoring'
import { ClientOptions } from 'google-gax'
import { BigQuery } from '@google-cloud/bigquery'
import { Resource } from '@google-cloud/resource-manager'
import { RecommenderClient } from '@google-cloud/recommender'
import { APIEndpoint } from 'googleapis-common'
import { google } from 'googleapis'
import {
  ICloudService,
  Region,
  ComputeEstimator,
  StorageEstimator,
  NetworkingEstimator,
  MemoryEstimator,
  UnknownEstimator,
  CloudProviderAccount,
} from '@cloud-carbon-footprint/core'
import {
  configLoader,
  EstimationResult,
  RecommendationResult,
  GoogleAuthClient,
  LookupTableInput,
  LookupTableOutput,
} from '@cloud-carbon-footprint/common'
import ServiceWrapper from '../lib/ServiceWrapper'
import { BillingExportTable, ComputeEngine, Recommendations } from '../lib'
import {
  GCP_CLOUD_CONSTANTS,
  GCP_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '../domain'

export default class GCPAccount extends CloudProviderAccount {
  constructor(
    public id: string,
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
      new UnknownEstimator(),
      new BigQuery({ projectId: this.id }),
    )
    return billingExportTableService.getEstimates(startDate, endDate)
  }

  getBillingExportDataFromInputData(
    inputData: LookupTableInput[],
  ): LookupTableOutput[] {
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(),
    )
    return billingExportTableService.getEstimatesFromInputData(inputData)
  }

  getServices(): ICloudService[] {
    return configLoader().GCP.CURRENT_SERVICES.map(({ key }) => {
      return this.getService(key)
    })
  }

  async getDataForRecommendations(): Promise<RecommendationResult[]> {
    const googleAuthClient: GoogleAuthClient = await google.auth.getClient({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })
    const googleComputeClient: APIEndpoint = google.compute('v1')

    const recommendations = new Recommendations(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new ServiceWrapper(
        new Resource(),
        googleAuthClient,
        googleComputeClient,
        new RecommenderClient(),
      ),
    )

    return await recommendations.getRecommendations()
  }

  private getService(key: string): ICloudService {
    if (this.services[key] === undefined)
      throw new Error('Unsupported service: ' + key)
    const options: ClientOptions = {
      projectId: this.id,
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
