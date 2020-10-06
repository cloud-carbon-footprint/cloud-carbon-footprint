import ComputeEngine from "@services/gcp/ComputeEngine"
// import { MetricServiceClient } from "@google-cloud/monitoring"

beforeAll(() => {
    //AWSMock.setSDKInstance(AWS)
})
  
describe('ComputeEngine', () => {
    afterEach(() => {

    })

    const dayOneHourOne = '2020-07-10T21:00:00.000Z'
    const dayOneHourTwo = '2020-07-10T22:00:00.000Z'
    const dayOneHourThree = '2020-07-10T23:00:00.000Z'
    const dayTwoHourOne = '2020-07-11T00:00:00.000Z'
    const dayTwoHourTwo = '2020-07-11T01:00:00.000Z'
    const dayTwoHourThree = '2020-07-11T02:00:00.000Z'
    const region = 'us-east-one'
    const startDate = new Date('2020-07-10')
    const endDate = new Date('2020-07-11')

    // jest.mock("MetricServiceClient")

    it('getUsage ComputeEngine usage', async () => {
 
        // const listTimeSeriesMock = jest.spyOn(clientMock, "listTimeSeries")

        // listTimeSeriesMock.mockImplementation(() => {
        //     test : "fdsnjfksna"
        // })

  

        const client = jest.genMockFromModule('@google-cloud/monitoring') as any;
        const MetricServiceClientMock = client.default.MetricServiceClient
        MetricServiceClientMock.listTimeSeries = jest.fn((request) => {
            console.log('request', request)
            return 'fdsnjfksna'
        });
        console.log('### monitoring mock', MetricServiceClientMock.listTimeSeries)

        // test('implementation created by jest.createMockFromModule', () => {
        //     expect(utils.authorize.mock).toBeTruthy();
        //     expect(utils.isAuthorized('not wizard')).toEqual(true);
        // });

        const computeEngine = new ComputeEngine()
        //computeEngine.getUsage(startDate, endDate, region)
        expect(computeEngine.getUsage(startDate, endDate, region)).toEqual("fdsnjfksna") 

        //expect(listTimeSeriesMock).toHaveBeenCalled()

    })
})