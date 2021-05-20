/*
 * © 2021 ThoughtWorks, Inc.
 */

import {
  ICloudService,
  EBS,
  S3,
  EC2,
  ElastiCache,
  RDS,
  RDSComputeService,
  RDSStorage,
  Lambda,
  ServiceWrapper,
  Region,
  CostAndUsageReports,
  ComputeEstimator,
  StorageEstimator,
  NetworkingEstimator,
  MemoryEstimator,
  CLOUD_CONSTANTS,
} from '@cloud-carbon-footprint/core'
import configLoader from './ConfigLoader'
import {
  CloudWatch,
  CostExplorer,
  Credentials,
  CloudWatchLogs,
  Athena,
} from 'aws-sdk'
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service'
import AWSCredentialsProvider from './AWSCredentialsProvider'
import { EstimationResult } from './EstimationResult'
import CloudProviderAccount from './CloudProviderAccount'

export default class AWSAccount extends CloudProviderAccount {
  private readonly credentials: Credentials

  constructor(
    public accountId: string,
    public name: string,
    private regions: string[],
  ) {
    super()
    this.credentials = AWSCredentialsProvider.create(accountId)
  }

  async getDataForRegions(
    startDate: Date,
    endDate: Date,
  ): Promise<EstimationResult[]> {
    const results: EstimationResult[][] = []
    for (const regionId of this.regions) {
      const regionEstimates: EstimationResult[] = await Promise.all(
        await this.getDataForRegion(regionId, startDate, endDate),
      )
      results.push(regionEstimates)
    }

    return results.flat()
  }

  getDataForRegion(
    regionId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<EstimationResult[]> {
    const awsServices = this.getServices(regionId)
    const region = new Region(regionId, awsServices, configLoader().AWS.NAME)
    return this.getRegionData(region, startDate, endDate)
  }

  getServices(regionId: string): ICloudService[] {
    return configLoader().AWS.CURRENT_SERVICES.map(({ key }) => {
      return this.getService(key, regionId, this.credentials)
    })
  }

  getDataFromCostAndUsageReports(
    startDate: Date,
    endDate: Date,
  ): Promise<EstimationResult[]> {
    const costAndUsageReportsService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT),
      new StorageEstimator(CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT),
      new NetworkingEstimator(),
      new MemoryEstimator(CLOUD_CONSTANTS.AWS.MEMORY_COEFFICIENT),
      this.createServiceWrapper(
        this.getServiceConfigurationOptions(
          configLoader().AWS.ATHENA_REGION,
          this.credentials,
        ),
      ),
    )
    return costAndUsageReportsService.getEstimates(startDate, endDate)
  }

  private getService(
    key: string,
    region: string,
    credentials: Credentials,
  ): ICloudService {
    if (this.services[key] === undefined)
      throw new Error('Unsupported service: ' + key)
    const options = this.getServiceConfigurationOptions(region, credentials)
    return this.services[key](options)
  }

  private getServiceConfigurationOptions(
    region: string,
    credentials: Credentials,
  ): ServiceConfigurationOptions {
    return {
      region: region,
      credentials: credentials,
    }
  }

  private cw: CloudWatch
  private ce: CostExplorer
  private cwl: CloudWatchLogs
  private ath: Athena

  private createServiceWrapper(options: ServiceConfigurationOptions) {
    return new ServiceWrapper(
      this.cw ? this.cw : new CloudWatch(options),
      this.cwl ? this.cwl : new CloudWatchLogs(options),
      this.ce
        ? this.ce
        : new CostExplorer({
            region: 'us-east-1',
            credentials: options.credentials,
          }),
      this.ath ? this.ath : new Athena(options),
    )
  }

  private services: {
    [id: string]: (options: ServiceConfigurationOptions) => ICloudService
  } = {
    ebs: (options) => {
      return new EBS(this.createServiceWrapper(options))
    },
    s3: (options) => {
      return new S3(this.createServiceWrapper(options))
    },
    ec2: (options) => {
      return new EC2(this.createServiceWrapper(options))
    },
    elasticache: (options) => {
      return new ElastiCache(this.createServiceWrapper(options))
    },
    rds: (options) => {
      return new RDS(
        new RDSComputeService(this.createServiceWrapper(options)),
        new RDSStorage(this.createServiceWrapper(options)),
      )
    },
    lambda: (options) => {
      return new Lambda(120000, 1000, this.createServiceWrapper(options))
    },
  }
}
