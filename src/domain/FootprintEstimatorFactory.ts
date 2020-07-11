import FootprintEstimator from './FootprintEstimator'
import { StorageEstimator } from './StorageEstimator'

export class FootprintEstimatorFactory {
  static create(): FootprintEstimator {
    return new StorageEstimator()
  }
}
