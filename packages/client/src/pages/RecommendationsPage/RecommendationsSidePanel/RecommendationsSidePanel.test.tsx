/*
 * © 2021 Thoughtworks, Inc.
 */

import { render } from '@testing-library/react'
import { Co2eUnit } from 'src/Types'
import { mockRecommendationData } from '../../../utils/data'
import RecommendationsSidePanel from './RecommendationsSidePanel'

describe('Recommendations Side Panel', () => {
  const mockRecommendationRow = {
    ...mockRecommendationData[0],
    id: 0,
    accountId: 'test-account-1-id',
    co2eUnit: Co2eUnit.MetricTonnes,
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

  it('displays the correct resource name for EBS', () => {
    const newMockRecommendationRow = {
      ...mockRecommendationRow,
      recommendationType: 'Modify EBS',
    }
    const { getAllByText } = render(
      <RecommendationsSidePanel recommendation={newMockRecommendationRow} />,
    )
    expect(
      getAllByText(newMockRecommendationRow.resourceId)[1],
    ).toBeInTheDocument()
  })

  it('displays the correct resource name for Lambda', () => {
    const newMockRecommendationRow = {
      ...mockRecommendationRow,
      recommendationType: 'Modify Lambda',
      resourceId: 'resourceId:test',
    }
    const { getByText } = render(
      <RecommendationsSidePanel recommendation={newMockRecommendationRow} />,
    )
    expect(getByText('resourceId')).toBeInTheDocument()
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
