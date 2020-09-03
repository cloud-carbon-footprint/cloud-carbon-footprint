import EBS from '@services/EBS'
import S3 from '@services/S3'
import EC2 from '@services/EC2'
import ElastiCache from '@services/ElastiCache'
import RDS from '@services/RDS'
import RDSComputeService from '@services/RDSCompute'
import RDSStorage from '@services/RDSStorage'
import Lambda from '@services/Lambda'
import { CURRENT_SERVICES } from '@application/Config.json'
import { ServiceCall } from '@application/ServiceCall'
import { defaultTransformer } from './Transformer'

export default function AWSServices(): ServiceCall[] {
  return CURRENT_SERVICES.map(({ key }) => {
    return getService(key)
  })
}

function getService(key: string): ServiceCall {
  if (services[key] === undefined) throw new Error('Unsupported service: ' + key)
  return services[key]()
}

const services: { [id: string]: () => ServiceCall } = {
  ebs: () => ({
    service: new EBS(),
    transformer: defaultTransformer,
  }),
  s3: () => ({
    service: new S3(),
    transformer: defaultTransformer,
  }),
  ec2: () => ({
    service: new EC2(),
    transformer: defaultTransformer,
  }),
  elasticache: () => ({
    service: new ElastiCache(),
    transformer: defaultTransformer,
  }),
  rds: () => ({
    service: new RDS(new RDSComputeService(), new RDSStorage()),
    transformer: defaultTransformer,
  }),
  lambda: () => ({
    service: new Lambda(),
    transformer: defaultTransformer,
  }),
}
