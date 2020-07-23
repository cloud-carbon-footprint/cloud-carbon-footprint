import UsageData from './UsageData'

export default interface StorageUsage extends UsageData {
  readonly sizeGb: number
}
