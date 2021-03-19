/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React from 'react'
import moment from 'moment'
import { render } from '@testing-library/react'

import CloudCarbonContainer from './CloudCarbonContainer'
import useRemoteService from './client/RemoteServiceHook'
import generateEstimations from '../data/generateEstimations'
import { ServiceResult, EstimationResult } from '../models/types'

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

jest.mock('../ConfigLoader', () => ({
  __esModule: true,
  default: () => ({
    CURRENT_PROVIDERS: [
      { key: 'aws', name: 'AWS' },
      { key: 'gcp', name: 'GCP' },
    ],
    DATE_RANGE: {
      VALUE: '7',
      TYPE: 'days',
    },
  }),
}))

const mockUseRemoteService = useRemoteService as jest.MockedFunction<
  typeof useRemoteService
>

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

  test('show loading icon if data has not been returned', () => {
    const mockLoading: ServiceResult = { loading: true, data: data }
    mockUseRemoteService.mockReturnValue(mockLoading)

    const { getByRole } = render(<CloudCarbonContainer />)

    expect(getByRole('progressbar')).toBeInTheDocument()
  })
})
