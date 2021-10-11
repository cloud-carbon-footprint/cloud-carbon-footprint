/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import { mockData, mockRecommendationData } from 'utils/data'
import Forecast from './Forecast'

describe('Forecast', () => {
  const emissionsData: EstimationResult[] = mockData
  const testProps = {
    emissionsData,
    recommendations: mockRecommendationData,
  }

  it('should render the title', () => {
    const { getByText } = render(<Forecast {...testProps} />)
    const forecast = getByText('Forecast')

    expect(forecast).toBeInTheDocument()
  })

  it('should render the current forecast card', () => {
    const { getByText } = render(<Forecast {...testProps} />)
    const current = getByText('Last 30 Day Total')

    expect(current).toBeInTheDocument()
  })

  it('should render the projected forecast card', () => {
    const { getByText } = render(<Forecast {...testProps} />)
    const current = getByText('Projected 30 Day Total')

    expect(current).toBeInTheDocument()
  })

  it('should render the equivalency card', () => {
    const { getByText } = render(<Forecast {...testProps} />)
    const current = getByText('Monthly savings equal to')

    expect(current).toBeInTheDocument()
  })
})
