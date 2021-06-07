import ICloudService from '../../ICloudService'
import CloudConstants, {
  CloudConstantsEmissionsFactors,
} from '../../CloudConstantsTypes'
import FootprintEstimate from '../../FootprintEstimate'
import { Cost } from '../../cost'

export class mockCloudService implements ICloudService {
  serviceName = 'test-service'

  async getEstimates(
    start: Date,
    end: Date,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    region: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    emissionsFactors: CloudConstantsEmissionsFactors,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constants: CloudConstants,
  ): Promise<FootprintEstimate[]> {
    return [
      {
        timestamp: new Date(start),
        kilowattHours: 100,
        co2e: 10,
        usesAverageCPUConstant: false,
      },
      {
        timestamp: new Date(end),
        kilowattHours: 100,
        co2e: 10,
        usesAverageCPUConstant: false,
      },
    ]
  }

  async getCosts(
    start: Date,
    end: Date,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    region: string,
  ): Promise<Cost[]> {
    return [
      {
        timestamp: new Date(start),
        amount: 10,
        currency: 'USD',
      },
      {
        timestamp: new Date(end),
        amount: 100,
        currency: 'USD',
      },
    ]
  }
}
