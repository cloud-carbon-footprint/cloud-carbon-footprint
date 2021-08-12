/*
 * © 2021 Thoughtworks, Inc.
 */

import { render } from '@testing-library/react'
import { mockRecommendationData } from 'utils/data'
import RecommendationsSidePanel from './RecommendationsSidePanel'

describe('Recommendations Side Panel', () => {
  const mockRecommendationRow = {
    ...mockRecommendationData[0],
    id: 0,
    accountId: 'test-account-1-id',
  }
  it('Renders a side panel titled "Recommendation Details"', () => {
    const { getByTestId } = render(
      <RecommendationsSidePanel recommendation={mockRecommendationRow} />,
    )

    expect(getByTestId('sideBarTitle').innerHTML).toBe('Recommendation Details')
  })

  it('displays the details of the given recommendation', () => {
    const { getByText } = render(
      <RecommendationsSidePanel recommendation={mockRecommendationRow} />,
    )

    expect(getByText(mockRecommendationRow.cloudProvider)).toBeInTheDocument()
    expect(getByText(mockRecommendationRow.accountName)).toBeInTheDocument()
    expect(getByText(mockRecommendationRow.accountId)).toBeInTheDocument()
    expect(getByText(mockRecommendationRow.region)).toBeInTheDocument()
    expect(
      getByText(mockRecommendationRow.recommendationType),
    ).toBeInTheDocument()
    expect(
      getByText(mockRecommendationRow.recommendationDetail),
    ).toBeInTheDocument()
  })

  it('displays the potential savings for the given recommendation', () => {
    const { getByText } = render(
      <RecommendationsSidePanel recommendation={mockRecommendationRow} />,
    )

    expect(
      getByText(mockRecommendationRow.costSavings.toFixed(3)),
    ).toBeInTheDocument()
    expect(
      getByText(mockRecommendationRow.co2eSavings.toFixed(3)),
    ).toBeInTheDocument()
    expect(
      getByText(mockRecommendationRow.kilowattHourSavings.toFixed(3)),
    ).toBeInTheDocument()
  })

  it('displays a "-" for recommendations with undefined data', () => {
    const mockUndefinedRecommendation = {
      id: 0,
      cloudProvider: '-',
      accountId: '-',
      accountName: '-',
      region: '-',
      recommendationType: '-',
      recommendationDetail: '-',
      costSavings: 0,
      co2eSavings: 0,
      kilowattHourSavings: 0,
    }
    const { getAllByText } = render(
      <RecommendationsSidePanel recommendation={mockUndefinedRecommendation} />,
    )

    const undefinedDetails = getAllByText('-')
    const undefinedNumbers = getAllByText('0')

    expect(undefinedDetails).toHaveLength(6)
    expect(undefinedNumbers).toHaveLength(3)
  })
})
