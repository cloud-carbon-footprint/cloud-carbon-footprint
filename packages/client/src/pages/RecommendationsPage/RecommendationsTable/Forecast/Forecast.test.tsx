/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import { render, within } from '@testing-library/react'
import { ServiceData } from '@cloud-carbon-footprint/common'
import { mockData, mockRecommendationData } from 'utils/data'
import Forecast, { ForecastProps } from './Forecast'
import { mockDataWithSmallNumbers } from '../../../../utils/data/mockData'

describe('Forecast', () => {
  const emissionsData: ServiceData[] = mockData[0].serviceEstimates
  const testProps: ForecastProps = {
    emissionsData,
    recommendations: mockRecommendationData,
    useKilograms: false,
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

  it('should show a projected forecast of zero if the savings are less than current forecast', () => {
    const smallEmissionsData: ServiceData[] =
      mockDataWithSmallNumbers[0].serviceEstimates
    const { getByTestId } = render(
      <Forecast {...testProps} emissionsData={smallEmissionsData} />,
    )

    const projectedForecastCard = within(
      getByTestId('forecast-card-projected-thirty-day-total'),
    )

    const percentBadges = projectedForecastCard.queryAllByTestId(
      'percentage-badge-label',
    )

    expect(projectedForecastCard.getByText('0')).toBeInTheDocument()
    expect(projectedForecastCard.getByText('$0')).toBeInTheDocument()
    expect(percentBadges[0].innerHTML).toBe('-')
    expect(percentBadges[1].innerHTML).toBe('-')
  })

  it('should render the equivalency card', () => {
    const { getByText } = render(<Forecast {...testProps} />)
    const current = getByText('Monthly Savings Equal To')

    expect(current).toBeInTheDocument()
  })
})
