import React from 'react'
<<<<<<< HEAD
import { render } from '@testing-library/react'
=======
import { render, act, fireEvent } from "@testing-library/react";
>>>>>>> Filter up to X months prior depending on filter button clicked
import CloudCarbonContainer from './CloudCarbonContainer'
import { ApexLineChart } from './ApexLineChart'
import useRemoteService from './hooks/RemoteServiceHook'
import generateEstimations from './data/generateEstimations'
import { ServiceResult, EstimationResult } from './types'
import moment from 'moment'

jest.mock('./ApexLineChart', () => ({
  ApexLineChart: jest.fn(() => null),
}))
jest.mock('./hooks/RemoteServiceHook')

const mockedUseRemoteService = useRemoteService as jest.MockedFunction<typeof useRemoteService>
const mockedApexLineChart = ApexLineChart as jest.Mocked<typeof ApexLineChart>

describe('CloudCarbonContainer', () => {
<<<<<<< HEAD
  let data: EstimationResult[]

  beforeEach(() => {
    data = generateEstimations(moment.utc(), 14)
    const mockReturnValue: ServiceResult = { loading: false, error: false, data: data }
    mockedUseRemoteService.mockReturnValue(mockReturnValue)
  })

  test('match against snapshot', () => {
    const { container } = render(<CloudCarbonContainer />)

    expect(container).toMatchSnapshot()
  })

  test('initial timeframe should be 12 months', () => {
    render(<CloudCarbonContainer />)

    expect(mockedApexLineChart).toBeCalledWith(
      {
        data: data.slice(0, 12),
      },
      expect.anything(),
    )
  })
})
=======
    let data: EstimationResult[];

    beforeEach(() => {
        data = generateEstimations(moment.utc(), 14)

        const mockReturnValue: ServiceResult = { loading: false, error: false, data: data }
        mockedUseRemoteService.mockReturnValue(mockReturnValue)
    })

    afterEach(() => {
        mockedUseRemoteService.mockClear()
    })

    test('match against snapshot', () => {
        const {container} = render(<CloudCarbonContainer/>)

        expect(container).toMatchSnapshot()
    })

    test("initial timeframe should filter up to 12 months prior", () => {
        render(<CloudCarbonContainer />)

        expect(mockedApexLineChart).toHaveBeenLastCalledWith(
            {
                data: data.slice(0, 13)
            },
            expect.anything())
    });

    test("clicking 1M button should filter up to 1 month prior", () => {
        const { getByText } = render(<CloudCarbonContainer />)

        fireEvent.click(getByText('1M'))
    
        expect(mockedApexLineChart).toHaveBeenLastCalledWith(
            {
                data: data.slice(0, 2)
            },
            expect.anything())
    });

    test("clicking 3M button should filter up to 3 months prior", () => {
        const { getByText } = render(<CloudCarbonContainer />)

        fireEvent.click(getByText('3M'))
    
        expect(mockedApexLineChart).toHaveBeenLastCalledWith(
            {
                data: data.slice(0, 4)
            },
            expect.anything())
    });

    test("clicking 6M button should filter up to 3 months prior", () => {
        const { getByText } = render(<CloudCarbonContainer />)

        fireEvent.click(getByText('6M'))
    
        expect(mockedApexLineChart).toHaveBeenLastCalledWith(
            {
                data: data.slice(0, 7)
            },
            expect.anything())
    });

    test("clicking 12M button should filter up to 12 months prior", () => {
        const { getByText } = render(<CloudCarbonContainer />)

        // click away from initial state
        fireEvent.click(getByText('1M'))

        // click to filter up to 12M prior
        fireEvent.click(getByText('12M'))
    
        expect(mockedApexLineChart).toHaveBeenLastCalledWith(
            {
                data: data.slice(0, 13)
            },
            expect.anything())
    });
});

>>>>>>> Filter up to X months prior depending on filter button clicked
