import CloudService from './CloudService'
import EBS from '../services/EBS'
import S3 from '../services/S3'

export default function AWS(): CloudService[] {
  return [new EBS(), new S3()]
}
