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
    useKilograms: false,
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
    expect(getByText(mockRecommendationRow.instanceName)).toBeInTheDocument()
    expect(getByText(mockRecommendationRow.resourceId)).toBeInTheDocument()
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

    expect(getByText(mockRecommendationRow.costSavings)).toBeInTheDocument()
    expect(getByText(mockRecommendationRow.co2eSavings)).toBeInTheDocument()
    expect(
      getByText(mockRecommendationRow.kilowattHourSavings),
    ).toBeInTheDocument()
  })
})
