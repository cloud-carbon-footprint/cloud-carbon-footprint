/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  CloudWatch,
  CostExplorer,
  Credentials,
  CloudWatchLogs,
  Athena,
} from 'aws-sdk'
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service'

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
  EstimationResult,
  configLoader,
  RecommendationResult,
  AWS_RECOMMENDATIONS_TARGETS,
  LookupTableInput,
  LookupTableOutput,
} from '@cloud-carbon-footprint/common'

import {
  EBS,
  S3,
  EC2,
  ElastiCache,
  RDS,
  RDSComputeService,
  RDSStorage,
  Lambda,
  ServiceWrapper,
  CostAndUsageReports,
} from '../lib'

import AWSCredentialsProvider from './AWSCredentialsProvider'

import {
  AWS_CLOUD_CONSTANTS,
  AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '../domain'
import { Recommendations } from '../lib/Recommendations'

export default class AWSAccount extends CloudProviderAccount {
  private readonly credentials: Credentials

  constructor(
    public id: string,
    public name: string,
    private regions: string[],
  ) {
    super()
    this.credentials = AWSCredentialsProvider.create(id)
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
    const awsConstants = {
      minWatts: AWS_CLOUD_CONSTANTS.MIN_WATTS_AVG,
      maxWatts: AWS_CLOUD_CONSTANTS.MAX_WATTS_AVG,
      powerUsageEffectiveness: AWS_CLOUD_CONSTANTS.getPUE(),
    }
    const region = new Region(
      regionId,
      awsServices,
      AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
      awsConstants,
    )
    return this.getRegionData(
      configLoader().AWS.NAME,
      region,
      startDate,
      endDate,
    )
  }

  getServices(regionId: string): ICloudService[] {
    return configLoader().AWS.CURRENT_SERVICES.map(({ key }) => {
      return this.getService(key, regionId, this.credentials)
    })
  }

  async getDataForRecommendations(
    recommendationTarget: AWS_RECOMMENDATIONS_TARGETS,
  ): Promise<RecommendationResult[]> {
    const recommendations = new Recommendations(
      new ComputeEstimator(),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      this.createServiceWrapper(
        this.getServiceConfigurationOptions(
          configLoader().AWS.ATHENA_REGION,
          this.credentials,
        ),
      ),
    )

    return await recommendations.getRecommendations(recommendationTarget)
  }

  getDataFromCostAndUsageReports(
    startDate: Date,
    endDate: Date,
  ): Promise<EstimationResult[]> {
    const costAndUsageReportsService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(),
      this.createServiceWrapper(
        this.getServiceConfigurationOptions(
          configLoader().AWS.ATHENA_REGION,
          this.credentials,
        ),
      ),
    )
    return costAndUsageReportsService.getEstimates(startDate, endDate)
  }

  getCostAndUsageReportsDataFromInputData(
    inputData: LookupTableInput[],
  ): LookupTableOutput[] {
    const costAndUsageReportsService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(),
    )
    return costAndUsageReportsService.getEstimatesFromInputData(inputData)
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
