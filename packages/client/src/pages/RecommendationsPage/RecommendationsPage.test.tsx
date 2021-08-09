/*
 * © 2021 Thoughtworks, Inc.
 */

import { fireEvent, render, screen } from '@testing-library/react'
import { RecommendationResult } from '@cloud-carbon-footprint/common'
import RecommendationsPage from './RecommendationsPage'
import { mockRecommendationData } from 'utils/data'
import { useRemoteRecommendationsService } from 'utils/hooks'
import { ServiceResult } from 'Types'

jest.mock('utils/hooks/RecommendationsServiceHook')

const mockedUseRecommendationsService =
  useRemoteRecommendationsService as jest.MockedFunction<
    typeof useRemoteRecommendationsService
  >

describe('Recommendations Page', () => {
  beforeEach(() => {
    const mockRecommendationsReturnValue: ServiceResult<RecommendationResult> =
      {
        loading: false,
        data: mockRecommendationData,
      }
    mockedUseRecommendationsService.mockReturnValue(
      mockRecommendationsReturnValue,
    )
  })

  it('renders a table with recommendations', () => {
    const { getByRole } = render(<RecommendationsPage />)

    expect(getByRole('grid')).toBeInTheDocument()
  })

  it('retrieves data from the remote Recommendations hook', () => {
    render(<RecommendationsPage />)

    expect(mockedUseRecommendationsService).toHaveBeenCalledTimes(1)
  })

  it('displays a selected recommendation in a side panel when its row is clicked', () => {
    const { getByText, queryByTestId } = render(<RecommendationsPage />)

    expect(queryByTestId('sideBarTitle')).toBeFalsy()

    fireEvent.click(screen.getByText('test-acc-1'))
    const recommendationDetail = getByText(
      mockRecommendationData[0].recommendationDetail,
    )

    expect(queryByTestId('sideBarTitle')).toBeInTheDocument()
    expect(recommendationDetail).toBeInTheDocument()
  })
})
