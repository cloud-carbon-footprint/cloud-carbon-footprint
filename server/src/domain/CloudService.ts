import UsageData from './UsageData'
import FootprintEstimate from './FootprintEstimate'

export default interface CloudService {
  serviceName: string
  getUsage(start: Date, end: Date): Promise<UsageData[]>
  getEstimates(start: Date, end: Date): Promise<FootprintEstimate[]>
}
