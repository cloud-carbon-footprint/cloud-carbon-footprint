import React from 'react'
import { render } from '@testing-library/react'
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

const REGION_US_EAST_1 = 'us-east-1'

describe('CloudCarbonContainer', () => {
  let data: EstimationResult[]

  beforeEach(() => {
    data = generateEstimations(moment.utc(), 14)

    const mockReturnValue: ServiceResult = { loading: false, error: false, data: data }
    mockedUseRemoteService.mockReturnValue(mockReturnValue)
  })

  afterEach(() => {
    mockedUseRemoteService.mockClear()
  })

  test('match against snapshot', () => {
    const { container } = render(<CloudCarbonContainer />)

    expect(container).toMatchSnapshot()
  })

  test('today and year prior to today should be passed in to remote service hook', () => {
    render(<CloudCarbonContainer />)

    const parameters = mockedUseRemoteService.mock.calls[0]

    expect(parameters.length).toEqual(4)

    const initial = parameters[0]
    const startDate = parameters[1]
    const endDate = parameters[2]
    const region = parameters[3]

    expect(initial).toEqual([])
    expect(startDate.isSame(moment.utc().subtract(1, 'year'), 'day')).toBeTruthy()
    expect(endDate.isSame(moment.utc(), 'day')).toBeTruthy()
    expect(region).toEqual(REGION_US_EAST_1)
  })

  test('initial timeframe should filter up to 12 months prior and pass into ApexLineChart', () => {
    render(<CloudCarbonContainer />)

    expect(mockedApexLineChart).toHaveBeenLastCalledWith(
      {
        data: data.slice(0, 13),
      },
      expect.anything(),
    )
  })

  test('show loading text if data has not been returned', () => {
    const mockLoading: ServiceResult = { loading: true, error: false, data: data }
    mockedUseRemoteService.mockReturnValue(mockLoading)

    const { getByText } = render(<CloudCarbonContainer />)

    expect(getByText('Your cloud carbon footprint data is loading')).toBeInTheDocument()
  })
})
