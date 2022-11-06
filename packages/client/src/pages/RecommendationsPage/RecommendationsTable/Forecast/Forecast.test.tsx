/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import { render, within } from '@testing-library/react'
import { ServiceData } from '@cloud-carbon-footprint/common'
import {
  mockDataWithLargeNumbers,
  mockDataWithSmallNumbers,
  mockRecommendationData,
} from '../../../../utils/data'
import Forecast, { ForecastProps } from './Forecast'
import { Co2eUnit } from '../../../../Types'

describe('Forecast', () => {
  const emissionsData: ServiceData[] =
    mockDataWithLargeNumbers[0].serviceEstimates
  const testProps: ForecastProps = {
    emissionsData,
    recommendations: mockRecommendationData,
    co2eUnit: Co2eUnit.MetricTonnes,
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

  it('should show expected current and projected forecast totals', () => {
    const { getByTestId } = render(<Forecast {...testProps} />)

    const currentForecast = within(
      getByTestId('forecast-card-last-thirty-day-total'),
    )

    const projectedForecast = within(
      getByTestId('forecast-card-projected-thirty-day-total'),
    )

    const percentBadges = projectedForecast.queryAllByTestId(
      'percentage-badge-label',
    )

    expect(currentForecast.getByText('327')).toBeInTheDocument()
    expect(currentForecast.getByText('$528.72')).toBeInTheDocument()

    expect(projectedForecast.getByText('323.22')).toBeInTheDocument()
    expect(projectedForecast.getByText('$228.72')).toBeInTheDocument()
    expect(percentBadges[0].innerHTML).toBe('2%')
    expect(percentBadges[1].innerHTML).toBe('57%')
  })

  it('should show a projected forecast of zero if the savings are less than current forecast', () => {
    const smallEmissionsData: ServiceData[] =
      mockDataWithSmallNumbers[0].serviceEstimates
    const { getByTestId } = render(
      <Forecast {...testProps} emissionsData={smallEmissionsData} />,
    )

    const projectedForecast = within(
      getByTestId('forecast-card-projected-thirty-day-total'),
    )

    const percentBadges = projectedForecast.queryAllByTestId(
      'percentage-badge-label',
    )

    expect(projectedForecast.getByText('0')).toBeInTheDocument()
    expect(projectedForecast.getByText('$0')).toBeInTheDocument()
    expect(percentBadges[0].innerHTML).toBe('-')
    expect(percentBadges[1].innerHTML).toBe('-')
  })

  it('should render the equivalency card', () => {
    const { getByText } = render(<Forecast {...testProps} />)
    const current = getByText('Monthly Savings Equal To')

    expect(current).toBeInTheDocument()
  })
})
