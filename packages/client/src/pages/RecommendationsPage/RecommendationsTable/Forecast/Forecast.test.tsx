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

  it('should render the title', async () => {
    const { findByText } = render(<Forecast {...testProps} />)
    const forecast = await findByText('Forecast')

    expect(forecast).toBeInTheDocument()
  })

  it('should render the current forecast card', async () => {
    const { findByText } = render(<Forecast {...testProps} />)
    const current = await findByText('Current Total')

    expect(current).toBeInTheDocument()
  })

  it('should render the equivalency card', () => {
    const { getByText } = render(<Forecast {...testProps} />)
    const current = getByText('Savings equal to')

    expect(current).toBeInTheDocument()
  })
})
