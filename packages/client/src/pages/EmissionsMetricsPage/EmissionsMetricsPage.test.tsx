/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import moment from 'moment'
import { render } from '@testing-library/react'

import {
  EmissionRatioResult,
  EstimationResult,
} from '@cloud-carbon-footprint/common'

import {
  useRemoteEmissionService,
  useRemoteFootprintService,
} from '../../utils/hooks'
import { fakeEmissionFactors, generateEstimations } from '../../utils/data'
import { ServiceResult } from '../../Types'
import EmissionsMetricsPage from './EmissionsMetricsPage'
import loadConfig from '../../ConfigLoader'

jest.mock('apexcharts')
jest.mock('../../utils/hooks/FootprintServiceHook')
jest.mock('../../utils/hooks/EmissionFactorServiceHook')
jest.mock('../../utils/themes')
jest.mock('../../ConfigLoader', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    CURRENT_PROVIDERS: [
      { key: 'aws', name: 'AWS' },
      { key: 'gcp', name: 'GCP' },
    ],
    PREVIOUS_YEAR_OF_USAGE: true,
    DATE_RANGE: {
      VALUE: '7',
      TYPE: 'days',
    },
    BASE_URL: '/api',
  })),
}))

const mockedUseEmissionFactorService =
  useRemoteEmissionService as jest.MockedFunction<
    typeof useRemoteEmissionService
  >

const mockUseRemoteService = useRemoteFootprintService as jest.MockedFunction<
  typeof useRemoteFootprintService
>

describe('Emissions Metrics Page', () => {
  let data: EstimationResult[]

  beforeEach(() => {
    ;(loadConfig as jest.Mock).mockImplementation(() => ({
      CURRENT_PROVIDERS: [
        { key: 'aws', name: 'AWS' },
        { key: 'gcp', name: 'GCP' },
      ],
      PREVIOUS_YEAR_OF_USAGE: true,
      DATE_RANGE: {
        VALUE: '7',
        TYPE: 'days',
      },
      BASE_URL: '/api',
    }))

    data = generateEstimations(moment.utc(), 14)

    const mockReturnValue: ServiceResult<EstimationResult> = {
      loading: false,
      data: data,
      error: null,
    }
    const mockEmissionsReturnValue: ServiceResult<EmissionRatioResult> = {
      loading: false,
      data: fakeEmissionFactors,
      error: null,
    }
    mockedUseEmissionFactorService.mockReturnValue(mockEmissionsReturnValue)
    mockUseRemoteService.mockReturnValue(mockReturnValue)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should passed in to remote service hook today and january first of the last year', () => {
    const onApiError = jest.fn()
    render(<EmissionsMetricsPage onApiError={onApiError} />)

    const parameters = mockUseRemoteService.mock.calls[0][0]

    expect(parameters.startDate.year()).toEqual(parameters.endDate.year() - 1)
    expect(parameters.startDate.month()).toEqual(0)
    expect(parameters.startDate.date()).toEqual(1)
    expect(parameters.endDate.isSame(moment.utc(), 'day')).toBeTruthy()
    expect(parameters.baseUrl).toEqual('/api')
    expect(parameters.onApiError).toEqual(onApiError)
  })

  it('should pass custom dates (when provided) into the service hook', () => {
    const onApiError = jest.fn()
    ;(loadConfig as jest.Mock).mockImplementation(() => ({
      CURRENT_PROVIDERS: [
        { key: 'aws', name: 'AWS' },
        { key: 'gcp', name: 'GCP' },
      ],
      PREVIOUS_YEAR_OF_USAGE: false,
      DATE_RANGE: {
        VALUE: '7',
        TYPE: 'days',
      },
      BASE_URL: '/api',
      START_DATE: '2020-01-01',
      END_DATE: '2020-01-31',
    }))

    const expectedStartDate = moment.utc('2020-01-01').toDate()
    const expectedEndDate = moment.utc('2020-01-31').toDate()

    render(<EmissionsMetricsPage onApiError={onApiError} />)

    const parameters = mockUseRemoteService.mock.calls[0][0]

    expect(parameters.startDate.toDate()).toEqual(expectedStartDate)
    expect(parameters.endDate.toDate()).toEqual(expectedEndDate)
    expect(parameters.baseUrl).toEqual('/api')
    expect(parameters.onApiError).toEqual(onApiError)
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
