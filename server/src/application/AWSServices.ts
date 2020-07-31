import CloudService from '@domain/CloudService'
import EBS from '@services/EBS'
import S3 from '@services/S3'
import EC2 from '@services/EC2'
import ElastiCache from '@services/ElastiCache'
import RDSComputeService from '@services/RDSCompute'

export default function AWSServices(): CloudService[] {
  return [new EBS(), new S3(), new EC2(), new ElastiCache(), new RDSComputeService()]
}
