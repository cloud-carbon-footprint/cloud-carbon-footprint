import ICloudService from '@domain/ICloudService'
import EBS from '@services/EBS'
import S3 from '@services/S3'
import EC2 from '@services/EC2'
import ElastiCache from '@services/ElastiCache'
import RDS from '@services/RDS'
import RDSComputeService from '@services/RDSCompute'
import RDSStorage from '@services/RDSStorage'
import Lambda from '@services/Lambda'

export default function AWSServices(): ICloudService[] {
  return [
    new EBS(),
    new S3(),
    new EC2(),
    new ElastiCache(),
    new RDS(new RDSComputeService(), new RDSStorage()),
    new Lambda(),
  ]
}
