/*
 * © 2021 Thoughtworks, Inc.
 */

import { Select } from '@material-ui/core'
import SelectDropdown from './SelectDropdown'
import { create } from 'react-test-renderer'
import { fireEvent, render, within } from '@testing-library/react'

describe('Select Dropdown', () => {
  const props = {
    id: 'example',
    value: 'Example Value',
    dropdownOptions: ['Option A', 'Option B', 'Option C'],
    handleChange: jest.fn(),
  }

  it('renders a Select component with appropriate props assigned', () => {
    const testRenderer = create(<SelectDropdown {...props} />)
    const testInstance = testRenderer.root
    const selectElement = testInstance.findByType(Select)

    expect(selectElement).toBeDefined()
    expect(selectElement.props.id).toBe(`${props.id}-selector`)
    expect(selectElement.props.value).toBe(props.value)
    expect(selectElement.props.onChange).toBe(props.handleChange)
    testRenderer.unmount()
  })

  it('Renders a menu item for each dropdown option passed', () => {
    const { getByRole } = render(<SelectDropdown {...props} />)

    const { dropdownOptions } = props

    // Clicks on Material UI's select element to display the popup that has the options to be queried
    fireEvent.mouseDown(getByRole('button'))
    const menuItems = within(getByRole('listbox'))

    expect(menuItems.getAllByRole('option')).toHaveLength(3)
    expect(menuItems.getByText(dropdownOptions[0])).toBeInTheDocument()
    expect(menuItems.getByText(dropdownOptions[1])).toBeInTheDocument()
    expect(menuItems.getByText(dropdownOptions[2])).toBeInTheDocument()
  })

  it('capitalizes a dropdown option for display', () => {
    const { getByRole } = render(
      <SelectDropdown {...props} dropdownOptions={['example']} />,
    )

    fireEvent.mouseDown(getByRole('button'))
    const menuItems = within(getByRole('listbox'))

    expect(menuItems.getByRole('option')).toHaveTextContent('Example')
  })

  it('should call the passed handleChange function when an option is selected', () => {
    const { getByRole } = render(<SelectDropdown {...props} />)

    fireEvent.mouseDown(getByRole('button'))
    const dropdownOptions = within(getByRole('listbox'))
    fireEvent.click(dropdownOptions.getByText('Option B'))

    expect(props.handleChange).toHaveBeenCalledTimes(1)
  })
})
