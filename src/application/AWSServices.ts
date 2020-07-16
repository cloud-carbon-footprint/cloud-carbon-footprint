import CloudService from '@domain/CloudService'
import EBS from '@services/EBS'
import S3 from '@services/S3'

export default function AWSServices(): CloudService[] {
  return [new EBS(), new S3()]
}
