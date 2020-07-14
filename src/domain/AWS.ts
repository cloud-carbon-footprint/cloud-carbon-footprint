import CloudService from './CloudService'
import EBS from '../services/EBS'

export default function AWS(): CloudService[] {
  return [new EBS()]
}
