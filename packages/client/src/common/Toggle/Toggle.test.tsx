/*
 * © 2021 Thoughtworks, Inc.
 */

import { render } from '@testing-library/react'
import Toggle from './Toggle'

describe('Toggle', () => {
  it('renders a checkbox input', () => {
    const { getByRole } = render(<Toggle />)

    expect(getByRole('checkbox')).toBeInTheDocument()
  })

  it('displays with a given label', () => {
    const { getByText } = render(<Toggle label="My Favorite Toggle" />)

    expect(getByText('My Favorite Toggle')).toBeInTheDocument()
  })
})
