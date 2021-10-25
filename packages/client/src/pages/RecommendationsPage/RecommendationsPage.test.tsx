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
import { generateEstimations, mockRecommendationData } from 'utils/data'
import { useRemoteRecommendationsService, useRemoteService } from 'utils/hooks'
import { ServiceResult } from 'Types'
import moment from 'moment'

jest.mock('utils/hooks/RecommendationsServiceHook')
jest.mock('utils/hooks/RemoteServiceHook')

const mockedUseRecommendationsService =
  useRemoteRecommendationsService as jest.MockedFunction<
    typeof useRemoteRecommendationsService
  >

const mockUseRemoteService = useRemoteService as jest.MockedFunction<
  typeof useRemoteService
>

describe('Recommendations Page', () => {
  let data: EstimationResult[]
  beforeEach(() => {
    const mockRecommendationsReturnValue: ServiceResult<RecommendationResult> =
      {
        loading: false,
        data: mockRecommendationData,
      }
    mockedUseRecommendationsService.mockReturnValue(
      mockRecommendationsReturnValue,
    )

    data = generateEstimations(moment.utc(), 12)
    const mockReturnValue: ServiceResult<EstimationResult> = {
      loading: false,
      data: data,
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
    render(<RecommendationsPage />)

    const parameters = mockUseRemoteService.mock.calls[0]

    expect(parameters.length).toEqual(3)

    const initial = parameters[0]
    const startDate = parameters[1]
    const endDate = parameters[2]

    expect(initial).toEqual([])
    expect(startDate.month()).toEqual(endDate.month() - 1)

    expect(endDate.isSame(moment.utc(), 'day')).toBeTruthy()
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

  it('should render a filter bar on the page', () => {
    const { getByTestId } = render(<RecommendationsPage />)

    expect(getByTestId('filterBar')).toBeInTheDocument()
  })

  it('should render a toggle bar on the page', () => {
    const { getByTestId } = render(<RecommendationsPage />)

    expect(getByTestId('toggle')).toBeInTheDocument()
  })
})
