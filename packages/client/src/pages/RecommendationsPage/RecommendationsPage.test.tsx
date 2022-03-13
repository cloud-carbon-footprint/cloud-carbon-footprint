/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import {
  EstimationResult,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'
import RecommendationsPage from './RecommendationsPage'
import { generateEstimations, mockRecommendationData } from '../../utils/data'
import {
  useRemoteFootprintService,
  useRemoteRecommendationsService,
} from '../../utils/hooks'
import { ServiceResult } from '../../Types'
import moment from 'moment'
import { act } from 'react-dom/test-utils'

jest.mock('../../utils/hooks/RecommendationsServiceHook')
jest.mock('../../utils/hooks/FootprintServiceHook')

const mockedUseRecommendationsService =
  useRemoteRecommendationsService as jest.MockedFunction<
    typeof useRemoteRecommendationsService
  >

const mockUseRemoteService = useRemoteFootprintService as jest.MockedFunction<
  typeof useRemoteFootprintService
>

// Set Test Date for Moment
moment.now = () => +new Date('2021-12-01T00:00:00.000Z')

describe('Recommendations Page', () => {
  let data: EstimationResult[]
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

    data = generateEstimations(moment.utc(), 12)
    const mockReturnValue: ServiceResult<EstimationResult> = {
      loading: false,
      data: data,
      error: null,
    }
    mockUseRemoteService.mockReturnValue(mockReturnValue)
  })

  afterEach(() => {
    mockUseRemoteService.mockClear()
    mockedUseRecommendationsService.mockClear()
  })

  it('renders a table with recommendations', () => {
    const { getByRole } = render(<RecommendationsPage />)

    expect(getByRole('grid')).toBeInTheDocument()
  })

  it('retrieves data from the remote Recommendations hook', () => {
    render(<RecommendationsPage />)

    expect(mockedUseRecommendationsService).toHaveBeenCalled()
  })

  it('should pass in to remote service hook today and one month prior', () => {
    const onApiError = jest.fn()
    render(<RecommendationsPage onApiError={onApiError} />)

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
    }

    const mockEmissionsLoading: ServiceResult<EstimationResult> = {
      loading: true,
      data,
    }

    mockedUseRecommendationsService.mockReturnValue(mockRecommendationsLoading)
    mockUseRemoteService.mockReturnValue(mockEmissionsLoading)

    const { getByRole } = render(<RecommendationsPage />)

    expect(getByRole('progressbar')).toBeInTheDocument()
  })

  it('displays a selected recommendation in a side panel when its row is clicked', () => {
    const { getByText, queryByTestId } = render(<RecommendationsPage />)

    expect(queryByTestId('sideBarTitle')).toBeFalsy()

    fireEvent.click(screen.getByText('test-a'))
    const recommendationDetail = getByText(
      mockRecommendationData[0].recommendationDetail,
    )

    expect(queryByTestId('sideBarTitle')).toBeInTheDocument()
    expect(recommendationDetail).toBeInTheDocument()
  })

  it('hides and re-displays the side panel when a recommendation row is clicked multiple times', () => {
    const { getByText, queryByTestId } = render(<RecommendationsPage />)

    fireEvent.click(screen.getByText('test-a'))
    fireEvent.click(screen.getByText('test-a', { selector: 'div' }))
    // selector added because now there are multiple elements with the text 'test-a' on the screen

    expect(queryByTestId('sideBarTitle')).toBeFalsy()

    fireEvent.click(screen.getByText('test-a'))
    const recommendationDetail = getByText(
      mockRecommendationData[0].recommendationDetail,
    )

    expect(queryByTestId('sideBarTitle')).toBeInTheDocument()
    expect(recommendationDetail).toBeInTheDocument()
  })

  it('displays a new recommendation in the side panel when its recommendation row is clicked', () => {
    const { getByText, queryByText, queryByTestId } = render(
      <RecommendationsPage />,
    )

    fireEvent.click(screen.getByText('test-a'))
    fireEvent.click(screen.getByText('test-b'))
    const firstRecommendationDetail = queryByText(
      mockRecommendationData[0].recommendationDetail,
    )
    const secondRecommendationDetail = getByText(
      mockRecommendationData[1].recommendationDetail,
    )

    expect(queryByTestId('sideBarTitle')).toBeInTheDocument()
    expect(firstRecommendationDetail).toBeFalsy()
    expect(secondRecommendationDetail).toBeInTheDocument()
  })

  it('re-displays the side panel when the close button and then the same recommendation row is clicked', () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <RecommendationsPage />,
    )

    fireEvent.click(screen.getByText('test-a'))

    const closeIcon = getByTestId('closeIcon')

    act(() => {
      fireEvent.click(closeIcon)
    })

    fireEvent.click(screen.getByText('test-a'))
    const recommendationDetail = getByText(
      mockRecommendationData[0].recommendationDetail,
    )

    expect(queryByTestId('sideBarTitle')).toBeInTheDocument()
    expect(recommendationDetail).toBeInTheDocument()
  })

  it('should render a filter bar on the page', () => {
    const { getByTestId } = render(<RecommendationsPage />)

    expect(getByTestId('filterBar')).toBeInTheDocument()
  })

  it('should render a toggle bar on the page', () => {
    const { getByTestId } = render(<RecommendationsPage />)

    expect(getByTestId('toggle')).toBeInTheDocument()
  })
})
