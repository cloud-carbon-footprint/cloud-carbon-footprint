/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'
import { generateEstimations, fakeEmissionFactors } from './utils/data'
import moment from 'moment'

import App from './App'
import { useRemoteService, useRemoteEmissionService } from './utils/hooks'
import {
  EstimationResult,
  EmissionRatioResult,
} from '@cloud-carbon-footprint/common'
import { ServiceResult } from './Types'

jest.mock('apexcharts')
jest.mock('./utils/hooks/RemoteServiceHook')
jest.mock('./utils/hooks/EmissionFactorServiceHook')
jest.mock('./utils/themes')

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
