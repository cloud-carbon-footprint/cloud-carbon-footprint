import React from 'react'
import { render } from "@testing-library/react";
import CloudCarbonContainer from './CloudCarbonContainer'
import {ApexLineChart} from "./ApexLineChart"
import useRemoteService from './hooks/RemoteServiceHook'
import co2Estimations from './stub-server/co2estimations.json'

jest.mock("./ApexLineChart", () => ({
    ApexLineChart: jest.fn()
}))
jest.mock('./hooks/RemoteServiceHook')

beforeEach(() => {
    useRemoteService.mockReturnValue({loading: false, error: false, data: co2Estimations.footprint})
})

test("initial timeframe should be 12 months", () => {

    const {getByText} = render(<CloudCarbonContainer/>)
    expect(ApexLineChart).toBeCalledWith({data: []})
});