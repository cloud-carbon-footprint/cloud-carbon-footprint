/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React from 'react'
import { render } from '@testing-library/react'
import App from './App'
import generateEstimations from './data/generateEstimations'
import moment from 'moment'
import useRemoteService from './dashboard/client/RemoteServiceHook'
import { ServiceResult, EstimationResult } from './models/types'
import { MemoryRouter } from 'react-router-dom'

jest.mock('./dashboard/client/RemoteServiceHook')
jest.mock('./themes')
jest.mock('apexcharts', () => ({
  exec: jest.fn(() => {
    /* eslint-disable */
    return new Promise((resolve, reject) => {
      resolve('uri')
    })
  }),
}))

const mockedUseRemoteService = useRemoteService as jest.MockedFunction<
  typeof useRemoteService
>

describe('App', () => {
  beforeEach(() => {
    const mockReturnValue: ServiceResult<EstimationResult> = {
      loading: false,
      data: generateEstimations(moment.utc(), 14),
    }
    mockedUseRemoteService.mockReturnValue(mockReturnValue)
  })

  it('renders the page title', () => {
    const { getByText } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const linkElement = getByText(/Cloud Carbon Footprint/i)
    expect(linkElement).toBeInTheDocument()
  })
})
