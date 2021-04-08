/*
 * © 2021 ThoughtWorks, Inc.
 */

import React from 'react'
import moment from 'moment'
import { render } from '@testing-library/react'

import CloudCarbonContainer from './CloudCarbonContainer'
import useRemoteService from './client/RemoteServiceHook'
import generateEstimations, {
  fakeEmissionFactors,
} from '../data/generateEstimations'
import {
  ServiceResult,
  EstimationResult,
  EmissionsRatios,
} from '../models/types'
import useRemoteEmissionService from './client/EmissionFactorServiceHook'

jest.mock('./client/RemoteServiceHook')
jest.mock('./client/EmissionFactorServiceHook')
jest.mock('../themes')
jest.mock('apexcharts', () => ({
  exec: jest.fn(() => {
    /* eslint-disable */
    return new Promise((resolve, reject) => {
      resolve('uri')
    })
  }),
}))

jest.mock('../ConfigLoader', () => ({
  __esModule: true,
  default: () => ({
    CURRENT_PROVIDERS: [
      { key: 'aws', name: 'AWS' },
      { key: 'gcp', name: 'GCP' },
    ],
    PREVIOUS_YEAR_OF_USAGE: true,
    DATE_RANGE: {
      VALUE: '7',
      TYPE: 'days',
    },
  }),
}))

const mockedUseEmissionFactorService = useRemoteEmissionService as jest.MockedFunction<
  typeof useRemoteEmissionService
>

const mockUseRemoteService = useRemoteService as jest.MockedFunction<
  typeof useRemoteService
>

describe('CloudCarbonContainer', () => {
  let data: EstimationResult[]

  beforeEach(() => {
    data = generateEstimations(moment.utc(), 14)

    const mockReturnValue: ServiceResult<EstimationResult> = {
      loading: false,
      data: data,
    }
    const mockEmissionsReturnValue: ServiceResult<EmissionsRatios> = {
      loading: false,
      data: fakeEmissionFactors,
    }
    mockedUseEmissionFactorService.mockReturnValue(mockEmissionsReturnValue)
    mockUseRemoteService.mockReturnValue(mockReturnValue)
  })

  afterEach(() => {
    mockedUseEmissionFactorService.mockClear()
    mockUseRemoteService.mockClear()
  })

  test('match against snapshot', () => {
    const { getByTestId } = render(<CloudCarbonContainer />)

    expect(getByTestId('fake-line-chart')).toBeInTheDocument()
    // expect(getByTestId('fake-donut-chart')).toBeInTheDocument()
  })

  test('today and january first of the last year should be passed in to remote service hook', () => {
    render(<CloudCarbonContainer />)

    const parameters = mockUseRemoteService.mock.calls[0]

    expect(parameters.length).toEqual(3)

    const initial = parameters[0]
    const startDate = parameters[1]
    const endDate = parameters[2]

    expect(initial).toEqual([])
    expect(startDate.year()).toEqual(endDate.year() - 1)
    expect(startDate.month()).toEqual(0)
    expect(startDate.date()).toEqual(1)

    expect(endDate.isSame(moment.utc(), 'day')).toBeTruthy()
  })

  test('show loading icon if data has not been returned', () => {
    const mockLoading: ServiceResult<EstimationResult> = {
      loading: true,
      data: data,
    }
    mockUseRemoteService.mockReturnValue(mockLoading)

    const { getByRole } = render(<CloudCarbonContainer />)

    expect(getByRole('progressbar')).toBeInTheDocument()
  })
})
