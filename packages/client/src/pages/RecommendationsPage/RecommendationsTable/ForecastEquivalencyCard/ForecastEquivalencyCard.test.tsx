/*
 * © 2021 Thoughtworks, Inc.
 */

import { render } from '@testing-library/react'
import ForecastEquivalencyCard from './ForecastEquivalencyCard'
import each from 'jest-each'

describe('Forecast Equivalency Card', () => {
  it('should render the card', () => {
    const { getByTestId } = render(
      <ForecastEquivalencyCard
        title="Title"
        treeSeedlings="0"
        yearCostSavings="0"
      />,
    )

    expect(getByTestId('forecast-equivalency-card')).toBeInTheDocument()
  })

  const testProps = [
    ['title', { title: 'test-title' }, 'test-title'],
    ['treeSeedlings', { treeSeedlings: 255 }, 'Tree seedlings grown'],
    ['yearCostSavings', { yearCostSavings: 16500 }, 'Dollars per month'],
  ]
  each(testProps).it(
    'should display the %s that we pass through',
    (key, props, subLabel) => {
      const { getByText } = render(<ForecastEquivalencyCard {...props} />)

      expect(getByText(props[key])).toBeInTheDocument()
      expect(getByText(subLabel)).toBeInTheDocument()
    },
  )
})
