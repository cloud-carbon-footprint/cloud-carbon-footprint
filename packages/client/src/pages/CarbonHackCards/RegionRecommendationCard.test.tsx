import React from 'react'
import { render } from '@testing-library/react'
import RegionRecommendationCard from './RegionRecommendationCard'
import { mockData } from '../../utils/data/mockData'

describe('RegionRecommendationCard', () => {
  it('renders the heading for the region recommendation card', async () => {
    const { getByText } = render(<RegionRecommendationCard data={mockData} />)
    const cardHeading = getByText(
      'Best Location to Shift your Deployed Location',
    )
    expect(cardHeading).toBeInstanceOf(HTMLElement)
  })
})
