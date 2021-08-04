/*
 * © 2021 Thoughtworks, Inc.
 */

import { render } from '@testing-library/react'
import RecommendationsPage from './RecommendationsPage'
import { useRemoteRecommendationsService } from 'utils/hooks'
import { ServiceResult } from 'Types'
import { RecommendationResult } from '@cloud-carbon-footprint/common'

jest.mock('utils/hooks/RecommendationsServiceHook')

const mockedUseRecommendationsService =
  useRemoteRecommendationsService as jest.MockedFunction<
    typeof useRemoteRecommendationsService
  >

//TODO: Extract this into utils/data so it can be reused as fakeRecommendationData
const mockRecommendations: RecommendationResult[] = [
  {
    cloudProvider: 'AWS',
    accountId: 'test-acc-1',
    accountName: 'test-acc-1',
    region: 'us-west-1',
    recommendationType: 'Modify',
    recommendationDetail: 'Test recommendation detail',
    costSavings: 200,
    co2eSavings: 2.539,
    kilowattHourSavings: 3.2,
  },
  {
    cloudProvider: 'AWS',
    accountId: 'test-acc-1',
    accountName: 'test-acc-2',
    region: 'us-west-2',
    recommendationType: 'Terminate',
    recommendationDetail: 'Test recommendation detail',
    costSavings: 100,
    co2eSavings: 1.24,
    kilowattHourSavings: 6.2,
  },
]

describe('Recommendations Page', () => {
  let data: RecommendationResult[] = []

  beforeEach(() => {
    data = mockRecommendations

    const mockRecommendationsReturnValue: ServiceResult<RecommendationResult> =
      {
        loading: false,
        data: data,
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
})
