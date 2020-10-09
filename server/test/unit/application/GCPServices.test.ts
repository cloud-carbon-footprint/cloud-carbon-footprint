const mockMetricServiceClient = jest.fn()
jest.mock('@google-cloud/monitoring', () => {
  return {
    v3: {
      MetricServiceClient: mockMetricServiceClient,
    },
  }
})

describe('GCPServices', () => {
  /* eslint-disable @typescript-eslint/no-var-requires */
  afterEach(() => {
    jest.resetModules()
  })

  it('should return empty if no service in config file', () => {
    jest.doMock('@application/Config.json', () => {
      return {
        GCP: {
          CURRENT_SERVICES: [],
        },
      }
    })

    const GCPServices = require('@application/GCPServices').default
    const services = GCPServices()
    expect(services).toHaveLength(0)
  })

  it('should throw error if unknown service', () => {
    jest.doMock('@application/Config.json', () => {
      return {
        GCP: {
          CURRENT_SERVICES: [
            {
              key: 'goose',
            },
          ],
        },
      }
    })

    const GCPServices = require('@application/GCPServices').default
    expect(GCPServices).toThrowError('Unsupported service: goose')
  })

  it('should return computeEngine instance and inject MetricServiceClient', () => {
    const ComputeEngine = require('@services/gcp/ComputeEngine').default
    expectGCPService('computeEngine').toBeInstanceOf(ComputeEngine)
    expect(mockMetricServiceClient).toHaveBeenCalled()
  })
})

function expectGCPService(key: string) {
  jest.doMock('@application/Config.json', () => {
    return {
      GCP: {
        CURRENT_SERVICES: [
          {
            key: key,
          },
        ],
      },
    }
  })

  const GCPServices = require('@application/GCPServices').default
  const services = GCPServices()
  return expect(services[0])
}
