/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

const mockMetricServiceClient = jest.fn()
jest.mock('@google-cloud/monitoring', () => {
  return {
    v3: {
      MetricServiceClient: mockMetricServiceClient,
    },
  }
})

describe('GCPAccount', () => {
  /* eslint-disable @typescript-eslint/no-var-requires */
  afterEach(() => {
    jest.resetModules()
  })

  it('should return empty if no service in config file', () => {
    jest.doMock('@application/Config.ts', () => {
      return {
        GCP: {
          CURRENT_SERVICES: [],
        },
      }
    })

    const GCPAccount = require('@application/GCPAccount').default
    const services = new GCPAccount(['us-east1']).getServices()
    expect(services).toHaveLength(0)
  })

  it('should throw error if unknown service', () => {
    jest.doMock('@application/Config.ts', () => {
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

    const GCPAccount = require('@application/GCPAccount').default
    const account = new GCPAccount(['us-east1'])
    expect(() => {
      account.getServices()
    }).toThrowError('Unsupported service: goose')
  })

  it('should return computeEngine instance and inject MetricServiceClient', () => {
    const ComputeEngine = require('@services/gcp/ComputeEngine').default
    expectGCPService('computeEngine').toBeInstanceOf(ComputeEngine)
    expect(mockMetricServiceClient).toHaveBeenCalled()
  })
})

function expectGCPService(key: string) {
  jest.doMock('@application/Config.ts', () => {
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

  const GCPAccount = require('@application/GCPAccount').default
  const services = new GCPAccount(['us-east1']).getServices()
  return expect(services[0])
}
