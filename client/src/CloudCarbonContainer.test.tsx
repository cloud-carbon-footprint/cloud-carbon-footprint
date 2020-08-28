import React from 'react'
import { render } from "@testing-library/react";
import CloudCarbonContainer from './CloudCarbonContainer'
import useRemoteService from './hooks/RemoteServiceHook'
import generateEstimations from './data/generateEstimations'

jest.mock('./ApexLineChart')
jest.mock('./hooks/RemoteServiceHook')

beforeEach(() => {
    useRemoteService.mockReturnValue({loading: false, error: false, data: co2Estimations.footprint})
})

test("initial timeframe should be 12 months", () => {
    const {container} = render(<CloudCarbonContainer/>)

    expect(container).toMatchSnapshot()

    expect(ApexLineChart).toBeCalledWith({data: []})
});