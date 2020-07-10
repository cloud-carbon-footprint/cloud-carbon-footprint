import moment = require('moment')
import { App } from '../../../src/application/App'
import { EstimationResult } from '../../../src/application/EstimationResult'
import { EstimationRequest } from '../../../src/application/EstimationRequest'
import { mocked } from 'ts-jest/utils'
import { DatasourceFactory } from '../../../src/domain/DatasourceFactory'
jest.mock('../../../src/domain/DatasourceFactory')

// const datasourceFactoryMock = mocked(DatasourceFactory, true)
// const datasourceFactoryMock = <jest.Mock<DatasourceFactory>>DatasourceFactory;

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
        endDate: moment('2020-12-07').subtract(1, 'weeks').toDate(),
      }
      // new DatasourceFactory().create();
      //mock Datasourcefactory

      // datasourceFactoryMock().create.mockReturnValueOnce("");
      // datasourceFactory.create.mockReturnValueOnce('');
      new DatasourceFactory()
      expect(DatasourceFactory).toHaveBeenCalledTimes(1)

      //mock Datasource response

      //run
      const estimationResult: EstimationResult[] = await app.getEstimate(estimationRequest)

      //assert
      const expectedEstimateResults: EstimationResult[] = [...Array(7)].map((v, i) => {
        return {
          timestamp: moment('2020-12-07').add(i, 'days').toDate(),
          estimates: [
            {
              serviceName: 'ebs',
              wattHours: 50,
              co2e: 0.05,
            },
          ],
        }
      })

      expect(estimationResult).toEqual(expectedEstimateResults)
    })
  })
})
