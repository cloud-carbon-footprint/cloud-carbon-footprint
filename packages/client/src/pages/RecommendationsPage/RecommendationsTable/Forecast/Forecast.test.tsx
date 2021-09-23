/*
 * © 2021 Thoughtworks, Inc.
 */

import { render } from '@testing-library/react'
import Forecast from './Forecast'

describe('Forecast', () => {
  it('should render the title', () => {
    const { getByText } = render(<Forecast />)

    expect(getByText('Forecast')).toBeInTheDocument()
  })

  it('should render the current forecast card', () => {
    const { getByText } = render(<Forecast />)

    expect(getByText('Current')).toBeInTheDocument()
  })

  it('should display the co2e sums ')
})
