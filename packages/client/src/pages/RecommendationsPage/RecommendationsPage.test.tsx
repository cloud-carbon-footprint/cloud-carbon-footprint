/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import moment from 'moment'
import { render } from '@testing-library/react'
import {
  EstimationResult,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'
import RecommendationsPage from './RecommendationsPage'
import { generateEstimations, mockRecommendationData } from '../../utils/data'
import { useRemoteRecommendationsService } from '../../utils/hooks'
import configLoader from '../../ConfigLoader'
import { ServiceResult } from '../../Types'
import * as helpers from '../../utils/helpers/handleDates'

jest.mock('../../utils/hooks/RecommendationsServiceHook')
jest.mock('../../utils/hooks/FootprintServiceHook')
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
    GROUP_BY: 'day',
  })),
}))

const mockedUseRecommendationsService =
  useRemoteRecommendationsService as jest.MockedFunction<
    typeof useRemoteRecommendationsService
  >

// Set Test Date for Moment
moment.now = () => +new Date('2021-12-01T00:00:00.000Z')

describe('Recommendations Page', () => {
  const data: EstimationResult[] = generateEstimations(moment.utc(), 12)
  const mockFootprintData: ServiceResult<EstimationResult> = {
    loading: false,
    data: data,
    error: null,
  }
  beforeEach(() => {
    const mockRecommendationsReturnValue: ServiceResult<RecommendationResult> =
      {
        loading: false,
        data: mockRecommendationData,
        error: null,
      }
    mockedUseRecommendationsService.mockReturnValue(
      mockRecommendationsReturnValue,
    )
    ;(configLoader as jest.Mock).mockImplementation(() => ({
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
      GROUP_BY: 'day',
    }))
  })

  afterEach(() => {
    mockedUseRecommendationsService.mockClear()
    jest.clearAllMocks()
  })

  it('renders an error message for forecast when missing emissions data', () => {
    const newMockFootprintData: ServiceResult<EstimationResult> = {
      loading: false,
      data: [],
      error: null,
    }
    const { getByTestId } = render(
      <RecommendationsPage
        onApiError={null}
        footprint={newMockFootprintData}
      />,
    )

    expect(getByTestId('forecast-error-message')).toBeInTheDocument()
  })

  it('renders a table with recommendations', () => {
    const { getByRole } = render(
      <RecommendationsPage onApiError={null} footprint={mockFootprintData} />,
    )

    expect(getByRole('grid')).toBeInTheDocument()
  })

  it('retrieves data from the remote Recommendations hook', () => {
    render(
      <RecommendationsPage onApiError={null} footprint={mockFootprintData} />,
    )

    expect(mockedUseRecommendationsService).toHaveBeenCalled()
  })

  it('should show loading icon if data has not been returned', () => {
    const mockRecommendationsLoading: ServiceResult<RecommendationResult> = {
      loading: true,
      data: [],
      error: null,
    }

    mockedUseRecommendationsService.mockReturnValue(mockRecommendationsLoading)

    const { getByRole } = render(
      <RecommendationsPage onApiError={null} footprint={mockFootprintData} />,
    )

    expect(getByRole('progressbar')).toBeInTheDocument()
  })

  it('should render a filter bar on the page', () => {
    const { getByTestId } = render(
      <RecommendationsPage onApiError={null} footprint={mockFootprintData} />,
    )

    expect(getByTestId('filterBar')).toBeInTheDocument()
  })

  it('should render a toggle bar on the page', () => {
    const { getByTestId } = render(
      <RecommendationsPage onApiError={null} footprint={mockFootprintData} />,
    )

    expect(getByTestId('toggle')).toBeInTheDocument()
  })

  it('skips checking for missing dates if forecast validation is disabled', () => {
    ;(configLoader as jest.Mock).mockImplementation(() => ({
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
      DISABLE_FORECAST_VALIDATION: 'true',
      GROUP_BY: 'day',
    }))

    const mockSmallFootprintData: ServiceResult<EstimationResult> = {
      loading: false,
      data: generateEstimations(moment.utc(), 1),
      error: null,
    }

    const checkDatesSpy = jest.spyOn(helpers, 'checkFootprintDates')

    render(
      <RecommendationsPage
        onApiError={null}
        footprint={mockSmallFootprintData}
      />,
    )

    expect(checkDatesSpy).not.toHaveBeenCalled()
  })
})
