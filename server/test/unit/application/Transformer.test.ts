import { defaultTransformer } from '@application/Transformer'
import moment from 'moment'
import { ServiceResult } from '@application/EstimationResult'

describe('Transformer', () => {
  test('should match cost and footprintEstimate by date to combine into EstimateResult', () => {
    const startDate = '2020-05-17'
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

    const result: ServiceResult = defaultTransformer(service, costs, footprintEstimates)

    expect(result).toEqual({
      serviceName: 'ebs',
      estimationResults: [
        {
          timestamp: footprintEstimates[0].timestamp,
          serviceData: [
            {
              wattHours: footprintEstimates[0].wattHours,
              co2e: footprintEstimates[0].co2e,
              cost: costs[0].amount,
            },
          ],
        },
        {
          timestamp: footprintEstimates[1].timestamp,
          serviceData: [
            {
              wattHours: footprintEstimates[1].wattHours,
              co2e: footprintEstimates[1].co2e,
              cost: costs[1].amount,
            },
          ],
        },
        {
          timestamp: footprintEstimates[2].timestamp,
          serviceData: [
            {
              wattHours: footprintEstimates[2].wattHours,
              co2e: footprintEstimates[2].co2e,
              cost: costs[2].amount,
            },
          ],
        },
        {
          timestamp: footprintEstimates[3].timestamp,
          serviceData: [
            {
              wattHours: footprintEstimates[3].wattHours,
              co2e: footprintEstimates[3].co2e,
              cost: costs[3].amount,
            },
          ],
        },
      ],
    })
  })

  test('should aggregate usage data within a given day', () => {
    const startDate = '2020-05-17'
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

    const result: ServiceResult = defaultTransformer(service, costs, footprintEstimates)

    expect(result).toEqual({
      serviceName: 'ebs',
      estimationResults: [
        {
          timestamp: moment.utc(startDate).toDate(),
          serviceData: [
            {
              wattHours:
                footprintEstimates[0].wattHours + footprintEstimates[1].wattHours + footprintEstimates[2].wattHours,
              co2e: footprintEstimates[0].co2e + footprintEstimates[1].co2e + footprintEstimates[2].co2e,
              cost: costs[0].amount + costs[1].amount + costs[2].amount,
            },
          ],
        },
        {
          timestamp: moment.utc(startDate).add(1, 'day').toDate(),
          serviceData: [
            {
              wattHours:
                footprintEstimates[3].wattHours + footprintEstimates[4].wattHours + footprintEstimates[5].wattHours,
              co2e: footprintEstimates[3].co2e + footprintEstimates[4].co2e + footprintEstimates[5].co2e,
              cost: costs[3].amount + costs[4].amount + costs[5].amount,
            },
          ],
        },
        {
          timestamp: moment.utc(startDate).add(2, 'day').toDate(),
          serviceData: [
            {
              wattHours: footprintEstimates[6].wattHours + footprintEstimates[7].wattHours,
              co2e: footprintEstimates[6].co2e + footprintEstimates[7].co2e,
              cost: costs[6].amount + costs[7].amount,
            },
          ],
        },
      ],
    })
  })
})
