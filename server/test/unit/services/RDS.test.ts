import RDS from '@services/RDS'
import FootprintEstimate from '@domain/FootprintEstimate'
import RDSStorage from '@services/RDSStorage'
import RDSComputeService from '@services/RDSCompute'

describe('RDS Service', function () {

    it('Combines the results from both the RDSCompute and RDSStorage services ', async () => {
        // given
        const startDate = new Date('2020-01-01')
        const endDate = new Date('2020-01-02')
        const region = 'us-east-1'

        const rdsComputeEstimate: FootprintEstimate[] = [
            {
                co2e: 1,
                timestamp: new Date('2020-01-01T00:00:00.000Z'),
                wattHours: 4,
            },
        ]

        const rdsStorageEstimate: FootprintEstimate[] = [
            {
                co2e: 2,
                timestamp: new Date('2020-01-01T00:00:00.000Z'),
                wattHours: 1,
            },
        ]

        let rdsComputeMockGetEstimates: jest.Mock<Promise<FootprintEstimate[]>>
        let rdsComputeMock: RDSComputeService = new RDSComputeService()
        rdsComputeMockGetEstimates = jest.fn()
        rdsComputeMock.getEstimates = rdsComputeMockGetEstimates
        rdsComputeMockGetEstimates.mockResolvedValueOnce(rdsComputeEstimate)

        let rdsStorageMockGetEstimates: jest.Mock<Promise<FootprintEstimate[]>>
        let rdsStorageMock: RDSStorage = new RDSStorage()
        rdsStorageMockGetEstimates = jest.fn()
        rdsStorageMock.getEstimates = rdsStorageMockGetEstimates
        rdsStorageMockGetEstimates.mockResolvedValueOnce(rdsStorageEstimate)

        // when
        const rdsService: RDS=  new RDS(rdsComputeMock, rdsStorageMock)

        const rdsEstimates = await rdsService.getEstimates(startDate, endDate, region)

        // then
        expect(rdsEstimates).toEqual([
            {
                co2e: 3,
                timestamp: new Date('2020-01-01T00:00:00.000Z'),
                wattHours: 5,
            }
        ])
    })
})
