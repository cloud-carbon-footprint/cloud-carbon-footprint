import CloudService from './CloudService'
import FootprintEstimate from './FootprintEstimate'
import { StorageEstimator } from './StorageEstimator'
import StorageUsage from './StorageUsage'

export default abstract class StorageService implements CloudService {
  estimator = new StorageEstimator()

  getEstimates(start: Date, end: Date): Promise<FootprintEstimate[]> {
    return this.getUsage(start, end).then(this.estimator.estimate)
  }

  abstract getUsage(start: Date, end: Date): Promise<StorageUsage[]>

  abstract serviceName: string
}
