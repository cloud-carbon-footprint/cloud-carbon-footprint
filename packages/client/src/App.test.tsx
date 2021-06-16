/*
 * © 2021 ThoughtWorks, Inc.
 */

import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'
import generateEstimations, {
  fakeEmissionFactors,
} from './data/generateEstimations'
import moment from 'moment'

import App from './App'
import { useRemoteService, useRemoteEmissionService } from './utils/hooks'
import {
  EstimationResult,
  EmissionRatioResult,
} from '@cloud-carbon-footprint/common'
import { ServiceResult } from './models/types'

jest.mock('./utils/hooks/RemoteServiceHook')
jest.mock('./utils/hooks/EmissionFactorServiceHook')
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
const mockedUseEmissionFactorService =
  useRemoteEmissionService as jest.MockedFunction<
    typeof useRemoteEmissionService
  >

describe('App', () => {
  beforeEach(() => {
    const mockReturnValue: ServiceResult<EstimationResult> = {
      loading: false,
      data: generateEstimations(moment.utc(), 14),
    }
    const mockEmissionsReturnValue: ServiceResult<EmissionRatioResult> = {
      loading: false,
      data: fakeEmissionFactors,
    }
    mockedUseEmissionFactorService.mockReturnValue(mockEmissionsReturnValue)
    mockedUseRemoteService.mockReturnValue(mockReturnValue)
  })

  afterEach(() => {
    mockedUseEmissionFactorService.mockClear()
    mockedUseRemoteService.mockClear()
  })

  it('renders with correct configuration', () => {
    expect(true).toEqual(true)
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
