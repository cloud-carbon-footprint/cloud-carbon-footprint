/*
 * © 2021 Thoughtworks, Inc.
 */

import { fireEvent, render } from '@testing-library/react'
import SearchBar from './SearchBar'

describe('Search Bar', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    clearSearch: jest.fn(),
  }
  it('should render text field', () => {
    const { getByTestId } = render(<SearchBar {...defaultProps} />)

    expect(getByTestId('search-input')).toBeInTheDocument()
  })

  it('should display the placeholder text', () => {
    const { getByPlaceholderText } = render(<SearchBar {...defaultProps} />)

    expect(getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  it("should display a value that's pass to it", () => {
    const { getByDisplayValue } = render(
      <SearchBar {...defaultProps} value="test" />,
    )

    expect(getByDisplayValue('test')).toBeInTheDocument()
  })

  it('should call the onChange function when input is changed', () => {
    const { getByRole } = render(<SearchBar {...defaultProps} />)

    const searchBar = getByRole('textbox')

    fireEvent.change(searchBar, { target: { value: 'account 1' } })

    expect(defaultProps.onChange).toHaveBeenCalledWith('account 1')
  })

  it('should clear the search ', () => {
    const { getByLabelText } = render(<SearchBar {...defaultProps} />)

    const clearButton = getByLabelText('clear search')

    fireEvent.click(clearButton)

    expect(defaultProps.clearSearch).toHaveBeenCalled()
  })
})
