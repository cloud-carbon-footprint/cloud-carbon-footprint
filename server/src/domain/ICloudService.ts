import FootprintEstimate from './FootprintEstimate'

export default interface ICloudService {
  serviceName: string
  getEstimates(start: Date, end: Date, region: string): Promise<FootprintEstimate[]>
}
