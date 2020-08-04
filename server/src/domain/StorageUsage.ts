import IUsageData from './IUsageData'

export default interface StorageUsage extends IUsageData {
  readonly sizeGb: number
}
