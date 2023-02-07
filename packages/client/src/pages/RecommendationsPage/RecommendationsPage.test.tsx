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
import { ServiceResult } from '../../Types'

jest.mock('../../utils/hooks/RecommendationsServiceHook')
jest.mock('../../utils/hooks/FootprintServiceHook')
jest.mock('../../ConfigLoader', () => ({
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
    BASE_URL: '/api',
  }),
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
  })

  afterEach(() => {
    mockedUseRecommendationsService.mockClear()
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
    // const getByTextValue =
    //   'There is not enough data available to properly forecast. Please adjust your start/end date or groupBy parameter to include at least the prior 30 days of data.'

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
})
