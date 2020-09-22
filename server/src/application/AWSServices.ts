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

export default function AWSServices(): ICloudService[] {
  return AWS.CURRENT_SERVICES.map(({ key }) => {
    return getService(key)
  })
}

function getService(key: string): ICloudService {
  if (services[key] === undefined) throw new Error('Unsupported service: ' + key)
  return services[key]()
}

const services: { [id: string]: () => ICloudService } = {
  ebs: () => {
    return new EBS()
  },
  s3: () => {
    return new S3()
  },
  ec2: () => {
    return new EC2()
  },
  elasticache: () => {
    return new ElastiCache()
  },
  rds: () => {
    return new RDS(new RDSComputeService(), new RDSStorage())
  },
  lambda: () => {
    return new Lambda()
  },
}
