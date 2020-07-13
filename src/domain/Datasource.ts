import UsageData from './UsageData'

export default interface Datasource {
  getUsage(start: Date, end: Date): Promise<UsageData[]>
}
