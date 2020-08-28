import React from 'react'
import { render } from "@testing-library/react";
import CloudCarbonContainer from './CloudCarbonContainer'
import { ApexLineChart } from "./ApexLineChart"
import useRemoteService from './hooks/RemoteServiceHook'
import generateEstimations from './data/generateEstimations'
import { ServiceResult, EstimationResult } from './types';
import moment from 'moment';

jest.mock("./ApexLineChart", () => ({
    ApexLineChart: jest.fn(() => null)
}))
jest.mock('./hooks/RemoteServiceHook')


const mockedUseRemoteService = useRemoteService as jest.MockedFunction<typeof useRemoteService>
const mockedApexLineChart = ApexLineChart as jest.Mocked<typeof ApexLineChart>

describe('CloudCarbonContainer', () => {
    let data: EstimationResult[];

    beforeEach(() => {
        data = generateEstimations(moment.utc(), 14)
        const mockReturnValue: ServiceResult = { loading: false, error: false, data: data }
        mockedUseRemoteService.mockReturnValue(mockReturnValue)
    })

    test("initial timeframe should be 12 months", () => {
        render(<CloudCarbonContainer />)

        expect(mockedApexLineChart).toBeCalledWith(
            {
                data: data.slice(0, 12)
            },
            expect.anything())
    });
});

