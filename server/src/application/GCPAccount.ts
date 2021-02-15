/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import CloudProviderAccount from '@application/CloudProviderAccount'
import { EstimationResult } from '@application/EstimationResult'
import Region from '@domain/Region'
import configLoader from '@application/ConfigLoader'
import ICloudService from '@domain/ICloudService'
import ComputeEngine from '@services/gcp/ComputeEngine'
import { v3 } from '@google-cloud/monitoring'
import { ClientOptions } from 'google-gax'
import { CredentialBody } from 'google-auth-library'
import BillingExportTable from '@services/gcp/BillingExportTable'
import ComputeEstimator from '@domain/ComputeEstimator'
import { StorageEstimator } from '@domain/StorageEstimator'
import { CLOUD_CONSTANTS } from '@domain/FootprintEstimationConstants'
import { BigQuery } from '@google-cloud/bigquery'

export default class GCPAccount extends CloudProviderAccount {
  private readonly credentials: CredentialBody

  constructor(public projectId: string, public name: string, private regions: string[]) {
    super()
    this.credentials = {
      client_email: configLoader().GCP.authentication.targetAccountEmail,
      private_key: configLoader().GCP.authentication.targetAccountPrivateKey,
    }
  }

  getDataForRegions(startDate: Date, endDate: Date): Promise<EstimationResult[]>[] {
    return this.regions.map((regionId) => {
      return this.getDataForRegion(regionId, startDate, endDate)
    })
  }

  getDataForRegion(regionId: string, startDate: Date, endDate: Date): Promise<EstimationResult[]> {
    const gcpServices = this.getServices()
    const region = new Region(regionId, gcpServices, configLoader().GCP.NAME)
    return this.getRegionData(region, startDate, endDate)
  }

  getDataFromBillingExportTable(startDate: Date, endDate: Date) {
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.GCP.HDDCOEFFICIENT),
      new BigQuery({ credentials: this.credentials, projectId: this.projectId }),
    )
    return billingExportTableService.getEstimates(startDate, endDate)
  }

  getServices(): ICloudService[] {
    return configLoader().GCP.CURRENT_SERVICES.map(({ key }) => {
      return this.getService(key)
    })
  }

  private getService(key: string): ICloudService {
    if (this.services[key] === undefined) throw new Error('Unsupported service: ' + key)
    const options: ClientOptions = {
      credentials: this.credentials,
      projectId: this.projectId,
    }
    return this.services[key](options)
  }

  private services: { [id: string]: (options: ClientOptions) => ICloudService } = {
    computeEngine: (options) => {
      return new ComputeEngine(new v3.MetricServiceClient(options))
    },
  }
}
