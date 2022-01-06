/*
 * © 2021 Thoughtworks, Inc.
 */

import { render } from '@testing-library/react'
import ForecastCard from './ForecastCard'
import each from 'jest-each'

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

  it('should render percents badge if percentChange is passed to it', () => {
    const { getByText } = render(
      <ForecastCard
        title="Title"
        co2eSavings="0"
        costSavings="0"
        co2ePercentChange={25}
        costPercentChange={10}
        id="test"
      />,
    )

    expect(getByText('25%')).toBeInTheDocument()
    expect(getByText('10%')).toBeInTheDocument()
  })

  it('should render kilograms if toggle is set to kilograms', () => {
    const { getByText, queryByText } = render(
      <ForecastCard
        title="Title"
        co2eSavings="1"
        costSavings="1"
        useKilograms={true}
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
        useKilograms={false}
        id="test"
      />,
    )
    expect(getByText('Metric Tons CO2e')).toBeInTheDocument()
    expect(queryByText('Kilograms CO2e')).not.toBeInTheDocument()
  })
})
