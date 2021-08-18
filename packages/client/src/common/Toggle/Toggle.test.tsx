/*
 * © 2021 Thoughtworks, Inc.
 */

import { fireEvent, render } from '@testing-library/react'
import Toggle from './Toggle'

describe('Toggle', () => {
  it('renders a checkbox input', () => {
    const { getByRole } = render(<Toggle handleToggle={jest.fn} />)

    expect(getByRole('checkbox')).toBeInTheDocument()
  })

  it('displays with a given label', () => {
    const { getByText } = render(
      <Toggle label="My Favorite Toggle" handleToggle={jest.fn} />,
    )

    expect(getByText('My Favorite Toggle')).toBeInTheDocument()
  })

  it('calls the given handleToggle function when toggled', () => {
    const handleToggle = jest.fn()
    const { getByRole } = render(<Toggle handleToggle={handleToggle} />)

    const toggle = getByRole('checkbox')

    fireEvent.click(toggle)
    expect(handleToggle).toHaveBeenCalledWith(true)
    fireEvent.click(toggle)
    expect(handleToggle).toHaveBeenCalledWith(false)
  })
})
