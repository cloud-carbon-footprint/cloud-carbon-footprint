/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import { render } from '@testing-library/react'
import {
  EstimationResult,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'
import RecommendationsPage from './RecommendationsPage'
import { generateEstimations, mockRecommendationData } from '../../utils/data'
import {
  useRemoteRecommendationsService,
} from '../../utils/hooks'
import { ServiceResult } from '../../Types'
import moment from 'moment'

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
  let data: EstimationResult[] = generateEstimations(moment.utc(), 12)
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

  it('renders a table with recommendations', () => {
    const { getByRole } = render(<RecommendationsPage onApiError={null} footprint={mockFootprintData} />)

    expect(getByRole('grid')).toBeInTheDocument()
  })

  it('retrieves data from the remote Recommendations hook', () => {
    render(<RecommendationsPage onApiError={null} footprint={mockFootprintData} />)

    expect(mockedUseRecommendationsService).toHaveBeenCalled()
  })

  xit('should pass in to remote service hook today and one month prior', () => {

    render(<RecommendationsPage  onApiError={null} footprint={mockFootprintData}/>)
    const onApiError = jest.fn()
    const parameters = mockUseRemoteService.mock.calls[0][0]

    expect(parameters.startDate.month()).toEqual(parameters.endDate.month() - 1)
    expect(parameters.endDate.isSame(moment.utc(), 'day')).toBeTruthy()
    expect(parameters.ignoreCache).toBeTruthy()
    expect(parameters.onApiError).toEqual(onApiError)
    expect(parameters.baseUrl).toEqual('/api')
  })

  it('should show loading icon if data has not been returned', () => {
    const mockRecommendationsLoading: ServiceResult<RecommendationResult> = {
      loading: true,
      data: mockRecommendationData,
      error: null
    }

    const mockEmissionsLoading: ServiceResult<EstimationResult> = {
      loading: true,
      data,
      error: null
    }

    mockedUseRecommendationsService.mockReturnValue(mockRecommendationsLoading)

    const { getByRole } = render(<RecommendationsPage onApiError={null} footprint={mockFootprintData} />)

    expect(getByRole('progressbar')).toBeInTheDocument()
  })

  it('should render a filter bar on the page', () => {
    const { getByTestId } = render(<RecommendationsPage onApiError={null} footprint={mockFootprintData} />)

    expect(getByTestId('filterBar')).toBeInTheDocument()
  })

  it('should render a toggle bar on the page', () => {
    const { getByTestId } = render(<RecommendationsPage onApiError={null} footprint={mockFootprintData}/>)

    expect(getByTestId('toggle')).toBeInTheDocument()
  })
})
