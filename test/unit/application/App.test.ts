import moment = require('moment')
import { App } from '../../../src/application/App'
import { EstimationResult } from '../../../src/application/EstimationResult'
import { EstimationRequest } from '../../../src/application/EstimationRequest'
import { mocked } from 'ts-jest/utils'
import { DatasourceFactory } from '../../../src/datasources/DatasourceFactory'
import StorageUsage from '../../../src/domain/StorageUsage'
import { FootprintEstimatorFactory } from '../../../src/domain/FootprintEstimatorFactory'
import { StorageEstimator } from '../../../src/domain/StorageEstimator'
import FootprintEstimate from '../../../src/domain/FootprintEstimate'

jest.mock('../../../src/datasources/DatasourceFactory')
jest.mock('../../../src/datasources/EbsDatasource')
jest.mock('../../../src/domain/FootprintEstimatorFactory')
jest.mock('../../../src/domain/StorageEstimator')

const datasourceFactoryMock = mocked(DatasourceFactory, true)
const footprintEstimatorFactoryMock = mocked(FootprintEstimatorFactory, true)
const storageEstimatorMock = mocked(new StorageEstimator(), true)

describe('App', () => {
  let app: App
  let mockGetUsage: jest.Mock<Promise<StorageUsage[]>>
  beforeAll(() => {
    app = new App()
    mockGetUsage = jest.fn()
    const mockDataSource = { getUsage: mockGetUsage }

    datasourceFactoryMock.create.mockReturnValueOnce(mockDataSource)
    footprintEstimatorFactoryMock.create.mockReturnValueOnce(storageEstimatorMock)
  })

  describe('getEstimate', () => {
    it('should return ebs estimates for a week', async () => {
      //setup
      const estimationRequest: EstimationRequest = {
        startDate: moment('2020-12-07').toDate(),
        endDate: moment('2020-12-07').add(1, 'weeks').toDate(),
      }

      const expectedStorageUsage: StorageUsage[] = [...Array(7)].map((v, i) => {
        return {
          sizeGb: 1.0,
          timestamp: moment('2020-12-07').add(i, 'days').toDate(),
        }
      })

      mockGetUsage.mockResolvedValue(expectedStorageUsage)

      const expectedStorageEstimate: FootprintEstimate[] = [...Array(7)].map((v, i) => {
        return {
          timestamp: moment('2020-12-07').add(i, 'days').toDate(),
          wattHours: 1.0944,
          co2e: 0.0007737845760000001,
        }
      })
      storageEstimatorMock.estimate.mockReturnValueOnce(expectedStorageEstimate)

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

      expect(storageEstimatorMock.estimate).toHaveBeenCalledWith(expectedStorageUsage)
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
