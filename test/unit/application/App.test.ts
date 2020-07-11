import moment = require('moment')
import { App } from '../../../src/application/App'
import { EstimationResult } from '../../../src/application/EstimationResult'
import { EstimationRequest } from '../../../src/application/EstimationRequest'
import { mocked } from 'ts-jest/utils'
import { DatasourceFactory } from '../../../src/datasources/DatasourceFactory'
import EbsDatasource from '../../../src/datasources/EbsDatasource'
import StorageUsage from '../../../src/domain/StorageUsage'
import { FootprintEstimatorFactory } from '../../../src/domain/FootprintEstimatorFactory'
import { StorageEstimator } from '../../../src/domain/StorageEstimator'
import FootprintEstimate from '../../../src/domain/FootprintEstimate'

jest.mock('../../../src/datasources/DatasourceFactory')
jest.mock('../../../src/datasources/EbsDatasource')
jest.mock('../../../src/domain/FootprintEstimatorFactory')
jest.mock('../../../src/domain/StorageEstimator')

const datasourceFactoryMock = mocked(DatasourceFactory, true)
const ebsDatasourceMock = mocked(new EbsDatasource())
const footprintEstimatorFactoryMock = mocked(FootprintEstimatorFactory, true)
const storageEstimatorMock = mocked(new StorageEstimator(), true)

describe('App', () => {
  let app: App

  beforeAll(() => {
    app = new App()
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

      const expectedStorageEstimate: FootprintEstimate[] = [...Array(7)].map((v, i) => {
        return {
          timestamp: moment('2020-12-07').add(i, 'days').toDate(),
          wattHours: 1.0944,
          co2e: 0.0007737845760000001,
        }
      })

      datasourceFactoryMock.create.mockReturnValueOnce(ebsDatasourceMock)
      ebsDatasourceMock.getUsage.mockResolvedValue(expectedStorageUsage)

      footprintEstimatorFactoryMock.create.mockReturnValueOnce(storageEstimatorMock)
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
  })
})
