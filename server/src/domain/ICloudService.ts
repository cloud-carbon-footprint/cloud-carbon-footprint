import IUsageData from './IUsageData'
import FootprintEstimate from './FootprintEstimate'

export default interface ICloudService {
  serviceName: string
  getUsage(start: Date, end: Date): Promise<IUsageData[]>
  getEstimates(start: Date, end: Date, region: string): Promise<FootprintEstimate[]>
}
