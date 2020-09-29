import ICloudService from '@domain/ICloudService'
import EBS from '@services/aws/EBS'
import S3 from '@services/aws/S3'
import EC2 from '@services/aws/EC2'
import ElastiCache from '@services/aws/ElastiCache'
import RDS from '@services/aws/RDS'
import RDSComputeService from '@services/aws/RDSCompute'
import RDSStorage from '@services/aws/RDSStorage'
import Lambda from '@services/aws/Lambda'
import { AWS } from '@application/Config.json'
import { ServiceWrapper } from '@services/aws/ServiceWrapper'
import { CloudWatch, CostExplorer } from 'aws-sdk'
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service'

export default function AWSServices(region: string): ICloudService[] {
  return AWS.CURRENT_SERVICES.map(({ key }) => {
    return getService(key, region)
  })
}

function getService(key: string, region: string): ICloudService {
  if (services[key] === undefined) throw new Error('Unsupported service: ' + key)
  const options: ServiceConfigurationOptions = {
    region: region,
  }
  return services[key](options)
}

function createServiceWrapper(options: ServiceConfigurationOptions) {
  return new ServiceWrapper(new CloudWatch(options), new CostExplorer({ region: 'us-east-1' }))
}

const services: { [id: string]: (options: ServiceConfigurationOptions) => ICloudService } = {
  ebs: (options) => {
    return new EBS(createServiceWrapper(options))
  },
  s3: (options) => {
    return new S3(createServiceWrapper(options))
  },
  ec2: (options) => {
    return new EC2(createServiceWrapper(options))
  },
  elasticache: (options) => {
    return new ElastiCache(createServiceWrapper(options))
  },
  rds: (options) => {
    return new RDS(new RDSComputeService(createServiceWrapper(options)), new RDSStorage(createServiceWrapper(options)))
  },
  lambda: (options) => {
    return new Lambda(60000, 1000, createServiceWrapper(options))
  },
}
