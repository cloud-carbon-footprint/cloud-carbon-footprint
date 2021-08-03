/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import moment from 'moment'
import { render } from '@testing-library/react'

import {
  EstimationResult,
  EmissionRatioResult,
} from '@cloud-carbon-footprint/common'

import { useRemoteService, useRemoteEmissionService } from 'utils/hooks'
import { generateEstimations, fakeEmissionFactors } from 'utils/data'
import { ServiceResult } from 'Types'
import EmissionsMetricsPage from './EmissionsMetricsPage'

jest.mock('apexcharts')
jest.mock('utils/hooks/RemoteServiceHook')
jest.mock('utils/hooks/EmissionFactorServiceHook')
jest.mock('utils/themes')
jest.mock('ConfigLoader', () => ({
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

const mockedUseEmissionFactorService =
  useRemoteEmissionService as jest.MockedFunction<
    typeof useRemoteEmissionService
  >

const mockUseRemoteService = useRemoteService as jest.MockedFunction<
  typeof useRemoteService
>

describe('Emissions Metrics Page', () => {
  let data: EstimationResult[]

  beforeEach(() => {
    data = generateEstimations(moment.utc(), 14)

    const mockReturnValue: ServiceResult<EstimationResult> = {
      loading: false,
      data: data,
    }
    const mockEmissionsReturnValue: ServiceResult<EmissionRatioResult> = {
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

  it('should passed in to remote service hook today and january first of the last year', () => {
    render(<EmissionsMetricsPage />)

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

  it('should show loading icon if data has not been returned', () => {
    const mockLoading: ServiceResult<EstimationResult> = {
      loading: true,
      data: data,
    }
    mockUseRemoteService.mockReturnValue(mockLoading)

    const { getByRole } = render(<EmissionsMetricsPage />)

    expect(getByRole('progressbar')).toBeInTheDocument()
  })

  it('should render all components in the page', () => {
    const { getByText, getByTestId } = render(<EmissionsMetricsPage />)

    expect(getByTestId('filterBar')).toBeInTheDocument()
    expect(getByTestId('cloudUsage')).toBeInTheDocument()
    expect(getByText('Emissions Breakdown')).toBeInTheDocument()
    expect(getByTestId('carbonComparison')).toBeInTheDocument()
    expect(getByText('Carbon Intensity Map')).toBeInTheDocument()
  })
})
