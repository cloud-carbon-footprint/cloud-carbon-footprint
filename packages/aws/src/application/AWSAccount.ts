/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  Athena,
  CloudWatch,
  CloudWatchLogs,
  CostExplorer,
  Credentials,
  S3 as S3Service,
} from 'aws-sdk'
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service'

import {
  CloudProviderAccount,
  ComputeEstimator,
  EmbodiedEmissionsEstimator,
  ICloudService,
  MemoryEstimator,
  NetworkingEstimator,
  Region,
  StorageEstimator,
  UnknownEstimator,
} from '@cloud-carbon-footprint/core'
import {
  AWS_RECOMMENDATIONS_TARGETS,
  configLoader,
  EstimationResult,
  GroupBy,
  LookupTableInput,
  LookupTableOutput,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'

import {
  CostAndUsageReports,
  EBS,
  EC2,
  ElastiCache,
  Lambda,
  RDS,
  RDSComputeService,
  RDSStorage,
  S3,
  ServiceWrapper,
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
    grouping: GroupBy,
  ): Promise<EstimationResult[]> {
    const results: EstimationResult[][] = []
    for (const regionId of this.regions) {
      const regionEstimates: EstimationResult[] = await Promise.all(
        await this.getDataForRegion(regionId, startDate, endDate, grouping),
      )
      results.push(regionEstimates)
    }

    return results.flat()
  }

  getDataForRegion(
    regionId: string,
    startDate: Date,
    endDate: Date,
    grouping: GroupBy,
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
      grouping,
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
    const serviceWrapper = this.createServiceWrapper(
      this.getServiceConfigurationOptions(
        configLoader().AWS.ATHENA_REGION,
        this.credentials,
      ),
    )

    return await Recommendations.getRecommendations(
      recommendationTarget,
      serviceWrapper,
    )
  }

  getDataFromCostAndUsageReports(
    startDate: Date,
    endDate: Date,
    grouping: GroupBy,
  ): Promise<EstimationResult[]> {
    const costAndUsageReportsService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
      this.createServiceWrapper(
        this.getServiceConfigurationOptions(
          configLoader().AWS.ATHENA_REGION,
          this.credentials,
        ),
      ),
    )
    return costAndUsageReportsService.getEstimates(startDate, endDate, grouping)
  }

  static getCostAndUsageReportsDataFromInputData(
    inputData: LookupTableInput[],
  ): LookupTableOutput[] {
    const costAndUsageReportsService = new CostAndUsageReports(
      new ComputeEstimator(),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(AWS_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(AWS_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new UnknownEstimator(AWS_CLOUD_CONSTANTS.ESTIMATE_UNKNOWN_USAGE_BY),
      new EmbodiedEmissionsEstimator(
        AWS_CLOUD_CONSTANTS.SERVER_EXPECTED_LIFESPAN,
      ),
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

  private createServiceWrapper(options: ServiceConfigurationOptions) {
    return new ServiceWrapper(
      new CloudWatch(options),
      new CloudWatchLogs(options),
      new CostExplorer({
        region: configLoader().AWS.IS_AWS_GLOBAL?'us-east-1':'cn-northwest-1',
        credentials: options.credentials,
      }),
      new S3Service(options),
      new Athena(options),
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
