/*
 * © 2021 Thoughtworks, Inc.
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import ForecastCard from './ForecastCard'
import each from 'jest-each'
import { Co2eUnit } from '../../../../Types'

describe('Forecast Card', () => {
  it('should render the card', () => {
    const { getByTestId } = render(
      <ForecastCard id="test" title="Title" co2eSavings="0" costSavings="0" />,
    )

    expect(getByTestId('forecast-card-test')).toBeInTheDocument()
  })

  const testProps = [
    ['title', { title: 'test-title' }],
    ['co2eSavings', { co2eSavings: 255 }],
    ['costSavings', { costSavings: 16500 }],
  ]
  each(testProps).it(
    'should display the %s that we pass through',
    (key, props) => {
      const { getByText } = render(<ForecastCard {...props} />)

      expect(getByText(props[key])).toBeInTheDocument()
    },
  )

  it('should render percents badge if percentChange is passed with defined value', () => {
    const { getByText } = render(
      <ForecastCard
        title="Title"
        co2eSavings="0"
        costSavings="0"
        co2ePercentChange={25}
        costPercentChange={null}
        id="test"
      />,
    )

    expect(getByText('25%')).toBeInTheDocument()
    expect(getByText('-')).toBeInTheDocument()
  })

  it('should render kilograms if toggle is set to kilograms', () => {
    const { getByText, queryByText } = render(
      <ForecastCard
        title="Title"
        co2eSavings="1"
        costSavings="1"
        co2eUnit={Co2eUnit.Kilograms}
        id="test"
      />,
    )
    expect(getByText('Kilograms CO2e')).toBeInTheDocument()
    expect(queryByText('Metric Tons CO2e')).not.toBeInTheDocument()
  })

  it('should render metric tons if toggle is not set to kilograms', () => {
    const { getByText, queryByText } = render(
      <ForecastCard
        title="Title"
        co2eSavings="9"
        costSavings="1"
        co2eUnit={Co2eUnit.MetricTonnes}
        id="test"
      />,
    )
    expect(getByText('Metric Tons CO2e')).toBeInTheDocument()
    expect(queryByText('Kilograms CO2e')).not.toBeInTheDocument()
  })

  describe('Tooltip', () => {
    it('should render with the expected message', async () => {
      const { getByText } = render(
        <ForecastCard
          id="test"
          title="Title"
          co2eSavings="9"
          costSavings="1"
          co2ePercentChange={25}
          costPercentChange={null}
        />,
      )

      fireEvent.mouseOver(screen.getByTestId('tooltip'))

      const expectedMessage =
        'Your savings opportunity over 30 days is larger than your current carbon or spend. For a percentage to be shown, additional data may be needed.'

      await waitFor(() => {
        expect(getByText(expectedMessage)).toBeVisible()
      })
    })

    const testCases = [
      [{ co2ePercentChange: 25, costPercentChange: null }, true],
      [{ co2ePercentChange: null, costPercentChange: 25 }, true],
      [{ co2ePercentChange: null, costPercentChange: null }, true],
      [{ co2ePercentChange: -25, costPercentChange: 25 }, false],
    ]
    each(testCases).it(
      'should only render a tooltip if one of the projected costs are not calculated',
      (percentageProps, expectedResult) => {
        const { queryByTestId } = render(
          <ForecastCard
            id="test"
            title="Title"
            co2eSavings="9"
            costSavings="1"
            co2eUnit={Co2eUnit.MetricTonnes}
            {...percentageProps}
          />,
        )

        const tooltipIsRendered = !!queryByTestId('tooltip')

        expect(tooltipIsRendered).toBe(expectedResult)
      },
    )
  })
})
