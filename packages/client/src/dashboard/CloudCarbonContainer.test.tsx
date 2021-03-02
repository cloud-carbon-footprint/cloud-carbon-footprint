/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React from 'react'
import { render } from '@testing-library/react'
import CloudCarbonContainer from './CloudCarbonContainer'
import useRemoteService from './client/RemoteServiceHook'
import generateEstimations from '../data/generateEstimations'
import { ServiceResult, EstimationResult } from '../models/types'
import moment from 'moment'

jest.mock('./client/RemoteServiceHook')
jest.mock('../themes')
jest.mock('apexcharts', () => ({
  exec: jest.fn(() => {
    /* eslint-disable */
    return new Promise((resolve, reject) => {
      resolve('uri')
    })
  }),
}))

const mockUseRemoteService = useRemoteService as jest.MockedFunction<typeof useRemoteService>

describe('CloudCarbonContainer', () => {
  let data: EstimationResult[]

  beforeEach(() => {
    data = generateEstimations(moment.utc(), 14)

    const mockReturnValue: ServiceResult = { loading: false, data: data }
    mockUseRemoteService.mockReturnValue(mockReturnValue)
  })

  afterEach(() => {
    mockUseRemoteService.mockClear()
  })

  test('match against snapshot', () => {
    const { getByTestId } = render(<CloudCarbonContainer />)

    expect(getByTestId('fake-line-chart')).toBeInTheDocument()
    // expect(getByTestId('fake-donut-chart')).toBeInTheDocument()
  })

  test('today and 6 months ago should be passed in to remote service hook', () => {
    render(<CloudCarbonContainer />)

    const parameters = mockUseRemoteService.mock.calls[0]

    expect(parameters.length).toEqual(3)

    const initial = parameters[0]
    const startDate = parameters[1]
    const endDate = parameters[2]
    expect(initial).toEqual([])
    expect(startDate.year()).toEqual(endDate.year() - 1)
    expect(startDate.month()).toEqual(endDate.month() + 6)
    expect(startDate.date()).toEqual(2)

    expect(endDate.isSame(moment.utc(), 'day')).toBeTruthy()
  })

  test('show loading icon if data has not been returned', () => {
    const mockLoading: ServiceResult = { loading: true, data: data }
    mockUseRemoteService.mockReturnValue(mockLoading)

    const { getByRole } = render(<CloudCarbonContainer />)

    expect(getByRole('progressbar')).toBeInTheDocument()
  })
})
