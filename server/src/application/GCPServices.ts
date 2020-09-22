import ICloudService from '@domain/ICloudService'
import { GCP } from '@application/Config.json'
import ComputeEngine from '@services/gcp/ComputeEngine'

export default function GCPServices(): ICloudService[] {
  return GCP.CURRENT_SERVICES.map(({ key }) => {
    return getService(key)
  })
}

function getService(key: string): ICloudService {
  if (services[key] === undefined) throw new Error('Unsupported service: ' + key)
  return services[key]()
}

const services: { [id: string]: () => ICloudService } = {
  computeEngine: () => {
    return new ComputeEngine()
  },
}
