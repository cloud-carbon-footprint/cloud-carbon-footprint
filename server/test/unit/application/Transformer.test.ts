import { transformToServiceData, transformToEstimationResults } from '@application/Transformer'
import moment from 'moment'
import { ServiceData, EstimationResult } from '@application/EstimationResult'

describe('Transformer', () => {
  describe('transform to EstimationResult[]', () => {
    test('should aggregate ServiceData[] by timestamp', () => {
      const startDate = '2020-05-17'
      const region = 'us-east-2'
      const services1: string[] = ['ebs', 's3', 'ec2']
      const services2: string[] = ['elasticache', 'rds', 'lambda']
      const serviceData1: ServiceData[] = []
      const serviceData2: ServiceData[] = []
      services1.forEach((service: string) => {
        for (let i = 0; i < 3; i++) {
          serviceData1.push({
            timestamp: moment.utc(startDate).add(i, 'day').toDate(),
            region: region,
            serviceName: service,
            wattHours: Math.random() * 30,
            co2e: Math.random() * 65,
            cost: Math.random() * 100,
          })
        }
      })
      services2.forEach((service: string) => {
        for (let i = 0; i < 3; i++) {
          serviceData2.push({
            timestamp: moment.utc(startDate).add(i, 'day').toDate(),
            region: region,
            serviceName: service,
            wattHours: Math.random() * 30,
            co2e: Math.random() * 65,
            cost: Math.random() * 100,
          })
        }
      })

      const result: EstimationResult[] = transformToEstimationResults(serviceData1.concat(serviceData2))

      expect(result).toEqual([
        {
          timestamp: moment.utc(startDate).toDate(),
          serviceEstimates: [
            serviceData1[0],
            serviceData1[3],
            serviceData1[6],
            serviceData2[0],
            serviceData2[3],
            serviceData2[6],
          ],
        },
        {
          timestamp: moment.utc(startDate).add(1, 'day').toDate(),
          serviceEstimates: [
            serviceData1[1],
            serviceData1[4],
            serviceData1[7],
            serviceData2[1],
            serviceData2[4],
            serviceData2[7],
          ],
        },

        {
          timestamp: moment.utc(startDate).add(2, 'day').toDate(),
          serviceEstimates: [
            serviceData1[2],
            serviceData1[5],
            serviceData1[8],
            serviceData2[2],
            serviceData2[5],
            serviceData2[8],
          ],
        },
      ])
    })
  })

  describe('transform to ServiceData[]', () => {
    test('should aggregate 0 for when footprintEstimate is missing for a date cost has', () => {
      const startDate = '2020-05-17'
      const region = 'us-east-1'
      const footprintEstimates = [...Array(1)].map((v, i) => {
        return {
          timestamp: moment.utc(startDate).add(i, 'day').toDate(),
          wattHours: 1.0944,
          co2e: 0.0007737845760000001,
        }
      })
      const costs = [...Array(2)].map((v, i) => {
        return {
          timestamp: moment.utc(startDate).add(i, 'day').toDate(),
          amount: Math.random() * 100,
          currency: 'USD',
        }
      })

      const service = {
        getEstimates: jest.fn(),
        serviceName: 'ebs',
        getUsage: jest.fn(),
        getCosts: jest.fn(),
      }

      const result: ServiceData[] = transformToServiceData(service, region, costs, footprintEstimates)

      expect(result).toEqual([
        {
          timestamp: footprintEstimates[0].timestamp,
          serviceName: 'ebs',
          region: region,
          wattHours: footprintEstimates[0].wattHours,
          co2e: footprintEstimates[0].co2e,
          cost: costs[0].amount,
        },
        {
          timestamp: costs[1].timestamp,
          serviceName: 'ebs',
          region: region,
          wattHours: 0,
          co2e: 0,
          cost: costs[1].amount,
        },
      ])
    })

    test('should aggregate 0 for when cost is missing for a date footprintEstimate has', () => {
      const startDate = '2020-05-17'
      const region = 'us-east-1'
      const footprintEstimates = [...Array(2)].map((v, i) => {
        return {
          timestamp: moment.utc(startDate).add(i, 'day').toDate(),
          wattHours: 1.0944,
          co2e: 0.0007737845760000001,
        }
      })
      const costs = [...Array(1)].map((v, i) => {
        return {
          timestamp: moment.utc(startDate).add(i, 'day').toDate(),
          amount: Math.random() * 100,
          currency: 'USD',
        }
      })

      const service = {
        getEstimates: jest.fn(),
        serviceName: 'ebs',
        getUsage: jest.fn(),
        getCosts: jest.fn(),
      }

      const result: ServiceData[] = transformToServiceData(service, region, costs, footprintEstimates)

      expect(result).toEqual([
        {
          timestamp: footprintEstimates[0].timestamp,
          serviceName: 'ebs',
          region: region,
          wattHours: footprintEstimates[0].wattHours,
          co2e: footprintEstimates[0].co2e,
          cost: costs[0].amount,
        },
        {
          timestamp: footprintEstimates[1].timestamp,
          serviceName: 'ebs',
          region: region,
          wattHours: footprintEstimates[1].wattHours,
          co2e: footprintEstimates[1].co2e,
          cost: 0,
        },
      ])
    })

    test('should join cost and footprintEstimate by date to combine into EstimateResult', () => {
      const startDate = '2020-05-17'
      const region = 'us-east-1'
      const footprintEstimates = [...Array(4)].map((v, i) => {
        return {
          timestamp: moment.utc(startDate).add(i, 'day').toDate(),
          wattHours: 1.0944,
          co2e: 0.0007737845760000001,
        }
      })
      const costs = [...Array(4)].map((v, i) => {
        return {
          timestamp: moment.utc(startDate).add(i, 'day').toDate(),
          amount: Math.random() * 100,
          currency: 'USD',
        }
      })
      const service = {
        getEstimates: jest.fn(),
        serviceName: 'ebs',
        getUsage: jest.fn(),
        getCosts: jest.fn(),
      }

      const result: ServiceData[] = transformToServiceData(service, region, costs, footprintEstimates)

      expect(result).toEqual([
        {
          timestamp: footprintEstimates[0].timestamp,
          serviceName: 'ebs',
          region: region,
          wattHours: footprintEstimates[0].wattHours,
          co2e: footprintEstimates[0].co2e,
          cost: costs[0].amount,
        },

        {
          timestamp: footprintEstimates[1].timestamp,
          serviceName: 'ebs',
          region: region,
          wattHours: footprintEstimates[1].wattHours,
          co2e: footprintEstimates[1].co2e,
          cost: costs[1].amount,
        },

        {
          timestamp: footprintEstimates[2].timestamp,
          serviceName: 'ebs',
          region: region,
          wattHours: footprintEstimates[2].wattHours,
          co2e: footprintEstimates[2].co2e,
          cost: costs[2].amount,
        },
        {
          timestamp: footprintEstimates[3].timestamp,
          serviceName: 'ebs',
          region: region,
          wattHours: footprintEstimates[3].wattHours,
          co2e: footprintEstimates[3].co2e,
          cost: costs[3].amount,
        },
      ])
    })

    test('should aggregate usage data within a given day', () => {
      const startDate = '2020-05-17'
      const region = 'us-east-2'
      const footprintEstimates = [...Array(8)].map((v, i) => {
        return {
          timestamp: moment
            .utc(startDate)
            .add(i * 8, 'hour')
            .toDate(),
          wattHours: 1.0944,
          co2e: 0.0007737845760000001,
        }
      })
      const costs = [...Array(8)].map((v, i) => {
        return {
          timestamp: moment
            .utc(startDate)
            .add(i * 8, 'hour')
            .toDate(),
          amount: Math.random() * 100,
          currency: 'USD',
        }
      })
      const service = {
        getEstimates: jest.fn(),
        serviceName: 'ebs',
        getUsage: jest.fn(),
        getCosts: jest.fn(),
      }

      const result: ServiceData[] = transformToServiceData(service, region, costs, footprintEstimates)

      expect(result).toEqual([
        {
          timestamp: moment.utc(startDate).toDate(),
          region: region,
          serviceName: 'ebs',
          wattHours:
            footprintEstimates[0].wattHours + footprintEstimates[1].wattHours + footprintEstimates[2].wattHours,
          co2e: footprintEstimates[0].co2e + footprintEstimates[1].co2e + footprintEstimates[2].co2e,
          cost: costs[0].amount + costs[1].amount + costs[2].amount,
        },

        {
          timestamp: moment.utc(startDate).add(1, 'day').toDate(),
          region: region,
          serviceName: 'ebs',
          wattHours:
            footprintEstimates[3].wattHours + footprintEstimates[4].wattHours + footprintEstimates[5].wattHours,
          co2e: footprintEstimates[3].co2e + footprintEstimates[4].co2e + footprintEstimates[5].co2e,
          cost: costs[3].amount + costs[4].amount + costs[5].amount,
        },

        {
          timestamp: moment.utc(startDate).add(2, 'day').toDate(),
          region: region,
          serviceName: 'ebs',
          wattHours: footprintEstimates[6].wattHours + footprintEstimates[7].wattHours,
          co2e: footprintEstimates[6].co2e + footprintEstimates[7].co2e,
          cost: costs[6].amount + costs[7].amount,
        },
      ])
    })
  })
})
