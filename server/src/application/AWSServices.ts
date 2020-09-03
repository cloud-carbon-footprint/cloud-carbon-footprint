import ICloudService from '@domain/ICloudService'
import EBS from '@services/EBS'
import S3 from '@services/S3'
import EC2 from '@services/EC2'
import ElastiCache from '@services/ElastiCache'
import RDS from '@services/RDS'
import RDSComputeService from '@services/RDSCompute'
import RDSStorage from '@services/RDSStorage'
import Lambda from '@services/Lambda'
import { CURRENT_SERVICES } from '@application/Config.json'

export default function AWSServices(): ICloudService[] {
  return CURRENT_SERVICES.map(({ key }) => {
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
