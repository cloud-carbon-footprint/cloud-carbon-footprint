import moment = require('moment')
import { App } from '../../../src/application/App'
import { EstimationResult } from '../../../src/application/EstimationResult'
import { EstimationRequest } from '../../../src/application/EstimationRequest'
import { mocked } from 'ts-jest/utils'
import { FootprintEstimatorFactory } from '../../../src/domain/FootprintEstimatorFactory'
import { StorageEstimator } from '../../../src/domain/StorageEstimator'
import FootprintEstimate from '../../../src/domain/FootprintEstimate'
import AWS from '../../../src/domain/AWS'
import UsageData from '../../../src/domain/UsageData'

jest.mock('../../../src/domain/AWS')

const AWSMock = mocked(AWS, true)

describe('App', () => {
  let app: App
  let mockGetEstimates: jest.Mock<Promise<FootprintEstimate[]>>
  let mockGetUsage: jest.Mock<Promise<UsageData[]>>
  beforeAll(() => {
    app = new App()

    mockGetEstimates = jest.fn()
    const mockCloudService = { getEstimates: mockGetEstimates, serviceName: 'ebs', getUsage: mockGetUsage }

    AWSMock.mockReturnValueOnce([mockCloudService])
  })

  describe('getEstimate', () => {
    it('should return ebs estimates for a week', async () => {
      //setup
      const estimationRequest: EstimationRequest = {
        startDate: moment('2020-12-07').toDate(),
        endDate: moment('2020-12-07').add(1, 'weeks').toDate(),
      }

      const expectedStorageEstimate: FootprintEstimate[] = [...Array(7)].map((v, i) => {
        return {
          timestamp: moment('2020-12-07').add(i, 'days').toDate(),
          wattHours: 1.0944,
          co2e: 0.0007737845760000001,
        }
      })
      mockGetEstimates.mockResolvedValueOnce(expectedStorageEstimate)

      //run
      const estimationResult: EstimationResult[] = await app.getEstimate(estimationRequest)

      //assert
      const expectedEstimationResults: EstimationResult[] = [...Array(7)].map((v, i) => {
        return {
          timestamp: moment('2020-12-07').add(i, 'days').toDate(),
          estimates: [
            {
              serviceName: 'ebs',
              wattHours: 1.0944,
              co2e: 0.0007737845760000001,
            },
          ],
        }
      })

      expect(estimationResult).toEqual(expectedEstimationResults)
    })

    it('should return error if start date is greater than end date', async () => {
      //setup
      const estimationRequest: EstimationRequest = {
        startDate: moment('2020-12-07').toDate(),
        endDate: moment('2020-12-06').toDate(),
      }

      //run
      try {
        await app.getEstimate(estimationRequest)
        fail()
      } catch (e) {
        //assert
        expect(e).toEqual('startDate cannot be greater than endDate')
      }
    })

    it('should return error if start date is undefined', async () => {
      //setup
      const estimationRequest: EstimationRequest = {
        startDate: undefined,
        endDate: new Date(),
      }

      //run
      try {
        await app.getEstimate(estimationRequest)
        fail()
      } catch (e) {
        //assert
        expect(e).toEqual('startDate cannot be undefined')
      }
    })

    it('should return error if end date is undefined', async () => {
      //setup
      const estimationRequest: EstimationRequest = {
        startDate: new Date(),
        endDate: undefined,
      }

      //run
      try {
        await app.getEstimate(estimationRequest)
        fail()
      } catch (e) {
        //assert
        expect(e).toEqual('endDate cannot be undefined')
      }
    })
  })
})
