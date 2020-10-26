/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import CloudProviderAccount from '@application/CloudProviderAccount'
import { EstimationResult } from '@application/EstimationResult'
import Region from '@domain/Region'
import config from '@application/Config'
import ICloudService from '@domain/ICloudService'
import ComputeEngine from '@services/gcp/ComputeEngine'
import { v3 } from '@google-cloud/monitoring'

export default class GCPAccount extends CloudProviderAccount {
  constructor(private regions: string[]) {
    super()
  }

  getDataForRegions(startDate: Date, endDate: Date): Promise<EstimationResult[]>[] {
    return this.regions.map((regionId) => {
      return this.getDataForRegion(regionId, startDate, endDate)
    })
  }

  getDataForRegion(regionId: string, startDate: Date, endDate: Date): Promise<EstimationResult[]> {
    const gcpServices = this.getServices()
    const region = new Region(regionId, gcpServices, config.GCP.NAME)
    return this.getRegionData(region, startDate, endDate)
  }

  getServices(): ICloudService[] {
    return config.GCP.CURRENT_SERVICES.map(({ key }) => {
      return this.getService(key)
    })
  }

  private getService(key: string): ICloudService {
    if (this.services[key] === undefined) throw new Error('Unsupported service: ' + key)
    return this.services[key]()
  }

  private services: { [id: string]: () => ICloudService } = {
    computeEngine: () => {
      return new ComputeEngine(new v3.MetricServiceClient())
    },
  }
}
